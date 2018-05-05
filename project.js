////////////////////////////////////////////////////////////////////////////////
// CONSTANTS 
////////////////////////////////////////////////////////////////////////////////
var data_path = "./data";

// set the dimensions and margins of the graph
var margin = {top: 80, right: 80, bottom: 80, left: 80};
var width = 800 - margin.left - margin.right;
var height = 800 - margin.top - margin.bottom;

var colorScale = d3.scaleOrdinal(d3['schemeCategory20c']);

var xVal = "date";
var yVal = "value";

// these functions are the accessors for each element in the dataset
var getX = function(d) { return d[xVal]; };
var getY = function(d) { return +d[yVal]; };

var parseTime = d3.timeParse("%Y-%m-%d");

// these are our scales for the axes
// var x = d3.scaleLinear().range([0, width]);
var x = d3.scaleTime().range([0, width]);
var y = d3.scaleLinear().range([height, 0]);

// these functions retrieve the appropriate values for the given
// element for the appropriately set scale
var getScaledX = function(d) { return x(d[xVal]); };
var getScaledY = function(d) { return y(d[yVal]); };

var svg;

////////////////////////////////////////////////////////////////////////////////
// dumb utilities
////////////////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////////////////
// add_options_to_selectbox
//
// resets a select box; adds elements; returns the value
////////////////////////////////////////////////////////////////////////////////
function add_options_to_selectbox(element_id, options) {
    var selectbox = document.getElementById(element_id);

    // reset the select box
    for(i = selectbox.options.length - 1 ; i >= 0 ; i--) {
        selectbox.remove(i);
    }

    for (var i in options) {
        var option = document.createElement("option");
        option.text = options[i];
        selectbox.add(option);
    }
}

////////////////////////////////////////////////////////////////////////////////
// set_date_element_selectbox
//
// wrapper to deal with choosing the last date/first date. basically calls
// add_options_to_selectbox and sets a value
////////////////////////////////////////////////////////////////////////////////
function set_date_element_selectbox(start, unit, path) {
    var prefix = start ? 'start' : 'end';

    return $.getJSON(path, function(list) {
        var id = prefix + '-' + unit + '-select';
        add_options_to_selectbox(id, list);

        var item = list[0];
        if (! start) {
            item = list[list.length - 1];
        }

        document.getElementById(id).value = item;
    });
}

////////////////////////////////////////////////////////////////////////////////
// get_selected
//
// returns either the date, if 'start-date' or 'end-date', or a value
////////////////////////////////////////////////////////////////////////////////
function get_selected(type) {
    if (type == 'start-date') {
        return get_date_range(true)
    }
    else if (type == 'end-date') {
        return get_date_range(false)
    }
    else {
        var id = type + '-select';
        return document.getElementById(id).value;
    }
}

////////////////////////////////////////////////////////////////////////////////
// get_path
//
// nightmare function. I'm sorry. this basically handles loading all the
// information you might possible need so that you can just call it with one of:
// - companies_list: list of companies, eg 'goog', 'aapl'
// - stat-types-list: list of stat types, eg 'MACD', 'SMA'
// - stats-list: list of stats, eg 'high', 'low', etc
// - data: actual date for a {company}/{stat-type}/{stat} combo
// - years: list of years, eg '2000', the years we have data for a given ^
// - months: list of months, eg '01', the months we have data for a given year
// and ^
// - days: list of days, eg '13', the days we have data for a given year, month,
// and ^
////////////////////////////////////////////////////////////////////////////////
function get_path(type, start) {
    var path = data_path;
    path +='/';

    if (type == 'trendlines_list')
        return path + 'trendlines.json';

    if (type == 'companies_list')
        return path + 'companies.json';

    path += get_selected('company') + '/';

    if (type == 'stat-types-list')
        return path + 'stat_types.json';

    path += get_selected('stat-type') + '/'

    if (type == 'stats-list')
        return path + 'stats_list.json';

    path += get_selected('stat');

    if (type == 'data')
        return path + '.csv';

    path += '_';

    if (type == 'years')
        return path + 'years.json';

    var prefix = start ? 'start' : 'end';

    path += get_selected(prefix + '-years') + '_';

    if (type == 'months')
        return path + 'months.json';

    return path + get_selected(prefix + '-months') + '_' + 'days.json';
}



////////////////////////////////////////////////////////////////////////////////
// set_companies
//
// initializes/handles changes for companies
////////////////////////////////////////////////////////////////////////////////
function set_companies() {
    return $.getJSON(get_path('companies_list'), function(companies_list) {
        add_options_to_selectbox('company-select', companies_list);
    }).done(function () {
        set_stat_types();
    });
}

////////////////////////////////////////////////////////////////////////////////
// set_stat_types
//
// initializes/handles changes for stat_types
////////////////////////////////////////////////////////////////////////////////
function set_stat_types() {
    return $.getJSON(get_path('stat-types-list'), function(stat_types_list) {
        add_options_to_selectbox('stat-type-select', stat_types_list);
    }).done(function() {
        set_stats_list();
    });
}

////////////////////////////////////////////////////////////////////////////////
// set_stats_list
//
// initializes/handles changes for stats_list
////////////////////////////////////////////////////////////////////////////////
function set_stats_list() {
    return $.getJSON(get_path('stats-list'), function(stats_list) {
        add_options_to_selectbox('stat-select', stats_list);
    }).done(function () {
        set_year(true).done(function() {
            set_year(false);
        });
    });
}

////////////////////////////////////////////////////////////////////////////////
// set_year
//
// initializes/handles changes for years
////////////////////////////////////////////////////////////////////////////////
function set_year(start) {
    return set_date_element_selectbox(start, 'years', get_path('years')).done(function () {
        set_month(start);
    });
}

////////////////////////////////////////////////////////////////////////////////
// set_month
//
// initializes/handles changes for month
////////////////////////////////////////////////////////////////////////////////
function set_month(start) {
    var path = get_path('months', start);
    return set_date_element_selectbox(start, 'months', path).done(function () {
        set_day(start);
    });
}

////////////////////////////////////////////////////////////////////////////////
// set_day
//
// initializes/handles changes for day
//
// TODO:
// not really a todo, but I wanted syntax highlighting to apologize for this
// hack. :(
////////////////////////////////////////////////////////////////////////////////
function set_day(start) {
    var path = get_path('days', start);
    return set_date_element_selectbox(start, 'days', path).done(function () {
        // this is an ugly ugly hack where I just assume if it's the end range,
        // I redraw the damn thing. otherwise, I call the function to set the
        // end. super ugly, super jank.
        if (! start) {
            make_plot();
        }
        else {
            set_year(false);
        }
    });
}

function get_date_range(start) {
    var prefix = start ? 'start' : 'end';

    var year = document.getElementById(prefix + '-years-select').value;
    var month = document.getElementById(prefix + '-months-select').value;
    var day = document.getElementById(prefix + '-days-select').value;

    return year + '-' + month + '-' + day;
}

////////////////////////////////////////////////////////////////////////////////
// set_trendline_list
//
// initializes/handles changes for trendline_list
////////////////////////////////////////////////////////////////////////////////
function set_trendline_list() {
    return $.getJSON(get_path('trendlines_list'), function(trendline_list) {
		console.log(trendline_list)
        add_options_to_selectbox('trendline-select', trendline_list);
    });
}

function add_trendline(data) {
	console.log("Add trendline for:") 
	console.log(data)
	var x_mean = 0;
	var y_mean = 0;
	var term1 = 0;
	var term2 = 0;

	var n = data.length;
	var n = 10;
	for (var i=0; i<n; i++) {
		x_mean += parseTime(data[i].date)
		console.log(parseTime(data[i].date))
		console.log(data[i].date)
		y_mean += data[i].value
	}
	x_mean /= n;
	y_mean /= n;
	console.log("X_mean: " + x_mean)
	console.log("Y_mean: " + y_mean)

	// Coeff
	var xr = 0;
	var yr = 0;
	for (i=0; i<n; i++) {
		xr = parseTime(data[i].date) - x_mean;
		yr = data[i].value - y_mean;
		term1 += xr * yr;
		term2 += xr * xr;
	}
	var b1 = term1 / term2;
	var b0 = y_mean - (b1 * x_mean);

	// Regression
	yhat = [];
	for (i=0; i<n; i++) {
		yhat.push(b0 + (i * b1));
	}

	var trendline = [];
	for (i=0; i<n; i++) {
		trendline.push({
			"yhat": yhat[i],
			"y": data[i].value,
			"x": parseTime(data[i].date)
		})
	}

	console.log(trendline)
	return (trendline);
}

// the way I've nested the functions means this call sets everything up. :)
set_companies();
set_trendline_list();

// do actual drawing here
function make_plot() {
    var company = get_selected('company');
    var stat = get_selected('stat');

    var start = get_date_range(true);
    var end = get_date_range(false);

    var path = get_path('data');

    d3.csv(path, function(error, data) {
        data.forEach(function(d) {
            d.date = parseTime(d.date);
            d.value = +d.value;
        });

        var existing = document.getElementById('visvis');
        if (existing) {
            existing.remove();
        }

        var title = company + " stock value for stat " + stat + " between " + start + " and " + end;

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

        x.domain(d3.extent(filtered, getX));
        y.domain(d3.extent(filtered, getY));
		add_trendline(data)

        svg = getSVGWithLabelsAndAxes('#visualization', x, y, title, "date", stat);

        // gridlines code credit to: 
        // https://bl.ocks.org/d3noob/c506ac45617cf9ed39337f99f8511218
        // gridlines in x axis function
        function make_x_gridlines() {
            return d3.axisBottom(x)
                .ticks(5)
        }

        // gridlines in y axis function
        function make_y_gridlines() {
            return d3.axisLeft(y)
                .ticks(5)
        }

        // add the X gridlines
        svg.append("g")
            .attr("class", "grid")
            .attr("transform", "translate(0," + height + ")")
            .call(make_x_gridlines()
                .tickSize(-height)
                .tickFormat("")
            )

        // add the Y gridlines
        svg.append("g")
            .attr("class", "grid")
            .call(make_y_gridlines()
                .tickSize(-width)
                .tickFormat("")
            )

        svg.selectAll(".vis2-dot")
            .data(filtered)
            .enter()
            .append("circle")
            .attr("cx", getScaledX)
            .attr("cy", getScaledY)
            .attr("r", 2)
			.style("fill", "blue")
    });
}



// this function takes in six parameters:
// 1. an element to append an SVG to
// 2. an x-axis
// 3. a y-axis
// 4. a graph label
// 5. an x label
// 6. an y label
// 
// it does the gruntwork of:
// - making the svg the right size
// - adding the x- and y-axes to the graph
// - labelling those axes
function getSVGWithLabelsAndAxes(element, x_axis, y_axis, label, x_label, y_label) {
    var svg = d3.select(element).append("svg")
        .attr("id", "visvis")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate("+ margin.left + "," + margin.top + ")");

    // x-axis
    svg.append("g")
        .attr("transform", "translate(0, " + height + ")")
        .call(d3.axisBottom(x_axis));

    // y-axis
    svg.append("g")
        .call(d3.axisLeft(y_axis));

    if (label) {
        svg.append("text")
            .attr("x", (width / 2))             
            .attr("y", 0 - (margin.top / 3))
            .attr("text-anchor", "middle")  
            .style("font-size", "16px") 
            .style("text-decoration", "underline")  
            .text(label);
    }

    // credit for fancy axis labels: https://bl.ocks.org/d3noob/23e42c8f67210ac6c678db2cd07a747e
    // text label for the x axis
    svg.append("text")             
        .attr("transform",
                "translate(" + (width/2) + " ," + 
                            (height + margin.top - 20) + ")")
        .style("text-anchor", "middle")
        .text(x_label);

    // text label for the y axis
    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left + 10)
        .attr("x", 0 - (height / 2))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text(y_label);      


    return svg;
}
