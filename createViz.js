// Function that generates the initial data vizualization, as well as the drop-down for any filter
// filter behavior
function createViz(json) {

    // Create the SVG element that the visualization will be in
	$("<svg id=\"svg\"> </svg>").appendTo(document.body);

    // Setting default parameters if they aren't user-defined
	var width = (json.width ? json.width : 700);
	var height = (json.height ? json.height : 400);
	var margin = (json.margin ? json.margin : {"top":0, "bottom":0, "left":0, "right":0});
    var color = (json.color ? json.color : "#999999");

	var svg = d3.select("body").select("svg")
        					.attr("width", width)
        					.attr("height", height);

    $("#svg").css("margin-top", margin.top)
    		 .css("margin-bottom", margin.bottom)
        	 .css("margin-left", margin.left)
        	 .css("margin-right", margin.right);

    var type = json.type;
    type = type.replace(/\s+/g, '').toLowerCase();

    // Depending on the type of graph specified by the user, a visualization will be generated
    switch(json.type) {
        case "scatterplot": {
            var radius = (json.radius ? json.radius : 3);

            if (!json.data) {
                throw "You need to give data in order to create a visualization.";
            };

            if (!json.xAxis || !json.data[0][json.xAxis]) {
                throw "You need to indicate an xAxis value in order to create a visualization.";
            }

            if (!json.yAxis || !json.data[0][json.yAxis]) {
                throw "You need to indicate a yAxis value in order to create a visualization.";
            }

            if (!json.data[0].name) {
                throw "Scatterplot data points must have a name associated with them.";
            }

            var xAxis = json.xAxis;
            var yAxis = json.yAxis;
            var data = json.data;

            scatterPlot(width, height, margin, data, color, radius, xAxis, yAxis);
            break;
        }
        case "piechart": {
            if (!json.data) {
                throw "You need to give data in order to create a visualization."
            };

            if (!json.names || !json.data[0][json.xnames]) {
                throw "You need to indicate value names in order to create a visualization."
            }

            if (!json.values || !json.data[0][json.values]) {
                throw "You need to indicate values in order to create a visualization."
            }

            var xAxis = json.names;
            var yAxis = json.values;
            var data = json.data;
            var colors = json.colors?json.colors:['#0033FF','#3366FF','#0033CC','#0066FF','#6699FF','#3366CC','#003399','#3399FF','#0066CC','#0099FF','#99CCFF','#6699CC','#336699','#003366','#66CCFF','#3399CC','#006699','#33CCFF','#0099CC','#00CCFF']

            pieChart(data,names,values,colors,radius);
            break;
        }
        case "linegraph": {
            var radius = (json.radius ? json.radius : 3);

            if (!json.data) {
                throw "You need to give data in order to create a visualization.";
            };

            if (!json.xAxis || !json.data[0][json.xAxis]) {
                throw "You need to indicate an xAxis value in order to create a visualization.";
            }

            if (!json.yAxis || !json.data[0][json.yAxis]) {
                throw "You need to indicate a yAxis value in order to create a visualization.";
            }

            if (!json.data[0].name) {
                throw "Scatterplot data points must have a name associated with them.";
            }

            var xAxis = json.xAxis;
            var yAxis = json.yAxis;
            
            var color = (json.color)?json.color:color;
            var data = json.data;

            scatterPlot(data,height,width,xAxis,yAxis,color);
            break;
        }
        case "horizontalbargraph": {
            if (!json.data) {
                throw "You need to give data in order to create a visualization."
            };

            if (!json.xAxis || !json.data[0][json.xAxis]) {
                throw "You need to indicate an xAxis value in order to create a visualization."
            }

            if (!json.yAxis || !json.data[0][json.yAxis]) {
                throw "You need to indicate a yAxis value in order to create a visualization."
            }

            var xAxis = json.xAxis;
            var yAxis = json.yAxis;
            var data = json.data;

            hBarGraph(width, height, margin, data, color, xAxis, yAxis);
            break;
        }
        case "verticalbargraph": {
            if (!json.data) {
                throw "You need to give data in order to create a visualization."
            };

            if (!json.xAxis || !json.data[0][json.xAxis]) {
                throw "You need to indicate an xAxis value in order to create a visualization."
            }

            if (!json.yAxis || !json.data[0][json.yAxis]) {
                throw "You need to indicate a yAxis value in order to create a visualization."
            }

            var xAxis = json.xAxis;
            var yAxis = json.yAxis;
            var data = json.data;

            vBarGraph(width, height, margin, data, color, xAxis, yAxis);
            break
        }
    };

    // If the filterOn parameter is set, a drop-down will be added to the page and filter behavior
    // will be implemented. The filterOn parameter must be an attribute of every data-point given
    // by the user.
	if (json.filterOn) {

		var filterOn = json.filterOn;
		var data = json.data;

		if (!data[0][filterOn]) {
			throw "That field doesn't exist in your data."
		}

		var filterList = ["None"]
		for (var i = 0; i < data.length; i++) {
			filterList.push(data[i][filterOn]);
		}

		filterList = _.uniq(filterList);

		$("<select id=\"filterList\"></select>").appendTo(document.body);
		
		var selectList = d3.select("#filterList");

		selectList.selectAll("option")
			.data(filterList)
			.enter()
			.append("option")
			.text(function(d) { return d; });

		selectList.on("change", function() {

			var selected = $("#filterList").find(":selected").text();
            if (selected == "None") {
                var filteredData = data;
            } else {
			    var filteredData = _.filter(data, function(d) { return d[filterOn] == selected; });
            };

            switch(json.type) {
                case "scatterplot": {

    				var xScale = d3.scale.linear()
        				.domain([d3.min(filteredData, function(d) { return d[xAxis]; }) - 1,
        						 d3.max(filteredData, function(d) { return d[xAxis]; }) + 1])
        				.range([0, width - margin.right])
        				.nice();

            		var yScale = d3.scale.linear()
        				.domain([0,
        						 d3.max(filteredData, function(d) { return d[yAxis]; }) + 1])
        				.range([height - margin.top, 0])
        				.nice();

            		var circles = svg.selectAll("circle")
            			.data(filteredData, function(d) {
            				return d["name"];
            			});

            		circles.exit()
            			.transition()
            			.duration(500)
            			.attr("opacity", 0)
            			.remove()

            		circles.transition()
            			.duration(500)
            			.delay(500)
            			.attr("cx", function(d) {
            				return xScale(d[xAxis]);
            			})
            			.attr("cy", function(d) {
            				return yScale(d[yAxis]);
            			})

            		circles.enter()
                        .append("circle")
                        .attr("cx", function(d) {
                            return xScale(d[xAxis]);
                        })
                        .attr("cy", function(d) {
                            return yScale(d[yAxis]);
                        })
                        .attr("r", radius)
                        .attr("fill", color)
                        .attr("stroke", color)
                        .attr("opacity", 0)
                        .transition()
                        .duration(500)
                        .delay(1000)
                        .attr("opacity", 1);

                    var labels = svg.selectAll("text")
                        .data(filteredData, function(d) {
                            if (d) {
                                return d["name"];
                            }
                        }); 

                    labels.exit()
                        .transition()
                        .duration(500)
                        .attr("fill", "white")
                        .remove();

                    labels.transition()
                        .duration(500)
                        .delay(500)
                        .attr("x", function(d) {
                            return xScale(d[xAxis]) + 5;
                        })
                        .attr("y", function(d) {
                            return yScale(d[yAxis]);
                        });

                    labels.enter()
                        .append("text")
                        .text(function(d) {
                            return d["name"];
                        })
                        .attr("x", function(d) {
                            return xScale(d[xAxis]) + 5;
                        })
                        .attr("y", function(d) {
                            return yScale(d[yAxis]);
                        })
                        .attr("font-family", "sans-serif")
                        .attr("font-size", "11px")
                        .attr("fill", "white")
                        .transition()
                        .duration(500)
                        .delay(1000)
                        .attr("fill", "black");

                    var axes = svg.selectAll("g")
                        .transition()
                        .duration(100)
                        .delay(500)
                        .attr("opacity", 0)
                        .remove();

                    var xAx = d3.svg.axis()
                        .scale(xScale)
                        .orient("bottom")
                        .tickFormat(d3.format("0000"))
                        .ticks(width / 50);

                    var yAx = d3.svg.axis()
                        .scale(yScale)
                        .orient("left")
                        .ticks(height / 50);

                    svg.append("g")
                        .attr("class", "axis")
                        .attr("transform", "translate(0," + (height - 40) + ")")
                        .attr("opacity", 0)
                        .call(xAx)
                        .transition()
                        .duration(250)
                        .delay(550)
                        .attr("opacity", 1);

                    svg.append("g")
                        .attr("class", "axis")
                        .attr("transform", "translate(40,0)")
                        .attr("opacity", 0)
                        .call(yAx)
                        .transition()
                        .duration(250)
                        .delay(750)
                        .attr("opacity", 1);

                    svg.append("text")
                        .text(xAxis)
                        .attr("x", width/2)
                        .attr("y", height - 10)
                        .attr("font-family", "sans-serif")
                        .attr("font-size", "11px")
                        .attr("fill", "black");

                    svg.append("text")
                        .text(yAxis)
                        .attr("transform", "translate(10," + height/2 + ")rotate(-90)")
                        .attr("font-family", "sans-serif")
                        .attr("font-size", "11px")
                        .attr("fill", "black");
                    break;
                }
                case "linegraph":{
                    var xScale = d3.scale.linear()
                            .domain([0,
                                     d3.max(filteredData, function(d) { return d[xAxis]; }) + 1])
                            .range([margin.left, width - margin.right])
                            .nice();

                    var barHeight = ((height - 30) / filteredData.length) - 10;

                    var line = svg.selectAll("path")
                        .data(filteredData, function(d) {
                            return d[yAxis];
                        });

                    line.exit()
                        .transition()
                        .duration(500)
                        .attr("opacity", 0)
                        .remove();

                    line.transition()
                        .duration(500)
                        .delay(500)
                        .attr("x", function(d) {
                                return xScale(d[xAxis]);
                        })
                        .attr("y", function(d) {
                            return xScale(d[yAxis]);
                        })
                        .attr("stroke", color);

                    line.enter()
                        .append("path")
                        .attr("x", function(d) {
                                return xScale(d[xAxis]);
                        })
                        .attr("y", function(d) {
                            return xScale(d[yAxis]);
                        })
                        .attr("stroke", color);
                        .attr("opacity", 0)
                        .transition()
                        .duration(500)
                        .delay(1000)
                        .attr("opacity", 1);

                    var labels = svg.selectAll("text")
                        .data(filteredData, function(d) {
                            if (d) {
                               return d[yAxis];
                            }
                        });

                    labels.exit()
                        .transition()
                        .duration(500)
                        .attr("fill", "white")
                        .style("text-anchor","end")
                        .remove();

                    labels.transition()
                        .duration(500)
                        .delay(500);

                    labels.enter()
                        .append("text")
                        .text(function(d) {
                            return d["yvalues"];
                        })
                        .style("text-anchor","end")
                        .attr("font-family", "sans-serif")
                        .attr("font-size", "11px")
                        .attr("fill", "white")
                        .transition()
                        .duration(500)
                        .delay(1000)
                        .attr("fill", "black");

                    var axes = svg.selectAll("g")
                        .transition()
                        .duration(100)
                        .delay(500)
                        .attr("opacity", 0)
                        .remove();

                    var xAx = d3.svg.axis()
                        .scale(xScale)
                        .orient("bottom")
                        .tickFormat(d3.format("0000"))
                        .ticks(15);

                    svg.append("g")
                        .attr("class", "axis")
                        .attr("transform", "translate(30," + (height - 35) + ")")
                        .attr("opacity", 0)
                        .call(xAx)
                        .transition()
                        .duration(250)
                        .delay(550)
                        .attr("opacity", 1);

                    // svg.append("text")
                    //     .text(xAxis)
                    //     .attr("x", width/2)
                    //     .attr("y", height - 10)
                    //     .attr("font-family", "sans-serif")
                    //     .attr("font-size", "11px")
                    //     .attr("fill", "black");

                    svg.append("text")
                        .text(yAxis)
                        .attr("transform", "translate(10," + height/2 + ")rotate(-90)")
                        .attr("font-family", "sans-serif")
                        .attr("font-size", "11px")
                        .style("text-anchor","end")
                        .attr("transform", "rotate(-90)")
                        .attr("y", 6)
                        .attr("dy", ".71em")
                        .attr("fill", "black");

                    break;
                }
                case "horizontalbargraph": {

    				var xScale = d3.scale.linear()
            				.domain([0,
            						 d3.max(filteredData, function(d) { return d[xAxis]; }) + 1])
            				.range([margin.left, width - margin.right])
            				.nice();

            		var barHeight = ((height - 30) / filteredData.length) - 10;

            		var bars = svg.selectAll("rect")
            			.data(filteredData, function(d) {
            				return d[yAxis];
            			});

            		bars.exit()
            			.transition()
            			.duration(500)
            			.attr("opacity", 0)
            			.remove();

            		bars.transition()
            			.duration(500)
            			.delay(500)
            			.attr("width", function(d) {
            					return xScale(d[xAxis]);
            			})
            			.attr("height", barHeight)
            			.attr("x", margin.left + 35)
            			.attr("y", function(d, i) {
           					return (barHeight + 10) * i
           				})
           				.attr("fill", color)
           				.attr("stroke", color);

           			bars.enter()
           				.append("rect")
           				.attr("width", function(d) {
            					return xScale(d[xAxis]);
            			})
            			.attr("height", barHeight)
            			.attr("x", margin.left + 35)
            			.attr("y", function(d, i) {
           					return (barHeight + 10) * i
           				})
           				.attr("fill", color)
           				.attr("stroke", color)
           				.attr("opacity", 0)
           				.transition()
           				.duration(500)
           				.delay(1000)
           				.attr("opacity", 1);

       				var labels = svg.selectAll("text")
       					.data(filteredData, function(d) {
                            if (d) {
       						   return d[yAxis];
                            }
       					});

       				labels.exit()
       					.transition()
       					.duration(500)
       					.attr("fill", "white")
       					.remove();

       				labels.transition()
                    	.duration(500)
                    	.delay(500)
                    	.attr("transform", function(d, i) { 
            				var yPos = (barHeight + 10) * i + (barHeight/2);
            				return "translate(30," + yPos + ")rotate(-90)"; });

                	labels.enter()
                        .append("text")
                        .text(function(d) {
                            return d["name"];
                        })
                        .attr("transform", function(d, i) { 
        					var yPos = (barHeight + 10) * i + (barHeight/2);
        					return "translate(30," + yPos + ")rotate(-90)";})
                        .attr("font-family", "sans-serif")
                        .attr("font-size", "11px")
                        .attr("fill", "white")
                        .transition()
                        .duration(500)
                        .delay(1000)
                        .attr("fill", "black");

                    var axes = svg.selectAll("g")
                        .transition()
                        .duration(100)
                        .delay(500)
                        .attr("opacity", 0)
                        .remove();

                    var xAx = d3.svg.axis()
                        .scale(xScale)
                        .orient("bottom")
                        .tickFormat(d3.format("0000"))
                        .ticks(15);

                    svg.append("g")
                        .attr("class", "axis")
                        .attr("transform", "translate(30," + (height - 35) + ")")
                        .attr("opacity", 0)
                        .call(xAx)
                        .transition()
                        .duration(250)
                        .delay(550)
                        .attr("opacity", 1);

                    svg.append("text")
                        .text(xAxis)
                        .attr("x", width/2)
                        .attr("y", height - 10)
                        .attr("font-family", "sans-serif")
                        .attr("font-size", "11px")
                        .attr("fill", "black");

                    svg.append("text")
                        .text(yAxis)
                        .attr("transform", "translate(10," + height/2 + ")rotate(-90)")
                        .attr("font-family", "sans-serif")
                        .attr("font-size", "11px")
                        .attr("fill", "black");

                    break;
                }
                case "verticalbargraph": {

    				var yScale = d3.scale.linear()
    					.domain([0,
    						d3.max(filteredData, function(d) { return d[yAxis]; }) + 1])
    					.range([0, height - margin.top])
    					.nice();

    				var barWidth = ((width - margin.left - margin.right) / filteredData.length) - 10;

    				var bars = svg.selectAll("rect")
                        .data(filteredData, function(d) {
                            return d[xAxis];
                    });

                    bars.exit()
                        .transition()
                        .duration(500)
                        .attr("opacity", 0)
                        .remove();

                    bars.transition()
                        .duration(500)
                        .delay(500)
                        .attr("width", barWidth)
                        .attr("height", function(d) {
            					return yScale(d[yAxis]);
            				})
                        .attr("x", function(d, i) {
            					return (barWidth + 10) * i + 30
            				})
                        .attr("y", function(d) {
            					return (height - margin.bottom) - yScale(d[yAxis]) - 20;
            				})
                        .attr("fill", color)
                        .attr("stroke", color);

                    bars.enter()
                        .append("rect")
                        .attr("width", barWidth)
        				.attr("height", function(d) {
        					return yScale(d[yAxis]);
        				})
        				.attr("x", function(d, i) {
        					return (barWidth + 10) * i + 30
        				})
        				.attr("y", function(d) {
        					return (height - margin.bottom) - yScale(d[yAxis]) - 20;
        				})
                        .attr("fill", color)
                        .attr("stroke", color)
                        .attr("opacity", 0)
                        .transition()
                        .duration(500)
                        .delay(1000)
                        .attr("opacity", 1);

                    var labels = svg.selectAll("text")
                        .data(filteredData, function(d) {
                            if (d) {
                                return d[yAxis]
                            };
                        });

                    labels.exit()
                        .transition()
                        .duration(500)
                        .attr("fill", "white")
                        .remove();

                    labels.transition()
                        .duration(500)
                        .delay(500)
                        .attr("x", function(d, i) {
                            return (barWidth + 10) * i + barWidth/2
                        })
                        .attr("y", height - 20)

                    labels.enter()
                        .append("text")
                        .text(function(d) {
                            return d["name"];
                        })
                        .attr("x", function(d, i) {
            					return (barWidth + 10) * i + barWidth/2
            				})
            			.attr("y", height - 20)
                        .attr("font-family", "sans-serif")
                        .attr("font-size", "11px")
                        .attr("fill", "white")
                        .transition()
                        .duration(500)
                        .delay(1000)
                        .attr("fill", "black");

                    var axes = svg.selectAll("g")
                        .transition()
                        .duration(100)
                        .delay(500)
                        .attr("opacity", 0)
                        .remove();

                    var yAx = d3.svg.axis()
                        .scale(d3.scale.linear()
            				.domain([0,
            						 d3.max(filteredData, function(d) { return d[yAxis]; }) + 1])
            				.range([height - margin.top, 0])
            				.nice())
                        .orient("left")
                        .ticks(height/50);

                    svg.append("g")
                        .attr("class", "axis")
                        .attr("transform", "translate(30,-20)")
                        .attr("opacity", 0)
                        .call(yAx)
                        .transition()
                        .duration(250)
                        .delay(550)
                        .attr("opacity", 1);

                    svg.append("text")
                        .text(yAxis)
                        .attr("transform", "translate(10," + height/2 + ")rotate(-90)")
                        .attr("font-family", "sans-serif")
                        .attr("font-size", "11px")
                        .attr("fill", "black");

                    svg.append("text")
                        .text(xAxis)
                        .attr("x", width/2)
                        .attr("y", height - 5)
                        .attr("font-family", "sans-serif")
                        .attr("font-size", "11px")
                        .attr("fill", "black");
                    break;
                }
			};

			$(".axis path").css("fill", "none");
            $(".axis path").css("stroke", "black");
            $(".axis path").css("shape-rendering", "cripsEdges");

            $("line").css("fill", "none");
            $("line").css("stroke", "black");
            $("line").css("stroke-width", "2px");
            $("line").css("shape-rendering", "cripsEdges");

            $(".axis text").css("font-family", "sans-serif");
            $(".axis text").css("font-size", "11px");
		});
	};
};


// Function which generates a scatterplot given data and visualization parameters.
function scatterPlot(width, height, margin, data, color, radius, xAxis, yAxis) {

    var svg = d3.select("body").select("svg")

	var xScale = d3.scale.linear()
		.domain([d3.min(data, function(d) { return d[xAxis]; }) - 1,
				 d3.max(data, function(d) { return d[xAxis]; }) + 1])
		.range([0, width - margin.right])
		.nice();

	var yScale = d3.scale.linear()
		.domain([0,
				 d3.max(data, function(d) { return d[yAxis]; }) + 1])
		.range([height - margin.top, 0])
		.nice();

	var circles = svg.selectAll("circle")
		.data(data)
		.enter()
		.append("circle")
		.attr("cx", function(d) {
			return xScale(d[xAxis]);
		})
		.attr("cy", function(d) {
			return yScale(d[yAxis]);
		})
		.attr("r", radius)
		.attr("fill", color)
		.attr("stroke", color);

	var labels = svg.selectAll("text")
		.data(data)
		.enter()
		.append("text")
		.text(function(d) {
				return d["name"];
			})
			.attr("x", function(d) {
				return xScale(d[xAxis]) + 5;
			})
			.attr("y", function(d) {
				return yScale(d[yAxis]);
			})
		.attr("font-family", "sans-serif")
		.attr("font-size", "11px")
		.attr("fill", "black");

	var xAx = d3.svg.axis()
		.scale(xScale)
		.orient("bottom")
		.tickFormat(d3.format("0000"))
		.ticks(width / 50);

	svg.append("text")
    	.text(xAxis)
    	.attr("x", width/2)
    	.attr("y", height - 10)
    	.attr("font-family", "sans-serif")
		.attr("font-size", "11px")
		.attr("fill", "black");

	var yAx = d3.svg.axis()
		.scale(yScale)
		.orient("left")
		.ticks(height / 50);

	svg.append("text")
    	.text(yAxis)
    	.attr("transform", "translate(10," + height/2 + ")rotate(-90)")
    	.attr("font-family", "sans-serif")
		.attr("font-size", "11px")
		.attr("fill", "black");

	svg.append("g")
            .attr("class", "axis")
            .attr("transform", "translate(0," + (height - 40) + ")")
            .call(xAx);

    svg.append("g")
           .attr("class", "axis")
           .attr("transform", "translate(40,-10)")
           .call(yAx);

    $(".axis path").css("fill", "none");
    $(".axis path").css("stroke", "black");
    $(".axis path").css("shape-rendering", "cripsEdges");

    $(".axis line").css("fill", "none");
    $(".axis line").css("stroke", "black");
    $(".axis line").css("shape-rendering", "crispEdges");

    $(".axis text").css("font-family", "sans-serif");
    $(".axis text").css("font-size", "11px");
};

// Function which generates a vertical bar graph given data and visualization parameters.
function vBarGraph(width, height, margin, data, color, xAxis, yAxis) {

    var svg = d3.select("body").select("svg")

	var yScale = d3.scale.linear()
			.domain([0,
					 d3.max(data, function(d) { return d[yAxis]; }) + 1])
			.range([0, height - margin.top])
			.nice();

	var barWidth = ((width - margin.left - margin.right) / data.length) - 10;

	var bars = svg.selectAll("rect")
			.data(data)
			.enter()
			.append("rect")
			.attr("width", barWidth)
			.attr("height", function(d) {
				return yScale(d[yAxis]);
			})
			.attr("x", function(d, i) {
				return (barWidth + 10) * i + 30
			})
			.attr("y", function(d) {
				return (height - margin.bottom) - yScale(d[yAxis]) - 20;
			})
			.attr("fill", color)
			.attr("stroke", color);

	var labels = svg.selectAll("text")
			.data(data)
			.enter()
			.append("text")
			.text(function(d) {
				return d[xAxis];
			})
			.attr("x", function(d, i) {
				return (barWidth + 10) * i + barWidth/2
			})
			.attr("y", height - 20)
			.attr("font-family", "sans-serif")
			.attr("font-size", "11px")
			.attr("fill", "black");

	var yAx = d3.svg.axis()
		.scale(d3.scale.linear()
			.domain([0,
					 d3.max(data, function(d) { return d[yAxis]; }) + 1])
			.range([height - margin.top, 0])
			.nice())
		.orient("left")
		.ticks(height / 50)

	svg.append("text")
    	.text(yAxis)
    	.attr("transform", "translate(10," + height/2 + ")rotate(-90)")
    	.attr("font-family", "sans-serif")
		.attr("font-size", "11px")
		.attr("fill", "black");

	svg.append("text")
    	.text(xAxis)
    	.attr("x", width/2)
    	.attr("y", height - 5)
    	.attr("font-family", "sans-serif")
		.attr("font-size", "11px")
		.attr("fill", "black");

    svg.append("g")
           .attr("class", "axis")
           .attr("transform", "translate(30,-20)")
           .call(yAx);

    svg.append("line")
    	.attr("x1", margin.left + 10 )
    	.attr("y1", height - margin.bottom - 20)
    	.attr("x2", width)
    	.attr("y2", height - margin.bottom - 20);

    $(".axis path").css("fill", "none");
    $(".axis path").css("stroke", "black");
    $(".axis path").css("shape-rendering", "cripsEdges");

    $("line").css("fill", "none");
    $("line").css("stroke", "black");
    $("line").css("stroke-width", "2px");
    $("line").css("shape-rendering", "cripsEdges");

    $(".axis text").css("font-family", "sans-serif");
    $(".axis text").css("font-size", "11px");

};

var pieChart = function(data,names,values,colors,radius){
  //data is a file, values is the section of the data we want to chart, colors is an array, radius is the size of the chart

  names = typeof names !== 'undefined' ? names : findNumeric(data);
  values = typeof values !== 'undefined' ? values : findNumeric(data);
  colors = typeof colors !== 'undefined' ? a : ['#0033FF','#3366FF','#0033CC','#0066FF','#6699FF','#3366CC','#003399','#3399FF','#0066CC','#0099FF','#99CCFF','#6699CC','#336699','#003366','#66CCFF','#3399CC','#006699','#33CCFF','#0099CC','#00CCFF'];//["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"];
  radius = typeof radius !== 'undefined' ? radius : 300;

  var width = radius * 2,
    height = radius * 2;

  var color = d3.scale.ordinal()
    .range(colors);

  var arc = d3.svg.arc()
    .outerRadius(radius - 10)
    .innerRadius(0);

  var pie = d3.layout.pie()
    .sort(null)
    .value(function(d) { return d[values]; });

  var svg = d3.select("body").append("svg")
    .attr("width", width)
    .attr("height", height)
  .append("g")
    .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

    d3.json(data, function(error, data) {
          for (value in data[0]){
          console.log(data[0][value])
        }
    
        data.forEach(function(d) {
          d[values] = +d[values];
        });
    
        var g = svg.selectAll(".arc")
            .data(pie(data))
          .enter().append("g")
            .attr("class", "arc");
    
        g.append("path")
            .attr("d", arc)
            .style("fill", function(d) { return color(d.data[names]); });
    
        g.append("text")
            .attr("transform", function(d) { return "translate(" + arc.centroid(d) + ")"; })
            .attr("dy", ".35em")
            .style("text-anchor", "middle")
            .text(function(d) { return d.data[names]; });
    
      })

    $(".arc path").css("stroke", "#fff");
  

}

var makeLineGraph = function(data,height,width,xvalues,yvalues,color){

  var margin = {top: 20, right: 40, bottom: 30, left: 100}
  
  var x = d3.scale.linear()
    .range([0, width]);

  var y = d3.scale.linear()
    .range([height, 0]);

  var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom");

  var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left");

  var line = d3.svg.line()
    .x(function(d) { return x(d[xvalues]); })
    .y(function(d) { return y(d[yvalues]); });

  var svg = d3.select("body").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  d3.json(data, function(error, data) {


  // data.forEach(function(d) {
  //     d[xvalues] = +d[xvalues];
  //     d[yvalues] = +d[yvalues];
  //   });

    x.domain(d3.extent(data, function(d) { return d[xvalues]; }));
    y.domain(d3.extent(data, function(d) { return d[yvalues]; }));

    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .attr('fill','none')
        .attr('stroke','#000')
        .call(xAxis)
      .append("text")
        .attr("dx", ".71em")
        .attr("x",width + 20)
        .style("text-anchor", "end")
        .text(xvalues);

    svg.append("g")
        .attr("class", "y axis")
        .attr('fill','none')
        .attr('stroke','#000')
        .call(yAxis)
      .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .text(yvalues);

    svg.append("path")
        .datum(data)
        .attr("stroke",color)
        .attr("d", line(data))
        .attr("fill", 'none');
  });

    $(".axis path").css("fill", "none");
    $(".axis path").css("stroke", "black");
    $(".axis path").css("shape-rendering", "cripsEdges");
  
}

// Function which generates a horizontal bar graph given data and visualization parameters.
function hBarGraph(width, height, margin, data, color, xAxis, yAxis) {

    var svg = d3.select("body").select("svg")

	var xScale = d3.scale.linear()
			.domain([0,
					 d3.max(data, function(d) { return d[xAxis]; }) + 1])
			.range([margin.left, width - margin.right])
			.nice();

	var barHeight = ((height - 30) / data.length) - 10;

	var bars = svg.selectAll("rect")
			.data(data)
			.enter()
			.append("rect")
			.attr("width", function(d) {
				return xScale(d[xAxis]);
			})
			.attr("height", barHeight)
			.attr("x", margin.left + 35)
			.attr("y", function(d, i) {
				return (barHeight + 10) * i
			})
			.attr("fill", color)
			.attr("stroke", color);

	var labels = svg.selectAll("text")
			.data(data)
			.enter()
			.append("text")
			.text(function(d) {
				return d[yAxis];
			})
			.attr("transform", function(d, i) { 
				var yPos = (barHeight + 10) * i + (barHeight/2);
				return "translate(30," + yPos + ")rotate(-90)";})
			.attr("font-family", "sans-serif")
			.attr("font-size", "11px")
			.attr("fill", "black");

	var xAx = d3.svg.axis()
		.scale(xScale)
		.orient("bottom")
		.ticks(width / 50);

    svg.append("g")
        .attr("class", "axis")
        .attr("transform", "translate(30," + (height - 35) + ")")
        .call(xAx);;

    svg.append("text")
    	.text(xAxis)
    	.attr("x", width/2)
    	.attr("y", height - 10)
    	.attr("font-family", "sans-serif")
		.attr("font-size", "11px")
		.attr("fill", "black");

	svg.append("text")
    	.text(yAxis)
    	.attr("transform", "translate(10," + height/2 + ")rotate(-90)")
    	.attr("font-family", "sans-serif")
		.attr("font-size", "11px")
		.attr("fill", "black");

    svg.append("line")
    	.attr("x1", 35 )
    	.attr("y1", height - 35)
    	.attr("x2", 35)
    	.attr("y2", margin.top - 10);

    $(".axis path").css("fill", "none");
    $(".axis path").css("stroke", "black");
    $(".axis path").css("shape-rendering", "cripsEdges");

    $("line").css("fill", "none");
    $("line").css("stroke", "black");
    $("line").css("stroke-width", "2px");
    $("line").css("shape-rendering", "cripsEdges");

    $(".axis text").css("font-family", "sans-serif");
    $(".axis text").css("font-size", "11px");

};