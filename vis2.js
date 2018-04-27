// set the dimensions and margins of the graph
var margin = {top: 80, right: 80, bottom: 80, left: 80};
var width = 800 - margin.left - margin.right;
var height = 800 - margin.top - margin.bottom;

var colorScale = d3.scaleOrdinal(d3['schemeCategory20c']);

var xVal = "p";
var yVal = "n";

// these functions are the accessors for each element in the dataset
var getX = function(d) { return +d[xVal]; };
var getY = function(d) { return +d[yVal]; };

// these are our scales for the axes
var x = d3.scaleLinear().range([0, width]);
var y = d3.scaleLinear().range([height, 0]);

// these functions retrieve the appropriate values for the given
// element for the appropriately set scale
var getScaledX = function(d) { return x(d[xVal]); };
var getScaledY = function(d) { return y(d[yVal]); };

var svg;

// draw_plot("How easy it will make life", "I have no fears about a more connected future");

function get_the_buttons() {
    d3.csv("./output.csv", function(error, data) {
        var positives = {};
        var negatives = {};

        for (var i in data) {
            var row = data[i]

            if (row.sentiment === 'positive') {
                positives[row.question] = 1;
            }
            else {
                negatives[row.question] = 1;
            }
        }

        var bad_entries = [
            " Islamic Republic of",
            " Federated States of",
            " The Democratic Republic of the",
            " U.S.",
            " United Republic of",
            " Republic of",
            "undefined",
        ];

        for (var i in bad_entries) {
            delete positives[bad_entries[i]];
            delete negatives[bad_entries[i]];
        }

        for (var k in negatives) {
            if (k.indexOf('touch') > 0 || k.indexOf('save') > 0){
                delete negatives[k];
            }
        }

        var positive_selectbox = document.getElementById('positives');

        for (var positive in positives) {
            var option = document.createElement("option");
            option.text = positive;
            positive_selectbox.add(option);
        }


        positive_selectbox.remove(positive_selectbox.selectedIndex);

        var negative_selectbox = document.getElementById('negatives');

        for (var negative in negatives) {
            var option = document.createElement("option");
            option.text = negative;
            negative_selectbox.add(option);
        }

        negative_selectbox.remove(negative_selectbox.selectedIndex);

        make_plot();
    });
}

function make_plot() {
    var positive_selectbox = document.getElementById('positives');
    var positive = positive_selectbox.value;
    var negative_selectbox = document.getElementById('negatives');
    var negative = negative_selectbox.value;

    draw_plot(positive, negative);
}

get_the_buttons()


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
