////////////////////////////////////////////////////////////
// CONSTANTS
////////////////////////////////////////////////////////////
var glob_x;
var glob_y;
var lowdata;
var closedata;
var highdata;
var narr_start = '2018-01-01';
var narr_end = '2018-01-30';
var narr_company = 'aapl';


make_vis1_plot();
make_tech_analy_plot("#smavis", 1);
make_tech_analy_plot("#emavis", 3);

function add_vis1_line(path, svg, color, locGetScaledX, locGetScaledY, height, parsed_start, parsed_end) {
    d3.csv(path, function(error, data) {
        if (path.includes("low")) {
          lowdata = data;
        } else if (path.includes("close")) {
          closedata = data;
        } else if (path.includes("high")) {
          highdata = data;
        }

        data.forEach(function(d) {
            d.date = parseTime(d.date);
            d.value = +d.value;
        });

        var filtered = [];
        for (var i in data) {
            var point = data[i];
            if (point.date > parsed_start && point.date < parsed_end) {
                filtered.push(point);
            }
        }

        // plot a linegraph
        var line = d3.line()
                      .x(locGetScaledX)
                      .y(locGetScaledY);
        svg.append("path")
            .datum(filtered)
            .attr("fill", "none")
            .attr("stroke", color)
            .attr("stroke-linejoin", "round")
            .attr("stroke-linecap", "round")
            .attr("stroke-width", 2.0)
            .attr("d", line);
    });
}

// do actual drawing here
function make_vis1_plot() {
    var margin = {top: 60, right: 60, bottom: 60, left: 60};
    var width = 800 - margin.left - margin.right;
    var height = 400 - margin.top - margin.bottom;

    // these are our scales for the axes
    // var x = d3.scaleLinear().range([0, width]);
    var locx = d3.scaleTime().range([0, width]);
    var locy = d3.scaleLinear().range([height, 0]);
    glob_x = locx
    glob_y = locy

    // these functions retrieve the appropriate values for the given
    // element for the appropriately set scale
    var locGetScaledX = function(d) { return locx(d[xVal]); };
    var locGetScaledY = function(d) { return locy(d[yVal]); };

    var path = "./data/aapl/TIME_SERIES_DAILY_ADJUSTED/high.csv"

    d3.csv(path, function(error, data) {
        data.forEach(function(d) {
            d.date = parseTime(d.date);
            d.value = +d.value;
        });

        var title = "AAPL " + "between " + narr_start + " and " + narr_end;

        // have to filter stuff
        var parsed_start = parseTime(narr_start);
        var parsed_end = parseTime(narr_end);

        var filtered = [];
        for (var i in data) {
            var point = data[i];
            if (point.date > parsed_start && point.date < parsed_end) {
                filtered.push(point);
            }
        }

        rangeY = d3.extent(filtered, getY);
        rangeY[0] -= 4;
        locx.domain(d3.extent(filtered, getX));
        locy.domain(rangeY)

        thissvg = getSVGWithLabelsAndAxes('#pricevis', locx, locy, title, "Date", "Price", margin, width, height, "visvis1");

        // gridlines code credit to:
        // https://bl.ocks.org/d3noob/c506ac45617cf9ed39337f99f8511218
        // gridlines in x axis function
        function make_x_gridlines() {
            return d3.axisBottom(locx)
                .ticks(5)
        }

        // gridlines in y axis function
        function make_y_gridlines() {
            return d3.axisLeft(locy)
                .ticks(5)
        }

        // add the Y gridlines
        thissvg.append("g")
            .attr("class", "grid")
            .call(make_y_gridlines()
                .tickSize(-width)
                .tickFormat("")
            )

        // plot a linegraph
        var color = "gray"
        var line = d3.line()
                      .x(locGetScaledX)
                      .y(locGetScaledY);
        thissvg.append("path")
            .datum(filtered)
            .attr("fill", "none")
            .attr("stroke", color)
            .attr("stroke-linejoin", "round")
            .attr("stroke-linecap", "round")
            .attr("stroke-width", 2.0)
            .attr("d", line);
        thissvg.append("rect")
            .attr("class", "overlay")
            .attr("width", width)
            .attr("height", height)
            .on("mouseover", handleGraphMouseoverEvent)
            .on("mouseout", handleGraphMouseoutEvent)
            .on("mousemove", handleGraphMousemove);

        var path1 = "./data/aapl/TIME_SERIES_DAILY_ADJUSTED/close.csv"
        var path2 = "./data/aapl/TIME_SERIES_DAILY_ADJUSTED/low.csv"
        add_vis1_line(path1, thissvg, "red", locGetScaledX, locGetScaledY, height, parsed_start, parsed_end);
        add_vis1_line(path2, thissvg, "gray", locGetScaledX, locGetScaledY, height, parsed_start, parsed_end);

        if (path.includes("low")) {
          lowdata = data;
        } else if (path.includes("close")) {
          closedata = data;
        } else if (path.includes("high")) {
          highdata = data;
        }

    });
}

function handleGraphMouseoverEvent(d, i) {
    handleGraphMousemove(d, i);
}

function handleGraphMouseoutEvent(d, i) {
    // outline on mousover
    d3.select("body #tooltip")
        .style("opacity", 0)
        .style("left", "0px")
        .style("top", "0px");
}

function dataBisector(data, i) {
  var b = d3.bisector(function(d) { return d.date; });
  return b.left(data, i);
}

/* CODE CREDIT FOR MOUSEMOVE: Mike Bostock, https://bl.ocks.org/mbostock/3902569 */
function handleGraphMousemove(d, i) {
    coordinates = d3.mouse(this);
    var x = coordinates[0];
    var y = coordinates[1];
    var x0 = glob_x.invert(d3.mouse(this)[0]);
    low = dataBisector(lowdata, x0);
    close = dataBisector(closedata, x0);
    high = dataBisector(highdata, x0);
    d3.select("body #tooltip")
      .style("opacity", 0.8)
      .style("left", (d3.event.pageX + 5) + "px")
      .style("top", (d3.event.pageY + 5) + "px");
    d3.select("body #tooltip")
      .html("<p style='margin:0px;'>Low: " + lowdata[low].value + "<br />High: " + highdata[high].value + "<br /><b>Close: " + closedata[close].value + "</b></p>");

}

function make_tech_analy_plot(elem, index) {
    var margin = {top: 60, right: 60, bottom: 60, left: 60};
    var width = 800 - margin.left - margin.right;
    var height = 400 - margin.top - margin.bottom;

    // these are our scales for the axes
    var locx = d3.scaleTime().range([0, width]);
    var locy = d3.scaleLinear().range([height, 0]);
    glob_x = locx
    glob_y = locy

    // these functions retrieve the appropriate values for the given
    // element for the appropriately set scale
    var locGetScaledX = function(d) { return locx(d[xVal]); };
    var locGetScaledY = function(d) { return locy(d[yVal]); };

    var path = "./data/aapl/TIME_SERIES_DAILY_ADJUSTED/close.csv"

    d3.csv(path, function(error, data) {
        data.forEach(function(d) {
            d.date = parseTime(d.date);
            d.value = +d.value;
        });

        var title = "AAPL " + "between " + narr_start + " and " + narr_end;

        // have to filter stuff
        var parsed_start = parseTime(narr_start);
        var parsed_end = parseTime(narr_end);

        var filtered = [];
        for (var i in data) {
            var point = data[i];
            if (point.date > parsed_start && point.date < parsed_end) {
                filtered.push(point);
            }
        }

        rangeY = d3.extent(filtered, getY);
        rangeY[0] -= 4;
        locx.domain(d3.extent(filtered, getX));
        locy.domain(rangeY)

        thissvg = getSVGWithLabelsAndAxes(elem, locx, locy, title, "Date", "Price", margin, width, height, "visvis2");

        // gridlines code credit to:
        // https://bl.ocks.org/d3noob/c506ac45617cf9ed39337f99f8511218
        // gridlines in x axis function
        function make_x_gridlines() {
            return d3.axisBottom(locx)
                .ticks(5)
        }

        // gridlines in y axis function
        function make_y_gridlines() {
            return d3.axisLeft(locy)
                .ticks(5)
        }

        // add the Y gridlines
        thissvg.append("g")
            .attr("class", "grid")
            .call(make_y_gridlines()
                .tickSize(-width)
                .tickFormat("")
            )

        // plot a linegraph
        var color = "red"
        var line = d3.line()
                      .x(locGetScaledX)
                      .y(locGetScaledY);
        thissvg.append("path")
            .datum(filtered)
            .attr("fill", "none")
            .attr("stroke", color)
            .attr("stroke-linejoin", "round")
            .attr("stroke-linecap", "round")
            .attr("stroke-width", 3.0)
            .attr("data-legend", "AAPL Closing Price")
            .attr("d", line);

        /* draw technical indicator. */
        path = "./data/aapl/" + stat_list[index] + '/' + tech_inds_stats[index] + ".csv";
        narrative_add_indicator(path, stat_list[index], index, thissvg, locGetScaledX, locGetScaledY);
    });
}

function narrative_add_indicator(path, stat_type, index, thissvg, scaledX, scaledY) {
    d3.csv(path, function(error, data) {
        data.forEach(function(d) {
            d.date = parseTime(d.date);
            d.value = +d.value;
        });

        /* filter data by date */
        var parsed_start = parseTime(narr_start);
        var parsed_end = parseTime(narr_end);
        var filtered = [];
        for (var i in data) {
            var point = data[i];
            if (point.date > parsed_start && point.date < parsed_end) {
                filtered.push(point);
            }
        }

        // plot a linegraph
        var color = indicator_colors[index];
        var line = d3.line()
                      .x(scaledX)
                      .y(scaledY);
        thissvg.append("path")
            .attr("class", stat_type)
            .datum(filtered)
            .attr("fill", "none")
            .attr("stroke", color)
            .attr("stroke-linejoin", "round")
            .attr("stroke-linecap", "round")
            .attr("stroke-width", 3.0)
            .attr("data-legend", "SMA")
            .attr("d", line);

    });
}




