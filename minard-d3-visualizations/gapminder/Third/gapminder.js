var margin = { top: 40, right: 180, bottom: 80, left: 100 };
var containerWidth = 1000;
var containerHeight = 600;
var width = containerWidth - margin.left - margin.right;
var height = containerHeight - margin.top - margin.bottom;

var container = d3.select("#gapminder")
    .attr("width", containerWidth)
    .attr("height", containerHeight);

var chart = container.append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var xScale = d3.scaleLinear().domain([1950, 2010]).range([0, width]);
var yScale = d3.scaleLinear().domain([20, 85]).range([height, 0]);

var continentColorScale = d3.scaleOrdinal()
    .domain(["Africa", "Americas", "Asia", "Europe", "Oceania"])
    .range(["#FF7F00", "#90EE90", "#1F77B4", "#FF69B4", "#FFD700"]);

var sizeScale = d3.scaleSqrt()
    .domain([0, 100000])
    .range([2, 12]);

var irelandColor = "#FF0000";

function getShape(d) {
    if (d.pop < 10000000) return "circle";
    if (d.pop < 50000000) return "rect";
    return "triangle";
}

function getCountryStyle(d) {
    if (d.country === "Ireland") {
        return {
            fill: irelandColor,
            stroke: "#000",
            strokeWidth: 2,
            opacity: 1
        };
    }
    return {
        fill: continentColorScale(d.continent),
        stroke: "#999",
        strokeWidth: 0.5,
        opacity: d.pop < 10000000 ? 1 : (d.pop < 50000000 ? 0.8 : 0.3)
    };
}

function drawShape(chart, d, x, y, size, fill, stroke, strokeWidth, opacity) {
    if (getShape(d) === "circle") {
        chart.append("circle")
            .attr("cx", x)
            .attr("cy", y)
            .attr("r", size)
            .attr("fill", fill)
            .attr("opacity", opacity)
            .attr("stroke", stroke)
            .attr("stroke-width", strokeWidth);
    } else if (getShape(d) === "rect") {
        chart.append("rect")
            .attr("x", x - size)
            .attr("y", y - size)
            .attr("width", size * 2)
            .attr("height", size * 2)
            .attr("fill", fill)
            .attr("opacity", opacity)
            .attr("stroke", stroke)
            .attr("stroke-width", strokeWidth);
    } else if (getShape(d) === "triangle") {
        chart.append("polygon")
            .attr("points", x + "," + (y - size) + " " + 
                           (x + size) + "," + (y + size) + " " + 
                           (x - size) + "," + (y + size))
            .attr("fill", fill)
            .attr("opacity", opacity)
            .attr("stroke", stroke)
            .attr("stroke-width", strokeWidth);
    }
}

d3.csv("../data/gapminder.csv").then(function (csvData) {
    var allData = csvData.map(function (d) {
        return {
            gdpPercap: +d.gdpPercap,
            lifeExp: +d.lifeExp,
            pop: +d.pop,
            year: +d.year,
            country: d.country,
            continent: d.continent
        };
    });

    chart.selectAll("*").remove();

    chart.append("rect")
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", width)
        .attr("height", height)
        .attr("fill", "#f8f8f8");

    var gridLines = chart.append("g").attr("class", "grid");

    for (var year = 1955; year <= 2005; year += 5) {
        gridLines.append("line")
            .attr("x1", xScale(year))
            .attr("x2", xScale(year))
            .attr("y1", 0)
            .attr("y2", height)
            .attr("stroke", "#e0e0e0")
            .attr("stroke-width", 0.5)
            .attr("opacity", 0.3);
    }

    for (var lifeExp = 30; lifeExp <= 80; lifeExp += 10) {
        gridLines.append("line")
            .attr("x1", 0)
            .attr("x2", width)
            .attr("y1", yScale(lifeExp))
            .attr("y2", yScale(lifeExp))
            .attr("stroke", "#e0e0e0")
            .attr("stroke-width", 0.5)
            .attr("opacity", 0.3);
    }

    var xAxis = d3.axisBottom(xScale)
        .tickValues(d3.range(1950, 2010, 5))
        .tickFormat(d3.format("d"));

    var xAxisGroup = chart.append("g")
        .attr("class", "axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

    xAxisGroup.select(".domain").remove();
    xAxisGroup.selectAll(".tick line")
        .attr("y2", -height)
        .attr("stroke", "#e0e0e0")
        .attr("opacity", 0.6);

    var yAxis = d3.axisLeft(yScale)
        .tickValues(d3.range(20, 86, 5))
        .tickFormat(d3.format("d"));

    var yAxisGroup = chart.append("g")
        .attr("class", "axis")
        .call(yAxis);

    yAxisGroup.select(".domain").remove();

    chart.append("line")
        .attr("x1", 0)
        .attr("x2", 0)
        .attr("y1", 0)
        .attr("y2", height)
        .attr("stroke", "#e0e0e0")
        .attr("stroke-width", 1)
        .attr("opacity", 0.6);

    chart.append("text")
        .attr("class", "axis-label")
        .attr("x", width / 2)
        .attr("y", height + 50)
        .attr("text-anchor", "middle")
        .text("Year");

    chart.append("text")
        .attr("class", "axis-label")
        .attr("transform", "rotate(-90)")
        .attr("x", -height / 2)
        .attr("y", -60)
        .attr("text-anchor", "middle")
        .text("Life Expectancy (years)");

    chart.append("text")
        .attr("class", "chart-title")
        .attr("x", width / 2)
        .attr("y", -20)
        .text("Gapminder Data: Life Expectancy by Year (1952-2007)");

    chart.append("text")
        .attr("class", "axis-label")
        .attr("x", width / 2)
        .attr("y", -5)
        .attr("text-anchor", "middle")
        .attr("font-size", "11px")
        .text("Shape = Population | Size = GDP per Capita | Color = Continent");

    var legend = container.append("g")
        .attr("transform", "translate(" + (containerWidth - 160) + ", 20)");

    var continents = ["Africa", "Americas", "Asia", "Europe", "Oceania"];
    continents.forEach(function (continent, i) {
        legend.append("circle")
            .attr("cx", 8)
            .attr("cy", i * 20 + 8)
            .attr("r", 6)
            .attr("fill", continentColorScale(continent));

        legend.append("text")
            .attr("class", "legend-text")
            .attr("x", 20)
            .attr("y", i * 20 + 12)
            .text(continent);
    });

    legend.append("circle")
        .attr("cx", 8)
        .attr("cy", continents.length * 20 + 15)
        .attr("r", 6)
        .attr("fill", irelandColor)
        .attr("stroke", "#000")
        .attr("stroke-width", 2);

    legend.append("text")
        .attr("class", "legend-text")
        .attr("x", 20)
        .attr("y", continents.length * 20 + 19)
        .text("Ireland");

    var shapeLegendY = (continents.length + 1) * 20 + 35;

    legend.append("circle")
        .attr("cx", 8)
        .attr("cy", shapeLegendY + 8)
        .attr("r", 6)
        .attr("fill", "#666");

    legend.append("text")
        .attr("class", "legend-text")
        .attr("x", 20)
        .attr("y", shapeLegendY + 12)
        .text("Small pop (< 10M)");

    legend.append("rect")
        .attr("x", 2)
        .attr("y", shapeLegendY + 25)
        .attr("width", 12)
        .attr("height", 12)
        .attr("fill", "#666");

    legend.append("text")
        .attr("class", "legend-text")
        .attr("x", 20)
        .attr("y", shapeLegendY + 33)
        .text("Medium pop (10M-50M)");

    legend.append("polygon")
        .attr("points", "8," + (shapeLegendY + 40) + " 14," + (shapeLegendY + 52) + " 2," + (shapeLegendY + 52))
        .attr("fill", "#666");

    legend.append("text")
        .attr("class", "legend-text")
        .attr("x", 20)
        .attr("y", shapeLegendY + 48)
        .text("Large pop (> 50M)");

    var sizeLegendY = shapeLegendY + 70;
    legend.append("text")
        .attr("class", "legend-text")
        .attr("x", 0)
        .attr("y", sizeLegendY)
        .attr("font-size", "12px")
        .attr("font-weight", "bold")
        .text("GDP per Capita (Size)");

    var sizeValues = [1000, 10000, 50000];
    sizeValues.forEach(function(value, i) {
        var circleY = sizeLegendY + 20 + (i * 25);
        legend.append("circle")
            .attr("cx", 8)
            .attr("cy", circleY)
            .attr("r", sizeScale(value))
            .attr("fill", "none")
            .attr("stroke", "#666")
            .attr("stroke-width", 1);
        
        legend.append("text")
            .attr("class", "legend-text")
            .attr("x", 20)
            .attr("y", circleY + 4)
            .text("$" + value.toLocaleString());
    });

    var lifeExpExtent = d3.extent(allData, function (d) { return d.lifeExp; });
    yScale.domain([Math.floor(lifeExpExtent[0] / 5) * 5, Math.ceil(lifeExpExtent[1] / 5) * 5]);
    sizeScale.domain(d3.extent(allData, function (d) { return d.gdpPercap; }));

    allData.forEach(function (d, i) {
        d.jitter = (i % 20) - 10;
        d.verticalJitter = (d.year % 6) - 3;
    });

    allData.forEach(function(d) {
        var x = xScale(d.year) + d.jitter;
        var y = yScale(d.lifeExp) + d.verticalJitter;
        var size = sizeScale(d.gdpPercap);
        var style = getCountryStyle(d);
        drawShape(chart, d, x, y, size, style.fill, style.stroke, style.strokeWidth, style.opacity);
    });

    var irelandData = allData.filter(function(d) { return d.country === "Ireland"; });
    irelandData.forEach(function(d) {
        var x = xScale(d.year) + d.jitter;
        var y = yScale(d.lifeExp) + d.verticalJitter;
        var size = sizeScale(d.gdpPercap);
        drawShape(chart, d, x, y, size, irelandColor, "#000", 2, 1);
    });
});