////////////////////////////////////////////////////////////
// CONSTANTS
////////////////////////////////////////////////////////////

make_vis1_plot()

function add_vis1_line(path, svg, color, locGetScaledX, locGetScaledY, height, parsed_start, parsed_end) {
    d3.csv(path, function(error, data) {
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


function add_shade_down(path, svg, color, locGetScaledX, locGetScaledY, height, parsed_start, parsed_end) {
    d3.csv(path, function(error, data) {
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
        var area = d3.area()
          .x(locGetScaledX)
          .y0(height)
          .y1(locGetScaledY);

        // add the area
        svg.append("path")
           .data([data])
           .attr("class", "area")
           .attr("d", area);
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

    // these functions retrieve the appropriate values for the given
    // element for the appropriately set scale
    var locGetScaledX = function(d) { return locx(d[xVal]); };
    var locGetScaledY = function(d) { return locy(d[yVal]); };

    var start = '2018-01-01';
    var end = '2018-01-30';

    var path = "./data/aapl/TIME_SERIES_DAILY_ADJUSTED/high.csv"

    d3.csv(path, function(error, data) {
        data.forEach(function(d) {
            d.date = parseTime(d.date);
            d.value = +d.value;
        });

        var title = "AAPL " + "between " + start + " and " + end;

        // have to filter stuff
        var parsed_start = parseTime(start);
        var parsed_end = parseTime(end);

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

        svg = getSVGWithLabelsAndAxes('#pricevis', locx, locy, title, "Date", "Price", margin, width, height, "visvis1");

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
        svg.append("g")
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
        svg.append("path")
            .datum(filtered)
            .attr("fill", "none")
            .attr("stroke", color)
            .attr("stroke-linejoin", "round")
            .attr("stroke-linecap", "round")
            .attr("stroke-width", 2.0)
            .attr("d", line);

        var path1 = "./data/aapl/TIME_SERIES_DAILY_ADJUSTED/close.csv"
        var path2 = "./data/aapl/TIME_SERIES_DAILY_ADJUSTED/low.csv"
        add_vis1_line(path1, svg, "red", locGetScaledX, locGetScaledY, height, parsed_start, parsed_end);
        add_vis1_line(path2, svg, "gray", locGetScaledX, locGetScaledY, height, parsed_start, parsed_end);
    });
}

