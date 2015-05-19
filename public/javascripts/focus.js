VRL.TheFocus = function (docWidth, docHeight, extraSpaces) {
	"use strict";
	// default settings
	var margin = {
		top : 0,
		bottom : 10,
		left : 10,
		right : 10
	};

	var padding = {
		top : 10,
		bottom : 20,
		left : 40,
		right : 40
	};

	var width = docWidth - margin.left - margin.right - extraSpaces;
	var height = 200;


	var noOfData = 0;
	var noOfSensorData = 0;

	//The total time range
	var startTimeRange = 0;
	var endTimeRange = 0;

	var panExtent = [0, 0];
	//

	var theData;
	var theSensorData = [];
	
	var theFocus;
	var theRange = d3.svg.brush();
	var theBrush = d3.svg.brush();
	var xFocus = d3.time.scale();
	var yFocus = d3.scale.linear();
	
	var yFocusArr = [];
	var yFocusArrIndex = {};
	var xAxisFocus = d3.svg.axis();
	var yAxisFocus = [];
	
	var axisSpace = 40;
	
	var lineGen = d3.svg.line();
	var theZoom = d3.behavior.zoom();
	var drag = d3.behavior.drag();
	
	var tooltip = d3.tip();
	
	var fullTimeRangeDifference = 0;
	var initialStartDateTime = 0;
	
	var leftAxisSpace = 0;
	var rightAxisSpace = 0;
	
	
	var lastZoomScale = 1;
	var previousZoomCaller = "";
	
	var container; //the container that contains all the SVG
	
	var isNoiseDataAvailable = false;
	
	//for the tooltip
	var div = d3.select("body")
				.append("div")
					.attr("class", "tooltip")
					.style("opacity", 0);
	
	//##############################################
	//For Observer Pattern
	
	var subject = new Subject();

	focus.addObserver = function addObserver(newObserver) {
		subject.observe(newObserver);
	};

	focus.removeObserver = function removeObserver(deleteObserver) {
		subject.unobserve(deleteObserver);
	};

	focus.handlesUpdated = function fetchRange() {
		// notify our observers of the stock change
		subject.notify(theRange, "focus");
	};
	//##############################################


	function focus(selection) {
		selection.each(function (data) {
			log("foc: focus");
			//var data = selection;
			theData = data;
			noOfData = data.length;
			
			
			
			//### Checking if the noise data is available or not
			theData.forEach(function (d) {
				//d = d.data();
				if(d.dataType() == 2 ) {
					isNoiseDataAvailable = true;
				}
			});
			
			
			
			//collecting all the sensor data in one place
			for(var i = 0; i < noOfData; i++) {
				if(theData[i].dataType() == 2) {
					theSensorData.push(theData[i]);
					yFocusArrIndex["" + i] = (theSensorData.length - 1) ;
				
					//log("foc: ###" + yFocusArrIndex["" + i])
				}
			}			
			noOfSensorData = theSensorData.length;
			//log("foc: noOfSensorData = " +noOfSensorData)
			
			
			leftAxisSpace = 0;
			rightAxisSpace = 0;
			
			var noOfSpaces = noOfSensorData - 2;
			if(noOfSpaces < 0) {
				noOfSpaces = 0;
			}			
						
			if(noOfSpaces % 2 == 0) {
				leftAxisSpace = (noOfSpaces/2) * axisSpace;
				rightAxisSpace = leftAxisSpace;
			}
			else {
				leftAxisSpace = (noOfSpaces + 1)/2 * axisSpace;
				rightAxisSpace = (noOfSpaces - 1)/2 * axisSpace;
			}
			
			log("foc: no of spaces needed = " + noOfSpaces )
			log("foc: leftAxisSpace  = " + leftAxisSpace + " rightAxisSpace  = " + rightAxisSpace)
			//rightAxisSpace = 60;
			
			
			
			//calculateTimeRange(data);
			
			var xDomain = [];
			data.forEach(function (d) {
				d = d.data();
				//log("foc:d = " + d);
				d.map(function (dd) {
					//log("foc:dd = " + dd.timestamp);
					xDomain.push(new Date(dd.timestamp - 0).getTime());
				});

			});
			
			//### Calculating the start and the end timeline among the data ###
			var startValue = xDomain[0] - 0;
			var startIndex = 0;
			var endValue   = xDomain[xDomain.length - 1] - 0;
			var endIndex   = xDomain.length - 1;
			for(var i = 0; i < xDomain.length; i++) {
				if(xDomain[i] < startValue) {
					startValue = xDomain[i];
					startIndex = i;
				}
				if(xDomain[i] > endValue) {
					endValue = xDomain[i];
					endIndex = i;
				}
			}
			var temp = xDomain[0];
			xDomain[0] = startValue;
			xDomain[startIndex] = temp;
			
			temp = xDomain[xDomain.length - 1];
			xDomain[xDomain.length - 1] = endValue;
			xDomain[endIndex] = temp;
					
			var startDate = new Date(startValue - 0);
			var lastDate = new Date(endValue - 0);
			//log("foc:start date :" + startDate);
			//log("foc:Stop date :" + lastDate);
			//###-----------------------------------------------------------------
			
			
			
			startTimeRange = xDomain[0];
			endTimeRange = xDomain[xDomain.length - 1];
			
			initialStartDateTime = startTimeRange;
			fullTimeRangeDifference = (new Date(endTimeRange).getTime()) - (new Date(startTimeRange).getTime())
			log("foc: fullTimeRangeDifference : " + fullTimeRangeDifference)
			
			panExtent = [startTimeRange, endTimeRange];
			
			var yValues = [];
			theSensorData.forEach(function (d) {
				d = d.data();
				d.map(function (dd) {
					yValues.push(dd.value - 0);
				});

			});
			var yMax = d3.max(yValues);
			//log("focus: yMax = " + yMax);
			
			//### Arrays of sensor values for each sensor data for finding the max values in each array
			var yValArr = [noOfSensorData];
			theSensorData.forEach(function (d, index) {
				d = d.data();
				yValArr[index] = [];
				d.map(function (dd) {
					yValArr[index].push(dd.value - 0);
				});

			});		
			
			//### Now finding the max and min value for each of the arrays of sensordata
			var yMaxArr = [];
			var yMinArr = [];
			for(var i = 0; i < noOfSensorData; i++){
				yMaxArr.push(d3.max(yValArr[i]));
				yMinArr.push(d3.min(yValArr[i]));
			}
			
			//### Calculating the available height and width for the chart
			var availableWidth = width - padding.left - padding.right - leftAxisSpace - rightAxisSpace ;
			var availableHeight = height - padding.top - padding.bottom ; //10 so that the x-axis ticks are longer
			//log("foc: availableWidth = " + availableWidth)

			
			container = d3.select(this);
			var svg = container.append('svg')
				.attr('width', width + margin.left + margin.right)
				.attr('height', height + margin.top + margin.bottom);

				
			xFocus = d3.time.scale().range([0, availableWidth]); //.nice(d3.time.day) //for theFocus			
			yFocus = d3.scale.linear().range([availableHeight, 0]);

			
			//var formatTime = d3.time.format("%H:%M");
			//var formatMinutes = function(d) { return formatTime(new Date(2015, 0, 1, 0, d)); };
			xAxisFocus 			= d3.svg.axis().scale(xFocus).orient('bottom');//.tickFormat(d3.time.format("%X"));
			for(var i = 0; i < noOfSensorData; i++ ) {
				
				yFocusArr.push(d3.scale.linear().range([availableHeight, 0]));			
				
				if(i % 2 == 0) {
					//even
					yAxisFocus.push(
							d3.svg.axis()
									.scale(yFocusArr[i])
									.orient('left')
					);
				}
				else {
					//odd
					yAxisFocus.push(
							d3.svg.axis()
									.scale(yFocusArr[i])
									.orient('right'));
				}
			}
           // var yAxisFocusLeft 	= d3.svg.axis().scale(yFocus).orient('left');
           // var yAxisFocusRight = d3.svg.axis().scale(yFocus).orient('right');

		   log("foc: yFocusArr length = " + yFocusArr.length);
		   
			xFocus.domain(d3.extent(xDomain));			
			yFocus.domain([0, yMax + 2]);			
			for(var i = 0; i < noOfSensorData; i++) {
				var extraHeight = 0.15 * (yMaxArr[i] - yMinArr[i]);
					//log("foc: " + i + " = extra space = " + extraHeight);
				yFocusArr[i].domain([0, yMaxArr[i] + extraHeight]); 
				//extra height added so that the max value is can be seen properly in the y-axis
			}
			
			
						
			svg.append('defs').append('clipPath')
				.attr('id', 'clip')
			  .append('rect')
				.attr('transform', 'translate(' + (0  ) + ',' + (0) + ')')
				.attr('width', availableWidth)
				.attr('height', availableHeight + margin.bottom + padding.bottom); //just adding some more height so that the lines are shown smooth - not cut out

			var wrap = svg.append('g')
				.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

			//log("foc: padding.left = " + padding.left)
			//padding.left = padding.left + (noOfSensorData  / 2) * 10;
			//log("foc: padding.left = " + padding.left)
			
			theFocus = wrap.append('g')
				.attr('id', 'theFocus')
				.attr('class', 'theFocus')
				.attr('transform', 'translate(' + (padding.left ) + ',' + (padding.top) + ')');

			//### a temporary place	
			theFocus.append("g")
				.attr('id', 'theTemp');
						
			
			//### the Zoom effect	
			theZoom = d3.behavior.zoom()
								.x(xFocus)
								.scaleExtent([1, 111])
								.on("zoom", focus.zoomed); //.x(x1).scaleExtent([1,10])		
		
			//### the area where the zooming can be detected.
			theFocus.append("rect")
					.attr("class", "pane")
					.attr("width", availableWidth)
					.attr("height", availableHeight )
					.attr('transform', 'translate(' + (leftAxisSpace  ) + ',' + (padding.top) + ')')
					.call(theZoom);
			
			//### the tooltip -- not in use right now
			tooltip = d3.tip()
					.attr('class', 'd3-tip')
					.offset([-10, 0])
					.html(function (d, index) {
						log("foc:  " + index)
						return "<strong>Frequency:</strong> <span style='color:red'>" + d + "</span>";
					})	
			//theFocus.call(tooltip);	
			
			
			
			
			
			//line generator			
			lineGen = d3.svg.line()
							.x(function (d) {
								return xFocus(new Date(d.timestamp - 0));
							})
							.y(function (d, i) {
								log("foc: " + i)
								return yFocus(d.value - 0);
							})
							.interpolate("monotone");
			
			//### draw the lines
			focus.drawLines(data);

			//### draw the y-axes 
			for(var i = 0; i < noOfSensorData; i++ ) {
				
				var unit = theSensorData[i].dataInfo().unit;	
				
				if(i % 2 == 0) {
					var evenIndex = i / 2;
					theFocus.append('g')
						.attr('id', 'axis' + i)
						.attr('class', 'y axis')
						.attr('transform', 'translate(' + (evenIndex * axisSpace) + ')')
						.call(yAxisFocus[i]);
					
					
					//the y-axis label		
					theFocus.append("text")
						.attr('class', 'y-axis-label')
						.attr("text-anchor", "middle")  // this makes it easy to centre the text as the transform is applied to the anchor
						.attr("transform", "translate("+ (evenIndex * axisSpace - 20) +","+(availableHeight/2)+")rotate(-90)")  // text is drawn off the screen top left, move down and out and rotate
						.text(theSensorData[i].dataName() + " (" + unit + ")");
						
					//removing the topmost tick that is usually without label
					theFocus.select("#"+ "axis" + i + " path").attr("d", "M0,0H0V170H-6H16"); //remove the H16 at the end if the lines don't look good
								
					theFocus.select("#"+ "axis" + i )
						.append("line")
						.attr("id", "valueTick" + i)
						.attr("x1", -6)
						.attr("y1", 0)
						.attr("x2", 6)
						.attr("y2", 0)
						.attr("visibility", "hidden")
						.attr("stroke-width", 2)
						.attr("stroke", "#00FF00");
				}
				else {
					var oddIndex = (i - 1) / 2;
					theFocus.append('g')
						.attr('id', 'axis' + i)
						.attr('class', 'y axis')
						.attr('transform', 'translate(' + (availableWidth + leftAxisSpace+  (oddIndex * axisSpace))  + ')')
						.call(yAxisFocus[i]);
						
					//the y-axis label		
					theFocus.append("text")
						.attr('class', 'y-axis-label')
						.attr("text-anchor", "middle")  // this makes it easy to centre the text as the transform is applied to the anchor
						.attr("transform", "translate("+ (availableWidth + leftAxisSpace +  (oddIndex * axisSpace) + 30) +","+(availableHeight/2)+")rotate(-90)")  // text is drawn off the screen top left, move down and out and rotate
						.text(theSensorData[i].dataName() + " (" + unit + ")");
						
						
					//removing the topmost tick that is usually without label
					theFocus.select("#"+ "axis" + i + " path").attr("d", "M0,0H0V170H6H-16"); //remove the H16 at the end if the lines don't look good
					
					theFocus.select("#"+ "axis" + i )
						.append("line")
						.attr("id", "valueTick" + i)
						.attr("x1", -6)
						.attr("y1", 0)
						.attr("x2", 6)
						.attr("y2", 0)
						.attr("visibility", "hidden")
						.attr("stroke-width", 2)
						.attr("stroke", "#00FF00");
				}
			

				
				
				//### color the axis based on the line color ###
				$("#axis" + i + " line").css("stroke", theSensorData[i].style.dataColor());
				$("#axis" + i + " path").css("stroke", theSensorData[i].style.dataColor());
			}
			/*
			theFocus.append('g')
                .attr('class', 'y axis')
                .call(yAxisFocusLeft);

            theFocus.append('g')
					.attr('class', 'y axis')
					.attr('transform', 'translate(' + availableWidth + ',0)')
					.call(yAxisFocusRight);
			*/
			
			//log("foc: leftAxisSpace  = " + leftAxisSpace + " rightAxisSpace  = " + rightAxisSpace)
			
			theFocus.append('g')
					.attr('id', 'xaxis')
					.attr('class', 'x axis')
					.attr('transform', 'translate(' + (leftAxisSpace) +',' + availableHeight + ')')
					.call(xAxisFocus);

			theFocus.selectAll("#xaxis line").attr("y2", 15);
			theFocus.selectAll("#xaxis text").attr("y", 19);
			
			theFocus.append('g')
					.attr('class', 'x brush')
					.call(theBrush);

			//.x(x1).scaleExtent([1,10]) //limits zoom from 1X to 10X
		
			
			/*
			drag = d3.behavior.drag()
								.origin(function(d) { return d; })
								.on("dragstart", dragstarted)
								.on("drag", dragged)
								.on("dragend", dragended);		
			
			*/
			
			/*
			//Used for zoom function
			//this is where the zooming is detected
			theFocus.append("rect")
						.attr("class", "pane")
						.attr("width", availableWidth)
						.attr("height", availableHeight - 20)
						.call(theZoom);
			*/
			
			// Don't allow the brushing from background and single click theFocus switch
			theFocus.select(".background")
					.on("mousedown.brush", nobrush)
					.on("touchstart.brush", nobrush);

					
			
			
			//#######################################################
			function brushed() {
				//log("foc: extent: " + theBrush.extent());
				theRange = theBrush.extent();
				for (var i = 0; i < noOfData; i++) {
					//theFocus.select('.line').attr('d', lineGen(data[0].data())); //lineContext //show the theFocus line
				}
				
				theZoom.x(xFocus);
				
				subject.notify(theRange, "focus"); //notifying all the observers about the change in range
			}

			function nobrush(a, b, c) {
				//to stop the brushing from the chart background
				//log('foc: Brushing from background diabled')
				d3.event.stopPropagation()
			}

			function calculateTimeRange(data) {
				//log("foc: calculating time range");
				var start,
				end;
				if (data.length >= 1) {
					start = data[0].data();
					start = start[0].timestamp + 0;
					//log("foc: start: " + start);

					end = data[0].data();
					end = end[end.length - 1].timestamp + 0;
					//log("foc: end: " + end);
				}
				if (data.length > 1) {
					for (var i = 1; i < data.length; i++) {
						var s = data[i].data();
						s = s[0].timestamp + 0;

						var e = data[i].data();
						e = e[e.length - 1].timestamp + 0;

						if (s < start) {
							startTimeRange = s;
						}
						if (e > end) {
							endTimeRange = e;
						}
					}

				}
			}

			//#######################################################
		

		});

		return focus;
	}

	// Expose Public Variables

	focus.margin = function (_) {
		if (!arguments.length)
			return margin;
		margin.top = typeof _.top !== 'undefined' ? _.top : margin.top;
		margin.right = typeof _.right !== 'undefined' ? _.right : margin.right;
		margin.left = typeof _.left !== 'undefined' ? _.left : margin.left;
		margin.bottom = typeof _.bottom !== 'undefined' ? _.bottom : margin.bottom;
		return focus;
	};

	focus.padding = function (_) {
		if (!arguments.length)
			return padding;
		padding.top = typeof _.top !== 'undefined' ? _.top : padding.top;
		padding.right = typeof _.right !== 'undefined' ? _.right : padding.right;
		padding.left = typeof _.left !== 'undefined' ? _.left : padding.left;
		padding.bottom = typeof _.bottom !== 'undefined' ? _.bottom : padding.bottom;
		return focus;
	};

	focus.width = function (_) {
		if (!arguments.length)
			return width;
		width = _;
		return focus;
	};

	focus.height = function (_) {
		if (!arguments.length)
			return height;
		height = _;
		return focus;
	};


	
	
	function genLine(dd, index) {
		
		//log("foc: d = " + JSON.stringify(dd))
		//log("foc: index = " + index)
		var theLine = d3.svg.line()
							.x(function (d) {
								//log("foc: index = " + index)
								return xFocus(new Date(d.timestamp - 0));
							})
							.y(function (d) {
								//log("foc: index = " + yFocusArr[index])
								return yFocusArr[index](d.value - 0);
							})
							.interpolate("monotone");
				return theLine(dd)
	}
	
//################################################################################################################
//################################################################################################################
	
	focus.drawLines = function(data) {
		
		//### Displaying the selected time range at the top
		theRange = xFocus.domain();
		var startTime = new Date(theRange[0] - 0).toLocaleString();
		var endTime   = new Date(theRange[1] - 0).toLocaleString();
		
		if(theRange[0] == "Invalid Date") {
			startTime = "unknown";
			endTime = "unknown";
		}
		
		$("#timeRangeFromText").text(startTime);
		$("#timeRangeToText").text(endTime);
		
		
		//### drawing each type of data
		for (var i = 0; i < noOfData; i++) {
			
			if(data[i].dataType() == 0) {
				//Nominal values
				var d = data[i].data();
				var d2 = data[i];
				//d = d.values;					
				d.map(function(dd, index) {
					
					theFocus.append('circle')
							.attr("id", "circleNominal" + i + "-" + index)
							.attr('class', 'theCircle dataElement data' + i )
							.attr("cx", xFocus(dd.timestamp))
							.attr("cy", function() {
								if(isNoiseDataAvailable) {
									return yFocus(0);
								}
								else {
									return 100;
								}
							})
							.attr("r", data[i].style.userNodeFocusRadius())
							.attr('stroke', data[i].style.dataColor()) //based on the index
							.attr('stroke-width',  data[i].style.lineSize())
						.attr('transform', 'translate(' + (leftAxisSpace  ) + ',' + (0) + ')')
							.attr('fill', data[i].styles[dd.value])							
						.on("mouseover", function () {
							//### Bringing it to the front
							this.parentNode.appendChild(this);
							
							var index = $(this).attr("id").substring(13,14) - 0;
							div.transition().duration(100).style("opacity", .9);
														
							
							//### Offset the tooltip based on which side of the screen (left or right) the data node is in
							var xOffset = 0;
							if(d3.event.pageX > docWidth / 2) {
								xOffset = 0 - 140;
							}
							else {
								xOffset = 10;
							}
							
							//### the tooltip
							div.html( "<span class='.tooltipMainValue'>" + dd.value + "</span>")
								.style("left", (d3.event.pageX + xOffset) + "px")
								.style("top", (d3.event.pageY - 28) + "px")
								.attr('r', 8);
							
							//### change the radius of the circle
							d3.select(this)
								/*
								.attr("cy", function() {
								if(isNoiseDataAvailable) {
										return yFocus(1);
									}
									else {
										return 95;
									}
								})*/
								.attr('r', (data[index].style.userNodeFocusRadius() + 4))
								.attr("fill-opacity", .9);
								
							//### notify that the item has been highlighted
							subject.notify(theRange, "itemHighlighted", $(this).attr("id"), dd.timestamp );
								
						}).on("mouseout", function () {
							//### revert back to default
							var index = $(this).attr("id").substring(13,14) - 0;
							div.transition().duration(100).style("opacity", 0)
							
							d3.select(this)
								.attr("cy", function() {
									if(isNoiseDataAvailable) {
										return yFocus(0);
									}
									else {
										return 100;
									}
								})
								.attr('r', data[index].style.userNodeFocusRadius())
								.attr("fill-opacity", 1);
								
							//### notify that there is no more highlight
							subject.notify(theRange, "itemHighlightedOut", $(this).attr("id"), dd.timestamp );	
						});		
					
					/*
					//tooltip using jQuery tipsy
					$("#circleNominal" + i + "-" + index).tipsy({ 
							gravity: 'sw', 
							html: true, 
							title: function() {								 
								return '<span style="color:#fff">' + dd.value + '</span>'; 
							}
					});
					*/
					
						
				});
									
			}
			else if(data[i].dataType() == 1){
				//Ordinal values
				var d = data[i].data();
				
				//d = d.values;					
				d.map(function(dd, index) {
					//var startPos = xFocus(dd.timestamp);
					log("foc: ordinal data " + getKey(data[i].dataInfo(), dd.value - 0))
					
					theFocus.append('circle')
							.attr("id", "circleOrdinal" + i + "-" + index)
							.attr('class', 'theCircle dataElement data' + i )
							.attr("cx", xFocus(dd.timestamp))
							.attr("cy", function() {
								if(isNoiseDataAvailable) {
									return yFocus(0);
								}
								else {
									return 100;
								}
							})
							.attr("r", (data[i].style.userNodeFocusRadius() ))
							.attr('stroke', data[i].styles[dd.value]) //based on the index
							.attr('stroke-width', data[i].style.lineSize())
						.attr('transform', 'translate(' + (leftAxisSpace  ) + ',' + (0) + ')')
							.attr('fill', data[i].styles[dd.value])													
						.on("mouseover", function () {
							//### Bringing it to the front
							this.parentNode.appendChild(this);
							
							var index = $(this).attr("id").substring(13,14) - 0;
							
							div.transition().duration(100).style("opacity", .9);
							
							//### the tooltip showing the value
							var valIs = getKey(data[index].dataInfo(), dd.value - 0);
							
							
							//### Offset the tooltip based on which side of the screen (left or right) the data node is in
							var xOffset = 0;
							if(d3.event.pageX > docWidth / 2) {
								xOffset = 0 - 140;
							}
							else {
								xOffset = 10;
							}
							
							div.html( "<span class='.tooltipMainValue'>" + valIs + "</span>")
								.style("left", (d3.event.pageX + xOffset) + "px")
								.style("top", (d3.event.pageY - 28) + "px")
								.attr('r', 8);
								
							//### increase the radius of the circle to show selection
							d3.select(this)
								/*
								.attr("cy", function() {
									if(isNoiseDataAvailable) {
										return yFocus(1);
									}
									else {
										return 95;
									}
								})*/
								.attr('r', (data[index].style.userNodeFocusRadius() + 4))
								.attr("fill-opacity", .9);
								
							//### notify that the item has been highlighted
							subject.notify(theRange, "itemHighlighted", $(this).attr("id"), dd.timestamp );
								
								
						}).on("mouseout", function () {
							//revert back to default
							var index = $(this).attr("id").substring(13,14) - 0;
							div.transition().duration(100).style("opacity", 0)
							
							d3.select(this)
								.attr("cy", function() {
									if(isNoiseDataAvailable) {
										return yFocus(0);
									}
									else {
										return 100;
									}
								})
								.attr('r', (data[index].style.userNodeFocusRadius() ))
								.attr("fill-opacity", 1);
							
							//### notify that there is no more highlight
							subject.notify(theRange, "itemHighlightedOut", $(this).attr("id"), dd.timestamp );	
							
						});		
							
					/*
					//### Tooltip with jQuery tipsy	
					$("#circleOrdinal" + i + "-" + index).tipsy({
								gravity: 'sw', 
								html: true, 
								title: function() {									
									var valIs = getKey(dataInfo, dd.value - 0);								
									return '<span style="color:#fff">' + valIs + '</span>'; 
								}
					});
					*/		
				});
									
			}
			else if(data[i].dataType() == 2) {
				//### 
				var maxVal = data[i].dataInfo().max;
				var minVal = data[i].dataInfo().min;
				
				
				//the sensor data
				//log("foc: i = " + i + "  yFocus Arr Index = " + (yFocusArrIndex["" + i] - 0))
				theFocus.append("g")
					.attr("id", "line" + (yFocusArrIndex["" + i] - 0) + "cover")
					.attr('class', 'lineCovers dataElement data' + i )
				.append('path')
					.attr("id", "line" + (yFocusArrIndex["" + i] - 0))
					.attr('class', 'theLine')
					.attr('d', genLine(data[i].data(), (yFocusArrIndex["" + i] - 0)))
					.attr('stroke', data[i].style.dataColor())
					.attr('stroke-width', data[i].style.lineSize())
				.attr('transform', 'translate(' + (leftAxisSpace  ) + ',' + (0) + ')')
					.attr('fill', 'none');
					
				
				//### drawing circles for each datapoints/nodes
				theFocus.select("#line" + (yFocusArrIndex["" + i] - 0) + "cover")
						.selectAll(".dot")
						.data(function () {
							return data[i].data();
						})
					.enter()
					.append("circle")
						.attr("id", function(dd) { 
							return "circlePoint" + i + "" + (dd.timestamp - 0);
						})
						.attr('class', 'theCircle')
						.attr("stroke", function (dd) {
							//log("foc: " + data[i].style.dataColor())
							return data[i].style.dataColor(); //return color("#00ff00")//this.parentNode.__data__.name)
						})
						.attr("cx", function (dd) {
							return xFocus(new Date(dd.timestamp - 0));
						})
						.attr("cy", function (dd) {
							return yFocusArr[(yFocusArrIndex["" + i] - 0)](dd.value - 0);//yFocus(dd.value - 0);
						})
						.attr("r", function() {
								return data[i].style.lineNodeRadius() - 0;
						})
						.attr("fill", function(dd) {
							//log(dd.value)
							if(dd.value == maxVal) {
								return data[i].style.dataColor();
							}
							else if (dd.value == minVal) {
								return data[i].style.dataColor();
							}
							else {
								return "white";
							}
						})
						.attr("fill-opacity", 1)
						.attr("stroke-width", data[i].style.lineSize())
					.attr('transform', 'translate(' + (leftAxisSpace  ) + ',' + (0) + ')')
						.on("mouseover", function (dd) {
							var index = $(this.parentNode).attr("id").substring(4,5) - 0;
							
							div.transition().duration(100).style("opacity", .8);
							var val = dd.value - 0;
							//log("foc: val = " + val)
							
							
							//Offset the tooltip based on which side of the screen (left or right) the data node is in
							var xOffset = 0;
							if(d3.event.pageX > docWidth / 2) {
								xOffset = 0 - 140;
							}
							else {
								xOffset = 10;
							}
							
							var unit = theSensorData[index].dataInfo().unit;
							//log("foc: Data unit is " + unit + "######");
							
							//### the tooltip
							div.html( "<span class='.tooltipMainValue'>" + val.toFixed(3) + " " + unit + " </span>"
										+ "<br /><span class='tooltipOtherValue'>" + theSensorData[index].dataName()  + 
										"<br />" + new Date(dd.timestamp - 0).toLocaleString() + "</span>")
								.style("left", (d3.event.pageX + xOffset) + "px")
								.style("top", (d3.event.pageY - 28) + "px")
								.attr('r', 8);
								
							//### increase the radius and line size for the circle
							d3.select(this)
								.attr('r', (theSensorData[index].style.lineNodeRadius() + 3))
								.attr("fill", "white")
								.attr("stroke-width", theSensorData[index].style.lineSize() + 2)
								.attr("fill-opacity", 1);
							
							//### increase the line size by 2 to highlight the line
							d3.select("#line" + index )
								.attr('stroke-width', theSensorData[index].style.lineSize() + 2);
								
							//### Bringing the line that the circle belong to at the front
							var lastDataElementID = $( "#theFocus .dataElement" ).last().attr( "id" );							
							if(lastDataElementID != "#line" + index + "cover") {
								//move the current line into front
								this.parentNode.parentNode.appendChild(this.parentNode);
							}
							
							//### increase the size of the corresponding y-axis line
							d3.select("#axis" + index + " path" )
								.attr('stroke-width', 2);
							
							//### show the tick on the corresponding y-axis denoting the value
							var	newY = yFocusArr[index](dd.value - 0);
							theFocus.select("#valueTick" + index)
										.attr("x1", -6)
										.attr("y1", newY)
										.attr("x2", 6)
										.attr("y2", newY)
										.attr("visibility", "visible");
								
							
							//### notify that the item has been highlighted
							subject.notify(theRange, "itemHighlighted", $(this.parentNode).attr("id") );
								
							
						}).on("mouseout", function (dd) {
							//### bring back everything to their normal state
							
							var index = $(this.parentNode).attr("id").substring(4,5) - 0;
							
							div.transition().duration(100).style("opacity", 0)
														
							d3.select("#line" + index)
								.attr('stroke-width', theSensorData[index].style.lineSize());
							
							d3.select(this)
								.attr('r', theSensorData[index].style.lineNodeRadius())
								.attr("fill", function(dd) {
									var maxVal = theSensorData[index].dataInfo().max;
									var minVal = theSensorData[index].dataInfo().min;
									
									if(dd.value == maxVal) {
										return theSensorData[index].style.dataColor();
									}
									else if (dd.value == minVal) {
										return theSensorData[index].style.dataColor();
									}
									else {
										return "white";
									}
								})
								.attr("stroke-width", theSensorData[index].style.lineSize())
								.attr("fill-opacity", 1);
							
							d3.select("#axis" + index + " path")
								.attr('stroke-width', 1);
							
							theFocus.select("#valueTick" + index)
								.attr("visibility", "hidden");
								
								
							//### notify that there is no more highlight
							subject.notify(theRange, "itemHighlightedOut", $(this.parentNode).attr("id") );	
							
						});						
						
						/*
					d.map(function(d2, index) {	
						log("foc: #circlePoint" + i + "" + d2);
						$("#circlePoint" + i + "" + d2.timestamp).tipsy({
							gravity: 'n', 
							html: true, 
							title: function() {		
								var val = d2.value - 0;
								return '<span style="color:#fff">' + val.toFixed(3) + '</span>'; 
							}
						});
					});
						*/
					//log("foc: " + lineGen(data[i].data()));
			}
			
			
		}
		
	};
	
	function getKey(obj, val) {
		for (var key in obj) {
			if (val === obj[key])
				return key;
		}
	}
	
//######################################################################################################	
	
	focus.redrawLines = function(data) {
		
		for (var i = 0; i < noOfData; i++) {
			
			
			
			if(data[i].dataType() == 0) {
				//### Nominal data
				var d = data[i].data();				
				var d2 = data[i];
				d.map(function(dd, index) {
					//log("foc: here we go")
					theFocus.select("#" + "circleNominal" + i + "-" + index)
							.attr("cx", xFocus(dd.timestamp));
				});
			}
			else if(data[i].dataType() == 1) {
				//### Ordinal data
				var d = data[i].data();			
				var d2 = data[i];
				d.map(function(dd, index) {
					//log("foc: here we go")
					theFocus.select("#" + "circleOrdinal" + i + "-" + index)
							.attr("cx", xFocus(dd.timestamp));
							
				});
			}
			else if(data[i].dataType() == 2){
				//### Sensor data
				
				
				//log("foc: " + (yFocusArrIndex["" + i] - 0))
				theFocus.select('#' + 'line' + (yFocusArrIndex["" + i] - 0)).attr('d', genLine(data[i].data(), (yFocusArrIndex["" + i] - 0)));
				var d = data[i].data();
				
				//log("foc: d = "  + d)
				d.map(function(dd, index) {
					//log(dd.timestamp)//drawing circles for each datapoints/nodes
				/*
				theFocus.select("#line" + (yFocusArrIndex["" + i] - 0) + "cover")
						.selectAll(".dot")
						.data(function () {
							return data[i].data();
						})
					.enter()
					*/
					theFocus.select("#" + "circlePoint" + i + "" + dd.timestamp)
							.attr("cx", xFocus(new Date(dd.timestamp - 0)))
							.attr("cy", yFocusArr[(yFocusArrIndex["" + i] - 0)](dd.value - 0))
						.on("mouseover", function () {
							
							var index = $(this.parentNode).attr("id").substring(4,5) - 0;
							
							div.transition().duration(100).style("opacity", .9);
							var val = dd.value - 0;
							
							
							//### Offset the tooltip based on which side of the screen (left or right) the data node is in
							var xOffset = 0;
							if(d3.event.pageX > docWidth / 2) {
								xOffset = 0 - 140;
							}
							else {
								xOffset = 10;
							}
							
							var unit = theSensorData[index].dataInfo().unit;
							div.html( "<span class='.tooltipMainValue'>" + val.toFixed(3) + " " + unit + " </span>"
										+ "<br /><span class='tooltipOtherValue'>" + theSensorData[index].dataName()  + 
										"<br />" + new Date(dd.timestamp-0).toLocaleString() + "</span>")
								.style("left", (d3.event.pageX + xOffset) + "px")
								.style("top", (d3.event.pageY - 28) + "px")
								.attr('r', 8);
								
							//### increase the radius and line size for the circle
							d3.select(this)
								.attr('r', (theSensorData[index].style.lineNodeRadius() + 3))
								.attr("fill", "white")
								.attr("stroke-width", theSensorData[index].style.lineSize() + 2)
								.attr("fill-opacity", 1);
							
							//### increase the line size by 2 to highlight the line
							d3.select("#line" + index )
								.attr('stroke-width', theSensorData[index].style.lineSize() + 2);
									
							
							//### increase the size of the corresponding y-axis line
							d3.select("#axis" + index + " path" )
								.attr('stroke-width', 2);	
							
							//### show the tick on the corresponding y-axis denoting the value
							var	newY = yFocusArr[index](dd.value - 0);
							theFocus.select("#valueTick" + index)
										.attr("x1", -6)
										.attr("y1", newY)
										.attr("x2", 6)
										.attr("y2", newY)
										.attr("visibility", "visible");
									
							//### Bringing the line that the circle belong to at the front
							var lastDataElementID = $( "#theFocus .dataElement" ).last().attr( "id" );							
							if(lastDataElementID != "#line" + (yFocusArrIndex["" + i] - 0) + "cover") {
								//move the current line into front
								this.parentNode.parentNode.appendChild(this.parentNode);
							}
								
							
							//### notify that the item has been highlighted
							subject.notify(theRange, "itemHighlighted", $(this.parentNode).attr("id") );
						})
						.on("mouseout", function () {
							//### Bringing back everything to normal
							var index = $(this.parentNode).attr("id").substring(4,5) - 0;
							
							div.transition().duration(100).style("opacity", 0);
							
							d3.select("#line" + index )
								.attr('stroke-width', theSensorData[index].style.lineSize());
								
							d3.select(this)
								.attr('r', theSensorData[index].style.lineNodeRadius())
								.attr("fill", function() {								
									//### 
									var maxVal = theSensorData[index].dataInfo().max;
									var minVal = theSensorData[index].dataInfo().min;
									
									if(dd.value == maxVal) {
										return theSensorData[index].style.dataColor();
									}
									else if (dd.value == minVal) {
										return theSensorData[index].style.dataColor();
									}
									else {
										return "white";
									}
								
								})
								.attr("stroke-width", theSensorData[index].style.lineSize())
								.attr("fill-opacity", 1);
								
							d3.select("#axis" + index + " path")
								.attr('stroke-width', 1);
							
							
							theFocus.select("#valueTick" + index)
								.attr("visibility", "hidden");
								
								
							//### notify that there is no more highlight
							subject.notify(theRange, "itemHighlightedOut", $(this.parentNode).attr("id")  );	
						});
				});
			}
		}
		
		
	}
	
	focus.zoomed = function() {
		
		theRange = xFocus.domain();
		if (theFocus != undefined) {
			//var startD = new Date(theRange[0]).getTime();
			//var endD = new Date(theRange[1]).getTime();
			
			//log("foc: startD : " + startD + " endD : " + endD);
			//log("foc: fullTimeRangeDifference : " + fullTimeRangeDifference + " and d = " + (endD - startD) )
			//log("foc: scale : " + theZoom.scale())
			
			
			/*
			//don't go smaller than 1 seconds
			if(endD < (startD + 1000)){
				log("foc: here " );
				
				endD = startD + 1000;
				theRange[1] = new Date(endD);
				log("foc: startD : " + startD + " endD : " + endD);
				//context.select('.brush').call(theBrush.extent(theRange));
			}
			*/
			/*
			//Doesn't seem like we need it
			if(endD - startD > fullTimeRangeDifference) { 
				theRange[0] = startTimeRange;
				theRange[1] = startTimeRange + fullTimeRangeDifference;
				log("foc: too large");
			}
			*/
			log("foc: zoomed : ##################################################################");
			log("foc: scalea : " + theZoom.scale() + "#################################");	
			log("foc: range= " + theRange);
			//log("foc: domain= " + xFocus);
			subject.notify(theRange, "focusZoomed", theZoom.scale() );
			
		}
		
		
		//log("foc:theRange = " + theRange);
		//log("foc:scale : " + theZoom.scale());
		//var dateRangeDiff = new Date(theRange[1]).getTime() - new Date(theRange[0]).getTime();
		//log("foc:scale : " + theZoom.scale() + " dateRangeDiff : " + dateRangeDiff);
		
		//log("foc:zoom x : " + theZoom.x() + " y : " + theZoom.y());
		//log(theZoom.translate)
		//theZoom.x(xFocus);
		
		
	}
	
	focus.zoomed2 = function() {
		//check if domain is okay
		//log(startTimeRange)
	//log(d3.event.translate[0] + " - " + d3.event.translate[1] + " : " + theRange);
		//theZoom.translate([0,0]);
		//log(xFocus.domain().length)
		//log(xFocus.domain()[0] + " : "+ xFocus.domain()[1] + " : "+ startTimeRange )
		if(theZoom.scale() != 1){
			//if (xFocus.domain()[0] < x0.domain()[0]) {
			//	theZoom.translate([0, 0]);
			//if(xFocus.domain()[0] != startTimeRange){
				/*
			if(d3.event.translate[0] >= 0) {
				theZoom.translate([d3.event.translate[0], 0])
			}
			else { 
				theZoom.translate([0, 0])
			}
			*/
			
		}
		else {
			//theZoom.translate([0,0]);
		}
		
		theRange = xFocus.domain();
		if (theRange[0] < startTimeRange) {
			//log("foc:here")
		//	theRange[0] = startTimeRange;
		//	xFocus.domain()[0] = startTimeRange;
			
			
			//theZoom.translate([0,0]);
			//log("foc:not anymore " + theRange[0] + " : " + startTimeRange);
		}
		else { 
			//log("foc:not anymore " + theRange[0] + " : " + startTimeRange);
		}
		if (theRange[1] > endTimeRange) {
			//theZoom.translate([0,0]);
			//theRange[1] = endTimeRange;
			//xFocus.domain()[1] = endTimeRange;
		}
		else {
			//log("foc:yes, not anymore");
		}
		

		//log(xFocus.domain()[0])
		if (theFocus != undefined) {
			//theZoom.translate(theRange);
			//theZoom.translate(theZoom.translate()[0]);
			//log(theZoom.scale())
			
			var startD = new Date(theRange[0]).getTime();
			var endD = new Date(theRange[1]).getTime();
							
			//don't go smaller than 1 seconds
			if(endD < (startD + 1000)){
				log("foc: here " );
				
				endD = startD + 1000;
				theRange[1] = new Date(endD);
				
				//context.select('.brush').call(theBrush.extent(theRange));
			}
				
			
			
			xFocus.domain(theRange);
			focus.redrawLines(theData);
			//theFocus.select('.line').attr('d', lineFocus);	//show the focus line	
			theFocus.select('.x.axis').call(xAxisFocus);
		}
		//focus.select("#data1").attr("d", areaFill);
		//focus.select("#data2").attr("d", areaFill);
		//focus.select("#mean1").attr("d", meanline(data1));
		//focus.select("#mean2").attr("d", meanline(data2));
		//focus.select(".x.axis").call(xAxis1);

			//Find extent of zoomed area, what's currently at edges of graphed region
		var brushExtent = [xFocus.invert(0), xFocus.invert(width)];
			//console.log(brush.extent(brushExtent));
		//context.select(".brush").call(brush.extent(brushExtent));
	//subject.notify(theRange, "focus");//notifying all the observers about the change in range
		
		//log("foc:zoomed : " + brushExtent);
	}

	focus.panLimit = function() {
		/*
		var divisor = { h: height / ((y.domain()[1]-y.domain()[0]) * zoom.scale()), 
						w: width / ((x.domain()[1]-x.domain()[0]) * zoom.scale())},
		minX = -(((x.domain()[0]-x.domain()[1])*zoom.scale())+(panExtent.x[1]-(panExtent.x[1]-(width/divisor.w)))),
		minY = -(((y.domain()[0]-y.domain()[1])*zoom.scale())+(panExtent.y[1]-(panExtent.y[1]-(height*(zoom.scale())/divisor.h))))*divisor.h,
		maxX = -(((x.domain()[0]-x.domain()[1]))+(panExtent.x[1]-panExtent.x[0]))*divisor.w*zoom.scale(),
		maxY = (((y.domain()[0]-y.domain()[1])*zoom.scale())+(panExtent.y[1]-panExtent.y[0]))*divisor.h*zoom.scale(), 
		*/
		 tx = xFocus.domain()[0] < panExtent.x[0] ? 
				minX : x.domain()[1] > panExtent.x[1] ? maxX : zoom.translate()[0],
		 ty = y.domain()[0]  < panExtent.y[0]? 
				minY : y.domain()[1] > panExtent.y[1] ? maxY : zoom.translate()[1];
	
		return [tx,ty];
	
	}

	
	//#######################################################
	focus.reload = function(data) {	
	
		theSensorData = [];
		yFocusArr = [];
		yFocusArrIndex = {};
		yAxisFocus = [];
		 
		container.selectAll("*").remove();
		d3.select('#FocusDIV').html("");
		d3.select('#FocusDIV')
						.datum(data)
						.call(focus);
	};

	//#######################################################
	
	focus.update = function (range, caller) {
		
		log("foc: ############## here we go ################");
		
		theRange = range;
		if (theFocus != undefined) {
			xFocus.domain(theRange);			
			theZoom.x(xFocus);
			log("foc: scalec : " + theZoom.scale());
			
			focus.redrawLines(theData);
			
			//theFocus.select('.line').attr('d', lineFocus);	//show the focus line	
			theFocus.select('.x.axis').call(xAxisFocus);
			
		theFocus.selectAll("#xaxis line").attr("y2", 15);
		theFocus.selectAll("#xaxis text").attr("y", 19);
			
		}
	};
	

	
	focus.update = function (range, caller, zoomScale) {
		//log("foc: who called me");
		
		theRange = range;
		//log("foc: update: range = " + theRange + " caller : " + caller);
		if (theFocus != undefined ) {	
			//log("foc: update: scale : " + theZoom.scale() + " ZoomScale = " + zoomScale + " #########");		
			
			//timeRangeText
			var startTime = new Date(theRange[0] - 0).toLocaleString();
			var endTime   = new Date(theRange[1] - 0).toLocaleString();
			$("#timeRangeFromText").text(startTime);
			$("#timeRangeToText").text(endTime);
			
			xFocus.domain(theRange);
			
			if(caller != "timelineHandlesZoomed") {
				//theZoom.scale(scaleVal);
				theZoom.x(xFocus);
			}				
			
			//theZoom.x(xFocus);
			
			//log("foc: update: scale : " + theZoom.scale());
			
			//log("foc: update: x " + theZoom.x());
			
			var dateRangeDiff = new Date(theRange[1]).getTime() - new Date(theRange[0]).getTime();
			var scaleVal = fullTimeRangeDifference / dateRangeDiff;
			
			//log("foc: update: scaleVal : " + scaleVal);
			
			focus.redrawLines(theData);
			
			//theFocus.select('.line').attr('d', lineFocus);	//show the focus line	
			theFocus.select('.x.axis').call(xAxisFocus);
			
			//update the x-axis ticks with longer height
			theFocus.selectAll("#xaxis line").attr("y2", 15);
			theFocus.selectAll("#xaxis text").attr("y", 19);
			
			
			//theZoom.scale(scaleVal);
			if(caller == "timelineHandlesZoomed") {
				//theZoom.scale(scaleVal);
				//theZoom.x(xFocus);
				lastZoomScale = scaleVal;
				if(previousZoomCaller != "timelineHandlesZoomed") {
					theZoom.scale(scaleVal);
				}
			}
			else {
				//theZoom.scale(zoomScale);
				theZoom.scale(scaleVal);
				var temp = theZoom.scale();
				//theZoom.scale(lastZoomScale);
				lastZoomScale = scaleVal;
				
			}
			//log("foc: update: scaleu2: " + theZoom.scale());
			//log("foc: update: range = " + theRange + " caller : " + caller);
			
		}
		/*
		else if(theFocus != undefined) {
			xFocus.domain(theRange);			
			theZoom.x(xFocus);
			log("foc: update: scalec : " + theZoom.scale());
			
			focus.redrawLines(theData);
			
			//theFocus.select('.line').attr('d', lineFocus);	//show the focus line	
			theFocus.select('.x.axis').call(xAxisFocus);
		}
		*/
		previousZoomCaller = caller;
		
		
		
		
	};

	focus.hideData = function(index) {
		log("focus: about to hide data" + index);
		theFocus.selectAll(".data" + index).attr("visibility", "hidden");
	};
	
	focus.showData = function(index) {
		log("focus: about to show data" + index);
		theFocus.selectAll(".data" + index).attr("visibility", "visible");
	};
	
	return focus;
};
