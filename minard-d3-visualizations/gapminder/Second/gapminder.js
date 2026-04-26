var margin = { top: 30, right: 150, bottom: 60, left: 80 };
var containerWidth = 550;
var vizWidth = containerWidth;
var width = vizWidth - margin.left - margin.right;
var height = 250;
var containerHeight = (height + margin.top + margin.bottom) * 3 + 10;

var container = d3.select("#gapminder")
    .attr("width", containerWidth)
    .attr("height", containerHeight);

function getChartTransform(index) {
    var yOffset = index * (height + margin.top + margin.bottom);
    return "translate(" + margin.left + "," + (yOffset + margin.top) + ")";
}

var svg1 = container.append("g").attr("transform", getChartTransform(0));
var svg2 = container.append("g").attr("transform", getChartTransform(1));
var svg3 = container.append("g").attr("transform", getChartTransform(2));

var x = d3.scaleLinear().domain([1952, 2007]).range([0, width]);
var y = d3.scaleLinear().domain([30, 85]).range([height, 0]);

var color = d3.scaleOrdinal()
    .domain(["Africa", "Americas", "Asia", "Europe", "Oceania"])
    .range(["#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FFEAA7"]);

var irelandColor = "#FF0000";

var lineStyles = {
    "Africa": "5,5",
    "Americas": "10,5",
    "Asia": "15,5",
    "Europe": "20,5",
    "Oceania": "25,5"
};

var symbols = {
    "Africa": d3.symbolCircle,
    "Americas": d3.symbolSquare, 
    "Asia": d3.symbolTriangle,
    "Europe": d3.symbolDiamond,
    "Oceania": d3.symbolStar
};

var continents = ["Africa", "Americas", "Asia", "Europe", "Oceania"];

function createViz(svg, data, vizType, title) {
    svg.selectAll("*").remove();
    
    var line = d3.line()
        .x(function(d) { return x(d.year); })
        .y(function(d) { return y(d.lifeExp); })
        .curve(d3.curveMonotoneX);
    
    var irelandData = data.filter(function(d) { return d.country === "Ireland"; });
    
    for (var i = 0; i < continents.length; i++) {
        var continent = continents[i];
        var continentData = data.filter(function(d) { return d.continent === continent; });
        
        var path = svg.append("path")
            .datum(continentData)
            .attr("class", "line")
            .attr("d", line);
        
        if (vizType === "color") {
            path.attr("stroke", color(continent)).attr("stroke-width", 2);
        } else if (vizType === "lineStyle") {
            path.attr("stroke", "#333").attr("stroke-width", 2).attr("stroke-dasharray", lineStyles[continent]);
        } else if (vizType === "symbol") {
            path.attr("stroke", "#333").attr("stroke-width", 1).attr("opacity", 0.6);
            svg.selectAll("path." + continent)
                .data(continentData)
                .enter().append("path")
                .attr("class", continent)
                .attr("d", d3.symbol().type(symbols[continent]).size(50))
                .attr("transform", function(d) { return "translate(" + x(d.year) + "," + y(d.lifeExp) + ")"; })
                .attr("fill", "#333");
        }
    }
    
    if (irelandData.length > 0) {
        var irelandPath = svg.append("path")
            .datum(irelandData)
            .attr("class", "line ireland-line")
            .attr("d", line)
            .attr("stroke", irelandColor)
            .attr("stroke-width", 3);
        
        if (vizType === "lineStyle") irelandPath.attr("stroke-dasharray", "none");
        
        if (vizType === "symbol") {
            svg.selectAll("path.ireland")
                .data(irelandData)
                .enter().append("path")
                .attr("class", "ireland")
                .attr("d", d3.symbol().type(d3.symbolCircle).size(80))
                .attr("transform", function(d) { return "translate(" + x(d.year) + "," + y(d.lifeExp) + ")"; })
                .attr("fill", irelandColor)
                .attr("stroke", "#000")
                .attr("stroke-width", 2);
        }
    }
    
    svg.append("g")
        .attr("class", "axis")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x).ticks(6).tickFormat(d3.format("d")));
    
    svg.append("g").attr("class", "axis").call(d3.axisLeft(y).ticks(6));
    
    svg.append("text").attr("class", "axis-label").attr("x", width / 2).attr("y", height + 40).attr("text-anchor", "middle").text("Year");
    
    svg.append("text").attr("class", "axis-label").attr("transform", "rotate(-90)").attr("x", -height / 2).attr("y", -50).attr("text-anchor", "middle").text("Life Expectancy (years)");
    
    svg.append("text").attr("class", "chart-title").attr("x", width / 2).attr("y", -10).attr("text-anchor", "middle").text(title);
}

d3.csv("../data/gapminder.csv").then(function(csvData) {
    var data = csvData.map(function(d) {
        d.year = +d.year;
        d.lifeExp = +d.lifeExp;
        d.pop = +d.pop;
        d.gdpPercap = +d.gdpPercap;
        return d;
    });
    
    data = data.filter(function(d) { return d.year >= 1952 && d.year <= 2007; });
    
    var years = d3.range(1952, 2008, 5);
    var dataByContinent = [];
    
    continents.forEach(function(continent) {
        years.forEach(function(year) {
            var continentYearData = data.filter(function(d) { return d.continent === continent && d.year === year; });
            if (continentYearData.length > 0) {
                dataByContinent.push({ continent: continent, year: year, lifeExp: d3.mean(continentYearData, function(d) { return d.lifeExp; }) });
            }
        });
    });
    
    data.filter(function(d) { return d.country === "Ireland"; }).forEach(function(d) {
        dataByContinent.push({ continent: "Ireland", country: "Ireland", year: d.year, lifeExp: d.lifeExp });
    });
    
    x.domain(d3.extent(dataByContinent, function(d) { return d.year; }));
    y.domain(d3.extent(dataByContinent, function(d) { return d.lifeExp; }));
    
    createViz(svg1, dataByContinent, "color", "Chart 4: Continent as Color");
    createViz(svg2, dataByContinent, "lineStyle", "Chart 5: Continent as Line Style");
    createViz(svg3, dataByContinent, "symbol", "Chart 6: Symbol");
    
    addLegend(svg1, "color");
    addLegend(svg2, "lineStyle");
    addLegend(svg3, "symbol");
    
    addMainTitle();
});

function addLegend(svg, legendType) {
    var leftMargin = 20;
    var padding = 10;
    
    svg.append("rect")
        .attr("x", width + leftMargin)
        .attr("y", 10)
        .attr("width", 110).attr("height", 120)
        .attr("fill", "white")
        .attr("stroke", "#333").attr("stroke-width", 1).attr("rx", 4);
    
    var legend = svg.append("g")
        .attr("transform", "translate(" + (width + leftMargin + padding) + ", " + (10 + padding) + ")");
    
    var items = legend.selectAll("g").data(continents).enter().append("g")
        .attr("transform", function(d, i) { return "translate(0," + (i * 20) + ")"; });
    
    if (legendType === "symbol") {
        items.each(function(d) {
            d3.select(this).append("path")
                .attr("d", d3.symbol().type(symbols[d]).size(50))
                .attr("fill", "#333");
        });
        items.append("text").attr("x", 15).attr("y", 5);
    } else {
        items.append("line")
            .attr("x1", 0).attr("x2", 15).attr("y1", 0).attr("y2", 0)
            .attr("stroke", legendType === "color" ? function(d) { return color(d); } : "#333")
            .attr("stroke-width", 2)
            .attr("stroke-dasharray", legendType === "lineStyle" ? function(d) { return lineStyles[d]; } : null);
        items.append("text").attr("x", 20).attr("y", 5);
    }
    
    items.select("text").style("font-size", "11px").text(function(d) { return d; });
    
    var irelandGroup = legend.append("g").attr("transform", "translate(0, 100)");
    var irelandText;
    if (legendType === "symbol") {
        irelandGroup.append("path")
            .attr("d", d3.symbol().type(d3.symbolCircle).size(80))
            .attr("fill", irelandColor).attr("stroke", "#000").attr("stroke-width", 2);
        irelandText = legend.append("text").attr("x", 15).attr("y", 105);
    } else {
        irelandGroup.append("line")
            .attr("x1", 0).attr("x2", 15).attr("y1", 0).attr("y2", 0)
            .attr("stroke", irelandColor).attr("stroke-width", 3);
        irelandText = legend.append("text").attr("x", 20).attr("y", 105);
    }
    irelandText.style("font-size", "11px").style("font-weight", "bold").text("Ireland");
}

function addMainTitle() {
    container.append("text")
        .attr("x", containerWidth / 2)
        .attr("y", containerHeight - 10)
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .style("font-weight", "bold")
        .text("Life Expectancy Evolution by Continent (1952-2007)");
}