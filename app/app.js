import d3 from "d3";
require("./style/style.less");

var color = d3.scale.ordinal()
  .range(["#98abc5", "#9d9fb3", "#a092a1", "#a2868f", "#a37a7d", "#a26e6c",
    "#a1615b", "#a55f54", "#ad6350", "#b4664c", "#bc6a48", "#c46e44",
    "#cb723f", "#d2753a", "#da7935", "#e17d2f", "#e98028", "#f0841f",
    "#f88814", "#ff8c00"
  ]);

var color2 = d3.scale.ordinal()
  .range(["#98abc5", "#9aa7bf", "#9ca3b8", "#9d9eb2", "#9e9aac", "#9f95a5", "#a0919f", "#a18c99", "#a28892", "#a2848c", "#a38086", "#a37c7f", "#a37779", "#a37373", "#a26f6d", "#a26a67", "#a16661", "#a1615b", "#a26059", "#a46056", "#a55f54", "#a86152", "#ab6251", "#ae6350", "#b0644e", "#b3654d", "#b5674b", "#b8684a", "#bb6949", "#be6b47", "#c06c46", "#c36e44", "#c66f43", "#c87041", "#cb723f", "#cd733d", "#d0743c", "#d2753a", "#d57638", "#d87836", "#db7935", "#dd7b33", "#df7c30", "#e27d2e", "#e57e2c", "#e87f29", "#ea8126", "#ed8223", "#ef8420", "#f2851d", "#f58619", "#f88815", "#fa890f", "#fd8b08", "#ff8c00"]);

function getSymbolsArray(d, valuePerSymbol, param) {
  var nmbSymbols = Math.floor(d[param] / valuePerSymbol);
  var symbolsArray = [];
  var remainder = (d[param] - valuePerSymbol * (nmbSymbols - 1)) / valuePerSymbol;

  for (var i = 0; i < nmbSymbols; i++) {
    var percentage = i < (nmbSymbols - 1) ? 1 : remainder;
    symbolsArray.push({
      key: d.key,
      value: d[param],
      percentage: percentage,
      nmbSymbols: nmbSymbols
    });
  }
  return symbolsArray;
}

function addPictosVertChart(g, xCatScale, height) {
  // Natural Science
  // var clip = g.append("svg:clipPath")
  //   .attr("id", "natSciClip")
  //   .append("rect")
  //   .attr("width", 100)
  //   .attr("height", 200)
  //   .attr("x", xCatScale("picNatSci") + 50)
  //   .attr("y", height - 110);

  g
    .append("svg:image")
    .attr("x", xCatScale("picNatSci"))
    .attr("y", height - 110)
    .attr("width", 130)
    .attr("height", 110)
    .attr("transform", "translate(" + [25, 0] + ")")
    .attr("xlink:href", "pics/formula.png")
    .attr("clip-path", "url(#natSciClip)");

  // social sciences
  g
    .append("svg:image")
    .attr("x", xCatScale("picSocSci"))
    .attr("y", height - 100)
    .attr("transform", "translate(" + [60, 0] + ")")
    .attr("width", 90)
    .attr("height", 110)
    .attr("xlink:href", "pics/desk.png");

  // humanities
  g
    .append("svg:image")
    .attr("x", xCatScale("picHumanities"))
    .attr("y", height - 105)
    .attr("transform", "translate(" + [40, 0] + ")")
    .attr("width", 100)
    .attr("height", 110)
    .attr("xlink:href", "pics/artist.png");

  //// others
  g
    .append("svg:image")
    .attr("x", xCatScale("picOthers"))
    .attr("y", height - 105)
    .attr("transform", "translate(" + [30, 0] + ")")
    .attr("width", 100)
    .attr("height", 110)
    .attr("xlink:href", "pics/doctor.png");

}

function createSubVertChart(args) {

  console.log("Args", args);

  var xScale = d3.scale.ordinal();

  var xAxis = d3.svg.axis()
    .scale(xScale)
    .orient("bottom");

  var sorted_data = args.data.sort(function(a, b) {
    return b.income - a.income;
  });

  xScale.domain(sorted_data.map(function(d) {
    return d.key;
  })).rangeRoundBands([20, args.cluster.len]);

  args.g.append("g")
    .attr("id", args.id)
    .attr("transform", function(d) {
      return "translate(" + args.pos + ",0)";
    })
    .append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + (args.cluster.height + 0) + ")")
    .call(xAxis.tickSize(5, 10, 0))
    .selectAll("text")
    .style("text-anchor", "end")
    .attr("dx", "-.8em")
    .attr("dy", "-.17em")
    .attr("transform", function(d) {
      return "rotate(-65)";
    });

  var xPadding = 4; // to add spacing between objects
  var size = 1 - xPadding / 100;

  var circleCont = d3.selectAll("#" + args.id).selectAll(".circles")
    .data(args.data)
    .enter()
    .append("g");

  var valuePerSymbol = 300;
  var r = (-(args.yScale(2 * valuePerSymbol) - args.yScale(valuePerSymbol))) / 2;
  console.log("Radius", r);

  // the bars" contents
  circleCont.selectAll("circle")
    .data(function(d) {
      return getSymbolsArray(d, valuePerSymbol, "income");
    })
    .enter()
    .append("circle")
    .attr("class", "item")
    .attr("r", r)
    .attr("fill", function(d, i) {
      return color(i);
    })
    .attr("transform", function(d, i) {
      var xPos = xScale(d.key) + xScale.rangeBand() / 2; // (leftmost point of bar) + (bar width/2)
      var yPos = args.yScale(i * valuePerSymbol + valuePerSymbol / 2);
      d.x = xPos;
      d.y = yPos;

      return "translate(" + [xPos, yPos] + ")";
    });

  var diameter = 2 * r;
  circleCont.each(function(g) {
    var circles = d3.select(this).selectAll("circle");
    circles.each(function(c) {
      if (c.percentage > 1) {
        var rectLen = (c.percentage - 1) * diameter;
        console.log("len", rectLen);
        var clip = d3.select("svg").append("svg:clipPath")
          .attr("id", c.key)
          .append("rect")
          .attr("width", diameter)
          .attr("height", rectLen)
          .attr("x", -r)
          .attr("y", r - rectLen);

        console.log("C", c);
        d3.select(this).attr("clip-path", function(d) {
          return "url(#" + c.key + ")";
        });
      }
    });
  });

}

function createOuterVertChart(args) {

  var svg = d3.select("#vertChart").append("svg")
    .attr("id", "vertChart")
    .attr("width", args.width + args.margin.left + args.margin.right)
    .attr("height", args.height + args.margin.top + args.margin.bottom)
    .append("g")
    .attr("transform", "translate(" + args.margin.left + "," + args.margin.top + ")");

  var y = d3.scale.linear()
    .range([args.height, 0])
    .domain([0, d3.max(args.data, function(d) {
      return d.Income;
    })]);

  var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left")
    .ticks(5, "$");

  var sumIncome = d3.sum(args.data, function(d) {
    return d.Income;
  });

  //// Horizontal grid
  svg.insert("g", ".bars")
    .attr("class", "grid")
    .call(d3.svg.axis().scale(y)
      .orient("left")
      .tickSize(-(args.width), 0, 0)
      .tickFormat("")
    );

  // only for the mean line
  var x2 = d3.scale.ordinal()
    .rangeBands([0, args.width], 0);

  x2.domain(args.data.map(function(d) {
    return d.Income;
  }));

  var line = d3.svg.line()
    .x(function(d, i) {
      return x2(d.Income);
    })
    .y(function(d, i) {
      return y(sumIncome / args.data.length);
    });

  svg.append("path")
    .datum(args.data)
    .attr("class", "line")
    .style("stroke-dasharray", ("3, 3"))
    .attr("d", line);

  svg.append("g")
    .attr("class", "axis")
    .call(yAxis)
    .append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 6)
    .attr("dy", ".71em")
    .style("text-anchor", "end")
    .text("Income");

  // d3.select("g.y.axis path").remove();

  // TODO
  //svg.append("g")
  //.attr("class", "x axis")
  //.attr("transform", "translate(0," + (height + 24) + ")")
  //.call(catAxis);
  //

  var xCatScale = d3.scale.ordinal()
    .domain(args.categoriesWithPictures)
    .rangeRoundBands([0, args.width]);

  createSubVertChart({
    g: svg,
    id: "natSci",
    cluster: args.cluster,
    yScale: y,
    data: args.asso_data.natSci,
    pos: xCatScale("natSci")
  });

  createSubVertChart({
    g: svg,
    id: "socSci",
    cluster: args.cluster,
    yScale: y,
    data: args.asso_data.socSci,
    pos: xCatScale("socSci")
  });

  createSubVertChart({
    g: svg,
    id: "humanities",
    cluster: args.cluster,
    yScale: y,
    data: args.asso_data.humanities,
    pos: xCatScale("humanities")
  });

  createSubVertChart({
    g: svg,
    id: "others",
    cluster: args.cluster,
    yScale: y,
    data: args.asso_data.others,
    pos: xCatScale("others")
  });

  // add images on the right side of each group
  addPictosVertChart(svg, xCatScale, args.height);
}

function createSubHorChart(args) {

  var maxPeople = d3.max(args.data, function(d) {
    return d.people;
  });

  var innerYScale = d3.scale.ordinal()
    .domain(args.data.map(function(e) {
      return e.key;
    }))
    .rangeRoundBands([0, args.width], 1, 0.1);

  var g = args.svg.append("g")
    .attr("transform", function() {
      return "translate(" + [args.xPadding, args.yPos] + ")";
    });

  var innerYAxis = d3.svg.axis()
    .scale(innerYScale)
    .orient("left");

  g.append("g")
    .attr("class", "axis")
    .attr("id", "innerYAxis")
    .call(innerYAxis.tickSize(5, 0, 0))
    .selectAll("text")
    .style("text-anchor", "end")
    .attr("dx", "-.8em")
    .attr("dy", "-.17em")
    .attr("transform", function(d) {
      return "rotate(-10)";
    });


  var sorted_data = args.data.sort(function(a, b) {
    return a.people - b.people;
  });

  var circleCont = g.selectAll(".circles")
    .data(args.data.sort(function(a, b) {
      return b.people - a.people;
    }))
    .enter()
    .append("g");

  var valuePerSymbol = 200;
  var r = (+(args.xScale(2 * valuePerSymbol) - args.xScale(valuePerSymbol))) / 2;

  // the bars" contents
  circleCont.selectAll("circle")
    .data(function(d) {
      return getSymbolsArray(d, valuePerSymbol, "people");
    })
    .enter()
    .append("circle")
    .attr("class", "item")
    .attr("r", r)
    .attr("fill", function(d, i) {
      return color2(i);
    })
    .attr("transform", function(d, i) {
      var yPosition = innerYScale(d.key) + innerYScale.rangeBand() / 2; // (leftmost point of bar) + (bar width/2)
      return "translate(" + [args.xScale(i * valuePerSymbol + valuePerSymbol / 2), yPosition] + ")";
    });

  var diameter = 2 * r;
  circleCont.each(function() {
    var circles = d3.select(this).selectAll("circle");
    circles.each(function(c) {
      //TODO: verfiy
      if (c.percentage > 1) {
        var rectLen = (c.percentage - 1) * diameter;

        var clip = circleCont.append("svg:clipPath")
          .attr("id", c.key + "hor")
          .append("rect")
          .attr("width", rectLen)
          .attr("height", diameter)
          .attr("x", -r)
          .attr("y", -r);
        d3.select(this).attr("clip-path", "url(#" + c.key + "hor)");
      }
    });
  });

  g.select("#horYaxis").selectAll(".tick").each(function(d) {
    console.log("tick", d);
    var p = d3.select(this);
    p.select("text").remove();

    var path;
    switch (d) {
      case "others":
        path = "/pics/doctor.png";
        break;
      case "natSci":
        path = "/pics/formula.png";
        break;
      case "socSci":
        path = "/pics/desk.png";
        break;
      case "humanities":
        path = "/pics/artist.png";
        break;
    }

    p.append("image")
      .attr({
        "xlink:href": path,
        "width": 60,
        "height": 100,
        "transform": "translate(-50, -50)",
        "position": "absolute",
        "clip-path": "url(#clip)"
      });
  });
}

function createOuterHorChart(data, asso_data, categories, width, height, margin) {
  var yPadding = 0;
  var xPadding = 150;
  var horHeight = 600;

  // console.log("height", height);
  var svg = d3.select("#horChart").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", horHeight + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  var yCatScale = d3.scale.ordinal()
    .domain(categories)
    .rangeRoundBands([0, horHeight], 0.2, 0.0);

  var outerYaxis = d3.svg.axis()
    .scale(yCatScale)
    .orient("left");

  var xScale = d3.scale.linear()
    .range([0, width - xPadding])
    .domain([0, d3.max(data, function(d) {
      return d.people;
    })]);

  //TODO:rename, create new scale
  var xAxis = d3.svg.axis()
    .scale(xScale)
    .orient("bottom");

  svg.append("g")
    .attr("class", "")
    .attr("id", "horYaxis")
    .call(outerYaxis.tickSize(0, 0, 0));

  svg.select("#horYaxis").selectAll(".tick").each(function(d) {
    var p = d3.select(this);
    p.select("text").remove();

    var path;
    var transX;
    var transY;
    var widthPic;
    var heightPic;
    switch (d) {
      case "natSci":
        path = "/pics/formula.png";
        transX = -50;
        transY = -40;
        widthPic = 100;
        heightPic = 100;
        break;
      case "socSci":
        path = "/pics/desk.png";
        transX = -40;
        transY = -40;
        widthPic = 80;
        heightPic = 80;
        break;
      case "humanities":
        path = "/pics/artist.png";
        transX = -50;
        transY = -40;
        widthPic = 100;
        heightPic = 100;
        break;
      case "others":
        path = "/pics/doctor.png";
        transX = -50;
        transY = -65;
        widthPic = 100;
        heightPic = 100;
        break;
    }

    p.append("image")
      .attr("class", "clip-me")
      .attr({
        "xlink:href": path,
        "width": widthPic,
        "height": heightPic,
        "transform": "translate(" + [transX, transY] + ")",
        "position": "absolute",
        "clip-path": "url(#clip)"
      });

  });

  svg.append("g")
    .attr("class", "x axis")
    .attr("transform", function() {
      return "translate(" + [xPadding, horHeight - 30] + ")";
    })
    .call(xAxis)
    .append("text")
    .attr("y", 6)
    .attr("x", -20)
    .attr("dy", ".71em")
    .style("text-anchor", "end")
    .text("People");

  // Vertical grid
  svg.insert("g", ".bars")
    .attr("class", "grid vertical")
    .attr("transform", "translate(" + [xPadding, horHeight - 30] + ")")
    .call(d3.svg.axis().scale(xScale)
      .orient("bottom")
      .tickSize(-(horHeight - 30), 0, 0)
      .tickFormat("")
    );

  createSubHorChart({
    data: asso_data.natSci,
    svg: svg,
    margin: margin,
    height: height,
    width: 120,
    xScale: xScale,
    yPos: yCatScale("natSci"),
    xPadding: xPadding
  });

  createSubHorChart({
    data: asso_data.socSci,
    svg: svg,
    margin: margin,
    height: height,
    width: 120,
    xScale: xScale,
    yPos: yCatScale("socSci"),
    xPadding: xPadding
  });

  createSubHorChart({
    data: asso_data.humanities,
    svg: svg,
    margin: margin,
    height: height,
    width: 120,
    xScale: xScale,
    yPos: yCatScale("humanities"),
    xPadding: xPadding
  });

  createSubHorChart({
    data: asso_data.others,
    svg: svg,
    margin: margin,
    height: height,
    width: 80,
    xScale: xScale,
    yPos: yCatScale("others"),
    xPadding: xPadding
  });
}

(function() {
  //var cont = d3.selectAll("#verticalChart");

  // TODO: make more versatile
  var margin = {
      top: 20,
      right: 80,
      bottom: 115,
      left: 80
    },
    width = 1250 - margin.left - margin.right,
    height = 520 - margin.top - margin.bottom;

  var cluster = {
    len: 200,
    margin: 100,
    height: height
  };


  var natSci = ["Architecture", "Computer", "Engineering",
    "Mathematics", "Natural science"
  ];

  var socSci = ["Psychology", "Communications", "Social science",
    "Education", "Business"
  ];

  var humanities = ["Liberal arts", "Foreign language", "Literature",
    "Philosophy"
  ];

  var others = ["Health sciences", "Agriculture", "Other"];


  var categories = ["natSci", "socSci", "humanities", "others"];
  var categoriesWithPictures = ["natSci", "picNatSci", "socSci", "picSocSci",
    "humanities", "picHumanities", "others",
    "picOthers"
  ];

  d3.csv("/earningsByBachelorDegree.csv", function(error, rawData) {

    var data = rawData.map(function(d) {
      for (var property in d) {
        if (d.hasOwnProperty(property)) {
          if (property !== "Field") {
            d[property] = Number(d[property].replace(/[^0-9\.]+/g, ""));
          }
        }
      }
      return d;
    });

    var keys = d3.map(data, function(d) {
      return d.Field;
    }).keys();

    // TODO
    data.forEach(function(d) {
      d.people = d["Number of people"];
      if (natSci.indexOf(d.Field) !== -1) {
        d.category = "natSci";
        d.imagePath = "pics/formula.gif";
      } else {
        if (socSci.indexOf(d.Field) !== -1) {
          d.category = "socSci";
          d.imagePath = "pics/desk.gif";
        } else {
          if (humanities.indexOf(d.Field) !== -1) {
            d.category = "humanities";
            d.imagePath = "pics/artist.gif";
          } else {
            d.category = "others";
            d.imagePath = "pics/doctor.gif";
          }
        }
      }
    });

    var nested_data = d3.nest()
      .key(function(d) {
        return d.category;
      })
      .key(function(d) {
        return d.Field;
      })
      .rollup(function(leaves) {
        return {
          income: leaves[0].Income,
          people: leaves[0].people
        };
      })
      .entries(data);

    // clean data
    var clean_data = nested_data.map(function(d) {
      var values = d.values.map(function(e) {
        return {
          key: e.key,
          income: e.values.income,
          people: e.values.people
        };
      });
      return {
        key: d.key,
        values: values
      };
    });

    var asso_data = {};

    clean_data.forEach(function(d) {
      asso_data[d.key] = d.values;
    });

    // ++++++++++++++++ Vert Chart +++++++++++++++++++++++++++++++
    createOuterVertChart({
      data: data,
      asso_data: asso_data,
      categories: categories,
      categoriesWithPictures: categoriesWithPictures,
      width: width,
      height: height,
      margin: margin,
      cluster: cluster
    });

    // ++++++++++++++++ Hor Chart +++++++++++++++++++++++++++++++
    createOuterHorChart(data, asso_data, categories, width, height, margin);

    d3.selectAll("*").on("click", function(d) {
      console.log(d);
    });
 });
})();
