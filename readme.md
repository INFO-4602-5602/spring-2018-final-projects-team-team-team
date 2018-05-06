# Final Project:
- Josiah Buxton
- Chris Godley
- Brian Lubars
- Kenneth (Hunter) Wapman

## Contributions:
# Chris:
I implemented the line fitting drop down menu and functionality for this project. I implemented
a linear best-fit line to show any overall trends, as well as a curve fit via d3's curveLinear fit.
The straight linear fit can give an immediate view of whether a stock is trending upward or downward
over the selected time window. The curveLinear fit is useful for stocks that are more volatile, or
if data appears more sparse.

Design Process:

With the basic stock plotting working, I wanted to add a supplement that would be useful. The
main page of our visualization will have a drop down menu for line fitting, offering 'none',
'linear', or 'curve-fit' views. The selection is caught by triggering an on-change event to
update an internal variable in the javascript. A function is called by the change event that
also calls the make_plot() function so that the appropriate trend line can be drawn. For the linear
fit, an intermediary function was required to generate the linear points. The mean of the orginally
view-filtered data is calculated and then a y_hat value is calculated based on the overall trend. This
is the same function called for the curve fit, but when the filtered data is passed through to the
same function a fitted curve is maintained. A lineFunction was defined to use the d3.curveLinear()
to plot the line. To populate the drop down menu, another function was written to grab the appropriate
values from the data/trendlines.json file. More trendlines may be added here, but these are the two
implemented. The next trendline to implement may have been a rate-of-change curve, or even a trend
prediction, but these would require additional mathematic and statistical functions which would
take much more time to implement.
