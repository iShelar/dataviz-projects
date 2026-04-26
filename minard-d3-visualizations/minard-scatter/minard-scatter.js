function createMinardScatterPlot(containerId, dataPath) {
    const chartMargins = { top: 40, right: 40, bottom: 60, left: 60 };
    const mainChartWidth = 1000 - chartMargins.left - chartMargins.right;
    const mainChartHeight = 450 - chartMargins.top - chartMargins.bottom;
    const temperatureChartHeight = 120;
    const totalChartHeight = mainChartHeight + temperatureChartHeight;

    const armyAdvancingColor = "#E6CCAC";
    const armyRetreatingColor = "#1F1A1B";
    const standardFontSize = "12px";
    const smallFontSize = "8px";

    const svgContainer = d3.select(containerId)
        .append("svg")
        .attr("width", mainChartWidth + chartMargins.left + chartMargins.right)
        .attr("height", totalChartHeight + chartMargins.top + chartMargins.bottom)
        .attr("class", "chart");

    const mainChartGroup = svgContainer.append("g")
        .attr("transform", `translate(${chartMargins.left},${chartMargins.top})`);

    d3.csv(dataPath).then(function (rawData) {
        const armyMovementData = rawData.filter(d => d.LONP && d.LATP && d.DIV);

        armyMovementData.forEach(dataPoint => {
            dataPoint.LONP = +dataPoint.LONP;
            dataPoint.LATP = +dataPoint.LATP;
            dataPoint.DIV = +dataPoint.DIV;
            dataPoint.SURV = +dataPoint.SURV;
        });

        const temperatureData = rawData.filter(d =>
            d.TEMP !== null &&
            d.TEMP !== "" &&
            !isNaN(+d.TEMP) &&
            d.LONT !== null &&
            d.LONT !== ""
        );

        temperatureData.forEach(dataPoint => {
            dataPoint.LONT = +dataPoint.LONT;
            dataPoint.TEMP = +dataPoint.TEMP;
        });

        const longitudeScale = d3.scaleLinear()
            .domain(d3.extent(armyMovementData, d => d.LONP))
            .range([0, mainChartWidth])
            .nice();

        const latitudeScale = d3.scaleLinear()
            .domain(d3.extent(armyMovementData, d => d.LATP))
            .range([mainChartHeight, 0])
            .nice();

        const armyTrailPathGenerator = d3.line()
            .x(d => longitudeScale(d.LONP))
            .y(d => latitudeScale(d.LATP))
            .curve(d3.curveLinear);

        const armyTrailThicknessScale = d3.scaleLinear()
            .domain(d3.extent(armyMovementData, d => d.SURV))
            .range([5, 40]);

        const advancingArmyColorScale = d3.scaleOrdinal()
            .domain([1, 2, 3])
            .range([armyAdvancingColor, armyAdvancingColor, armyAdvancingColor]);

        const retreatingArmyColorScale = d3.scaleOrdinal()
            .domain([1, 2, 3])
            .range([armyRetreatingColor, armyRetreatingColor, armyRetreatingColor]);

        const armyDataByDivision = d3.group(armyMovementData, d => d.DIV);

        armyDataByDivision.forEach((divisionDataPoints, divisionNumber) => {
            const dataGroupedByDirection = d3.group(divisionDataPoints, d => d.DIR);
            const advancingArmyPoints = dataGroupedByDirection.get('A') || [];
            const retreatingArmyPoints = dataGroupedByDirection.get('R') || [];

            const allDivisionPoints = [...advancingArmyPoints, ...retreatingArmyPoints];

            if (allDivisionPoints.length > 0) {
                if (advancingArmyPoints.length > 0) {
                    for (let i = 0; i < advancingArmyPoints.length - 1; i++) {
                        const currentPoint = advancingArmyPoints[i];
                        const nextPoint = advancingArmyPoints[i + 1];
                        const trailSegment = [currentPoint, nextPoint];

                        mainChartGroup.append("path")
                            .datum(trailSegment)
                            .attr("class", `trail trail-division-${divisionNumber}-advancing`)
                            .attr("d", armyTrailPathGenerator)
                            .attr("fill", "none")
                            .attr("stroke", advancingArmyColorScale(divisionNumber))
                            .attr("stroke-width", armyTrailThicknessScale(currentPoint.SURV))
                            .attr("stroke-linecap", "round")
                            .attr("stroke-linejoin", "round")
                            .attr("opacity", 0.9);
                    }
                }

                if (retreatingArmyPoints.length > 0) {
                    for (let i = 0; i < retreatingArmyPoints.length - 1; i++) {
                        const currentPoint = retreatingArmyPoints[i];
                        const nextPoint = retreatingArmyPoints[i + 1];
                        const trailSegment = [currentPoint, nextPoint];

                        mainChartGroup.append("path")
                            .datum(trailSegment)
                            .attr("class", `trail trail-division-${divisionNumber}-retreating`)
                            .attr("d", armyTrailPathGenerator)
                            .attr("fill", "none")
                            .attr("stroke", retreatingArmyColorScale(divisionNumber))
                            .attr("stroke-width", armyTrailThicknessScale(currentPoint.SURV))
                            .attr("stroke-linecap", "round")
                            .attr("stroke-linejoin", "round")
                            .attr("opacity", 0.8);
                    }
                }

                if (advancingArmyPoints.length > 0 && retreatingArmyPoints.length > 0) {
                    const lastAdvancingPoint = advancingArmyPoints[advancingArmyPoints.length - 1];
                    const firstRetreatingPoint = retreatingArmyPoints[0];
                    const connectionSegment = [lastAdvancingPoint, firstRetreatingPoint];

                    mainChartGroup.append("path")
                        .datum(connectionSegment)
                        .attr("class", `trail trail-division-${divisionNumber}-connection`)
                        .attr("d", armyTrailPathGenerator)
                        .attr("fill", "none")
                        .attr("stroke", advancingArmyColorScale(divisionNumber))
                        .attr("stroke-width", armyTrailThicknessScale(lastAdvancingPoint.SURV))
                        .attr("stroke-linecap", "round")
                        .attr("stroke-linejoin", "round")
                        .attr("opacity", 0.9);
                }
            }
        });

        armyMovementData.forEach(dataPoint => {
            mainChartGroup.append("text")
                .attr("class", "survivor-label")
                .attr("x", longitudeScale(dataPoint.LONP) + 8)
                .attr("y", latitudeScale(dataPoint.LATP) - 8)
                .style("font-family", "Times New Roman, serif")
                .style("font-size", smallFontSize)
                .attr("fill", "#666666")
                .text(dataPoint.SURV);
        });

        mainChartGroup.append("text")
            .attr("x", mainChartWidth / 2)
            .attr("y", -10)
            .attr("text-anchor", "middle")
            .style("font-family", "Times New Roman, serif")
            .style("font-size", "36px")
            .style("font-weight", "bold")
            .style("margin-bottom", "20px")
            .text("Assignment 1.1: Minard Chart");

        const cityData = armyMovementData.filter(d => d.CITY && d.LONC && d.LATC);

        cityData.forEach(city => {
            city.LONC = +city.LONC;
            city.LATC = +city.LATC;
        });

        mainChartGroup.selectAll(".city-point")
            .data(cityData)
            .enter().append("circle")
            .attr("class", "city-point")
            .attr("cx", d => longitudeScale(d.LONC))
            .attr("cy", d => latitudeScale(d.LATC))
            .attr("r", 3)
            .attr("fill", "#000000")
            .attr("stroke", "#000000")
            .attr("stroke-width", 1);

        mainChartGroup.selectAll(".city-label")
            .data(cityData)
            .enter().append("text")
            .attr("class", "city-label")
            .attr("x", d => longitudeScale(d.LONC) + 5)
            .attr("y", d => latitudeScale(d.LATC) - 5)
            .style("font-family", "Times New Roman, serif")
            .style("font-size", standardFontSize)
            .attr("fill", "#000000")
            .attr("font-weight", "bold")
            .text(d => d.CITY);

        if (temperatureData.length > 0) {
            const temperatureLongitudeScale = d3.scaleLinear()
                .domain([24, 38])
                .range([0, mainChartWidth]);

            const temperatureValueScale = d3.scaleLinear()
                .domain(d3.extent(temperatureData, d => d.TEMP))
                .range([mainChartHeight + 150, mainChartHeight + 60])
                .nice();

            const temperatureColorScale = d3.scaleSequential(d3.interpolateRdYlBu)
                .domain(d3.extent(temperatureData, d => d.TEMP));

            const temperatureLineGenerator = d3.line()
                .x(d => temperatureLongitudeScale(d.LONT))
                .y(d => temperatureValueScale(d.TEMP))
                .curve(d3.curveLinear);

            mainChartGroup.append("path")
                .datum(temperatureData)
                .attr("class", "temperature-line")
                .attr("d", temperatureLineGenerator)
                .attr("fill", "none")
                .attr("stroke", "#FF6B6B")
                .attr("stroke-width", 2)
                .attr("opacity", 0.7);

            mainChartGroup.selectAll(".temperature-vertical-line")
                .data(temperatureData)
                .enter().append("line")
                .attr("class", "temperature-vertical-line")
                .attr("x1", d => temperatureLongitudeScale(d.LONT))
                .attr("y1", d => temperatureValueScale(d.TEMP))
                .attr("x2", d => temperatureLongitudeScale(d.LONT))
                .attr("y2", d => {
                    const retreatPoint = armyMovementData.find(p =>
                        Math.abs(p.LONP - d.LONT) < 0.5 && p.DIR === 'R'
                    );
                    return retreatPoint ? latitudeScale(retreatPoint.LATP) : temperatureValueScale(d.TEMP);
                })
                .attr("stroke", "#999999")
                .attr("stroke-width", 1)
                .attr("opacity", 0.6)
                .attr("stroke-dasharray", "2,2");

            mainChartGroup.selectAll(".temperature-point")
                .data(temperatureData)
                .enter().append("circle")
                .attr("class", "temperature-point")
                .attr("cx", d => temperatureLongitudeScale(d.LONT))
                .attr("cy", d => temperatureValueScale(d.TEMP))
                .attr("r", 6)
                .attr("fill", d => temperatureColorScale(d.TEMP))
                .attr("stroke", "#000000")
                .attr("stroke-width", 2)
                .attr("opacity", 1.0);

            mainChartGroup.selectAll(".temperature-label")
                .data(temperatureData)
                .enter().append("text")
                .attr("class", "temperature-label")
                .attr("x", d => temperatureLongitudeScale(d.LONT))
                .attr("y", d => temperatureValueScale(d.TEMP) - 8)
                .style("font-family", "Times New Roman, serif")
                .style("font-size", smallFontSize)
                .attr("fill", "#333333")
                .attr("text-anchor", "middle")
                .text(d => d.TEMP + "°C");

            const temperatureYAxis = d3.axisRight(temperatureValueScale)
                .tickFormat(d => d + "°C")
                .tickValues([0, -5, -10, -15, -20, -25, -30, -35]);

            mainChartGroup.append("g")
                .attr("class", "temperature-axis")
                .attr("transform", `translate(${mainChartWidth + 10}, 0)`)
                .call(temperatureYAxis)
                .style("font-family", "Times New Roman, serif")
                .style("font-size", smallFontSize);

            const temperatureTicks = [0, -5, -10, -15, -20, -25, -30, -35];
            temperatureTicks.forEach(tick => {
                const y = temperatureValueScale(tick);
                mainChartGroup.append("line")
                    .attr("class", "temperature-grid-line")
                    .attr("x1", 0)
                    .attr("y1", y)
                    .attr("x2", mainChartWidth)
                    .attr("y2", y)
                    .attr("stroke", "#E0E0E0")
                    .attr("stroke-width", 1)
                    .attr("opacity", 0.5);
            });

            mainChartGroup.append("line")
                .attr("class", "temperature-axis-line")
                .attr("x1", mainChartWidth + 10)
                .attr("y1", mainChartHeight + 60)
                .attr("x2", mainChartWidth + 10)
                .attr("y2", mainChartHeight + 150)
                .attr("stroke", "#333333")
                .attr("stroke-width", 1);

            const temperatureXAxis = d3.axisBottom(temperatureLongitudeScale)
                .tickFormat(d => d);

            mainChartGroup.append("g")
                .attr("class", "temperature-x-axis")
                .attr("transform", `translate(0,${mainChartHeight + 150})`)
                .call(temperatureXAxis)
                .style("font-family", "Times New Roman, serif")
                .style("font-size", smallFontSize);

            mainChartGroup.append("line")
                .attr("class", "temperature-x-axis-line")
                .attr("x1", 0)
                .attr("y1", mainChartHeight + 150)
                .attr("x2", mainChartWidth)
                .attr("y2", mainChartHeight + 150)
                .attr("stroke", "#333333")
                .attr("stroke-width", 1);

            mainChartGroup.append("text")
                .attr("class", "temperature-axis-label")
                .attr("x", mainChartWidth + 30)
                .attr("y", mainChartHeight + 105)
                .attr("text-anchor", "middle")
                .attr("transform", "rotate(90, " + (mainChartWidth + 30) + ", " + (mainChartHeight + 105) + ")")
                .style("font-family", "Times New Roman, serif")
                .style("font-size", standardFontSize)
                .style("font-weight", "bold")
                .text("Temperature (°C)");
        }

    }).catch(function (error) {
        console.error("Error loading data:", error);
        d3.select(containerId).append("p")
            .text("File path is incorrect");
    });
}
