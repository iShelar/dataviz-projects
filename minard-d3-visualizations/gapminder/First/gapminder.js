var margin = { top: 30, right: 30, bottom: 60, left: 80 };
var containerWidth = 550;
var width = containerWidth - margin.left - margin.right;
var height = 350;
var containerHeight = (height + margin.top + margin.bottom) * 3 + 20;

var svg1Transform = "translate(" + margin.left + "," + margin.top + ")";
var svg2Transform = "translate(" + margin.left + "," + (height + margin.top + margin.bottom + margin.top) + ")";
var svg3Transform = "translate(" + margin.left + "," + (2 * (height + margin.top + margin.bottom) + margin.top) + ")";

var container = d3.select("#gapminder")
    .attr("width", containerWidth)
    .attr("height", containerHeight);

var svg1 = container.append("g").attr("transform", svg1Transform);
var svg2 = container.append("g").attr("transform", svg2Transform);
var svg3 = container.append("g").attr("transform", svg3Transform);

var x = d3.scaleLinear().domain([0, 45000]).range([0, width]);
var y = d3.scaleLinear().domain([35, 85]).range([height, 0]);
var color = d3.scaleOrdinal().domain(["Africa", "Americas", "Asia", "Europe", "Oceania"]).range(["#FF5733", "#33FF57", "#3357FF", "#FF33A1", "#FFD700"]);
var irelandColor = "#FF0000";
var data2002 = null;

function getFillColor(country, continent) {
    if (country === "Ireland") return irelandColor;
    return color(continent);
}

function getOpacity(country, baseOpacity) {
    if (country === "Ireland") return 1;
    return baseOpacity;
}

function getStroke(country) {
    if (country === "Ireland") return "#000";
    return "none";
}

function getStrokeWidth(country) {
    if (country === "Ireland") return 2;
    return 0;
}

function applyIrelandStyling(selection, customOpacity) {
    var baseOpacity = customOpacity || 0.7;
    selection
        .attr("fill", function(d) { return getFillColor(d.country, d.continent); })
        .attr("opacity", function(d) { return getOpacity(d.country, baseOpacity); })
        .attr("stroke", function(d) { return getStroke(d.country); })
        .attr("stroke-width", function(d) { return getStrokeWidth(d.country); });
}

function createViz1(data) {
    var r = d3.scaleSqrt().domain(d3.extent(data, function(d) { return d.pop; })).range([5, 25]);
    svg1.selectAll("*").remove();
    
    var circles = svg1.selectAll("circle")
        .data(data)
        .enter()
        .append("circle")
        .attr("cx", function(d) { return x(d.gdpPercap); })
        .attr("cy", function(d) { return y(d.lifeExp); })
        .attr("r", function(d) { return r(d.pop); });
    
    applyIrelandStyling(circles);
    addAxesAndLabels(svg1, "Population as Circle Size");
    addLegendToChart(svg1);
}

function createViz2(data) {
    var colorIntensity = d3.scaleLinear().domain(d3.extent(data, function(d) { return d.pop; })).range([0.3, 1]);
    svg2.selectAll("*").remove();
    
    svg2.selectAll("circle")
        .data(data)
        .enter()
        .append("circle")
        .attr("cx", function(d) { return x(d.gdpPercap); })
        .attr("cy", function(d) { return y(d.lifeExp); })
        .attr("r", 8)
        .attr("fill", function(d) {
            if (d.country === "Ireland") return irelandColor;
            return d3.color(color(d.continent)).brighter(1 - colorIntensity(d.pop));
        })
        .attr("opacity", function(d) { return getOpacity(d.country, 0.8); })
        .attr("stroke", function(d) { return getStroke(d.country); })
        .attr("stroke-width", function(d) { return getStrokeWidth(d.country); });

    addAxesAndLabels(svg2, "Population as Color Intensity");
    addLegendToChart(svg2);
}

function createViz3(data) {
    var popThreshold = d3.median(data, function(d) { return d.pop; });
    svg3.selectAll("*").remove();

    var circles = svg3.selectAll("circle")
        .data(data.filter(function(d) { return d.pop < popThreshold; }))
        .enter()
        .append("circle")
        .attr("cx", function(d) { return x(d.gdpPercap); })
        .attr("cy", function(d) { return y(d.lifeExp); })
        .attr("r", 8);
    
    applyIrelandStyling(circles);

    var rects = svg3.selectAll("rect")
        .data(data.filter(function(d) { return d.pop >= popThreshold; }))
        .enter()
        .append("rect")
        .attr("x", function(d) { return x(d.gdpPercap) - 6; })
        .attr("y", function(d) { return y(d.lifeExp) - 6; })
        .attr("width", 8)
        .attr("height", 8);
    
    applyIrelandStyling(rects);
    addAxesAndLabels(svg3, "Population as Shape (Rect=High, Circle=Low)");
    addLegendToChart(svg3);
}

function addAxesAndLabels(svg, title) {
    var xAxisTransform = "translate(0," + height + ")";
    svg.append("g").attr("transform", xAxisTransform).call(d3.axisBottom(x).ticks(5));
    svg.append("g").call(d3.axisLeft(y));
    
    svg.append("text").attr("class", "label").attr("x", width / 2).attr("y", height + 40)
        .attr("text-anchor", "middle").style("font-size", "12px").text("GDP per Capita ($)");
    
    svg.append("text").attr("class", "label").attr("transform", "rotate(-90)").attr("x", -height / 2)
        .attr("y", -50).attr("text-anchor", "middle").style("font-size", "12px").text("Life Expectancy (years)");
    
    svg.append("text").attr("class", "label").attr("x", width / 2).attr("y", -10)
        .attr("text-anchor", "middle").style("font-size", "13px").style("font-weight", "bold").text(title);
}

function addLegendToChart(svg) {
    var continents = ["Africa", "Americas", "Asia", "Europe", "Oceania"];
    var legendX = width - 110;
    var legendY = height - 150;
    var size = 15;
    var padding = 8;
    var totalItems = continents.length + 1;
    var legendHeight = totalItems * (size + 5) + padding * 2;
    var legendWidth = 100;
    
    var legend = svg.append("g").attr("transform", "translate(" + legendX + ", " + legendY + ")");
    
    legend.append("rect")
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", legendWidth)
        .attr("height", legendHeight)
        .attr("fill", "white")
        .attr("stroke", "black")
        .attr("stroke-width", 1);
    
    continents.forEach(function(d, i) {
        legend.append("circle")
            .attr("cx", padding + 10)
            .attr("cy", padding + i * (size + 5))
            .attr("r", 7)
            .style("fill", color(d));
        
        legend.append("text")
            .attr("x", padding + 25)
            .attr("y", padding + i * (size + 5) + 5)
            .style("font-size", "10px")
            .text(d);
    });
    
    var irelandIndex = continents.length;
    legend.append("circle")
        .attr("cx", padding + 10)
        .attr("cy", padding + irelandIndex * (size + 5))
        .attr("r", 7)
        .style("fill", irelandColor)
        .attr("stroke", "#000")
        .attr("stroke-width", 2);
    
    legend.append("text")
        .attr("x", padding + 25)
        .attr("y", padding + irelandIndex * (size + 5) + 5)
        .style("font-size", "10px")
        .style("font-weight", "bold")
        .text("Ireland");
}

d3.csv("../data/gapminder.csv").then(function(csvData) {
    data2002 = csvData.filter(function(d) { return +d.year === 2002; });
    
    data2002 = data2002.map(function(d) {
        d.gdpPercap = +d.gdpPercap;
        d.lifeExp = +d.lifeExp;
        d.pop = +d.pop;
        return d;
    });

    createViz1(data2002);
    createViz2(data2002);
    createViz3(data2002);
    addMainTitle();
});

function addMainTitle() {
    container.append("text")
        .attr("x", containerWidth / 2)
        .attr("y", containerHeight - 10)
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .style("font-weight", "bold")
        .style("transform", "translateY(10px)")
        .text("Gapminder Data - Year 2002");
}