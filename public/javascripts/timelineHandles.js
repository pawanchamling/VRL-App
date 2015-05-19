VRL.TheTimelineHandles = function (docWidth, docHeight, extraSpaces) {
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
		bottom : 10,
		left : 0,
		right : 5
	};

	var width = docWidth - margin.left - margin.right - extraSpaces;
	var height = 70;

	var contextHeight = height - 20;
	var contextHeightPadding = 5;
	var areaSpace = 40;

	var theData;
	var theSensorData = [];	
	
	var noOfData = 0;
	var noOfSensorData = 0;
	var timelineBarHeight = 20; //timelineHeight / noOfData;

		
	var yContextArr = [];
	var yContextArrIndex = {};
	var yAxisContext = [];
	
	
	var isNoiseDataAvailable = false;
	
	//The total time range
	var startTimeRange = 0;
	var endTimeRange = 0;
	
	var theStartValue = 0;
	var theEndValue = 0;
	
	//
	var container;	
	var context;	
	var theRange = d3.svg.brush();
	var theBrush = d3.svg.brush();

		
	//##############################################
	//For Observer Pattern
	
	var subject = new Subject();

	timelineHandles.addObserver = function addObserver(newObserver) {
		subject.observe(newObserver);
	};

	timelineHandles.removeObserver = function removeObserver(deleteObserver) {
		subject.unobserve(deleteObserver);
	};
	
	timelineHandles.handlesUpdated = function fetchRange() {
		// notify our observers 
		subject.notify(theRange, "timelineHandles");
	};
	//##############################################
	
	
	function timelineHandles(selection) {
		selection.each(function (data) {
			log("timelineHandles:");
			//var data = selection;
			
			theData = data;
			noOfData = theData.length;
						
			
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
					yContextArrIndex["" + i] = (theSensorData.length - 1) ;
				
					//log("###" + yContextArrIndex["" + i])
				}
			}			
			noOfSensorData = theSensorData.length;
			//log("noOfSensorData = " +noOfSensorData)
			
			
			var availableWidth = width - padding.left - padding.right;
			var availableHeight = height - padding.top - padding.bottom;

			container = d3.select(this);
			var svg = container.append('svg')
				.attr('width', width + margin.left + margin.right)
				.attr('height', height + margin.top + margin.bottom);
			
			var xContext = d3.time.scale().range([0, availableWidth]); //for context
			var yContext = d3.scale.linear().range([contextHeight, 0 + contextHeightPadding]);
			var xAxisContext = d3.svg.axis().scale(xContext).orient('bottom');//.tickFormat(d3.time.format("%X"));

			for(var i = 0; i < noOfSensorData; i++ ) {				
				yContextArr.push(d3.scale.linear().range([availableHeight, 0]));
			}
			//var xDomain = data.map(function(d) { return d[0]; });//if array
			
		
			
			
			//if object
			var xDomain = [];
			data.forEach(function (d) {
				d = d.data();
				//log("timelineHandles: d = " + d);
				d.map(function(dd) {
					//log("timelineHandles: dd = " + dd.timestamp);
					xDomain.push(new Date(dd.timestamp - 0).getTime());
				});
				
			});
			//log("timelineHandles: xDomain = " + xDomain);
			/**/
			
			//### Calculating the start and the end timeline among the data ###
			var startValue = xDomain[0] - 0;
			var startIndex = 0;
			var endValue = xDomain[1] - 0;
			var endIndex = xDomain.length - 1;
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
			
			//log("timelineHandles: start date :" + xDomain[0]);
			//log("timelineHandles: Stop date :" + xDomain[xDomain.length - 1]);
			
			var temp = xDomain[0];
			xDomain[0] = startValue;
			xDomain[startIndex] = temp;
			
			temp = xDomain[xDomain.length - 1];
			xDomain[xDomain.length - 1] = endValue;
			xDomain[endIndex] = temp;
					
			var startDate = new Date(startValue - 0);
			var lastDate = new Date(endValue - 0);
			
			theStartValue = startValue;
			theEndValue = endValue;
			
			if(xDomain[0] + (1000*60*60*24) > xDomain[xDomain.length - 1]) {
				log("timelineHandles:  range smaller than a day");
				//put hourly ticks for the x-axis
				xAxisContext.tickFormat(d3.time.format("%X"));
			}				
			//log("timelineHandles: Start : " + startValue + " -- End : " + endValue );
			
			//log("timelineHandles: start date :" + startDate);
			//log("timelineHandles: start date :" + xDomain[0]);
			//log("timelineHandles: Stop date :" + lastDate);
			//log("timelineHandles: Stop date :" + xDomain[xDomain.length - 1]);
			//###-----------------------------------------------------------------
			
			
	
			//for context
			/*
			var lines = [];
			for(var i = 0; i < noOfData; i++) {
				lines[i] = d3.svg.line()
					.interpolate('monotone')
					.x(function (d) {
						return xContext(new Date(d.timestamp - 0));
					})
					.y(function (d) {
						return yContext(d.value - 0);
					});
			}
			*/
			var lineGen = d3.svg.line()
									.x(function(d) {
										return xContext(new Date(d.timestamp - 0));
									})
									.y(function(d) {
										return yContext(d.value - 0);
									})
									.interpolate("monotone");
			/*
			var lineContext = d3.svg.line()
				.interpolate('monotone')
				.x(function (d) {
					return xContext(new Date(d.timestamp - 0));
				})
				.y(function (d) {
					return yContext(d.value - 0);
				});
			*/

			svg.append('defs').append('clipPath')
								.attr('id', 'clip')
								.append('rect')
								.attr('width', availableWidth)
								.attr('height', availableHeight + margin.bottom + padding.bottom );

			var wrap = svg.append('g')
				.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

			/*
			var contexts = [];
			for(i = 0; i < noOfData; i++) {
				contexts[i] = wrap.append('g')
					.attr('class', 'context')
					.attr('transform', 'translate(' + padding.left + ',' + (padding.top) + ')');
			}
			*/
			context = wrap.append('g')
				.attr('class', 'context')
				.attr('transform', 'translate(' + padding.left + ',' + (padding.top) + ')');
			
			
			var yValues = [];
			data.forEach(function (d) {
				d = d.data();
				//log("timelineHandles: d = " + d);
				d.map(function(dd) {
					//log("timelineHandles: dd = " + dd.timestamp);
					//xDomain.push(new Date(dd.timestamp - 0));
					yValues.push(dd.value - 0);
				});
				
			});
			//log("timelineHandles: yValues : " + yValues);
			
			var yMax = d3.max(yValues);
			
			
			var yValArr = [noOfSensorData];
			theSensorData.forEach(function (d, index) {
				d = d.data();
				yValArr[index] = [];
				//log(index)
				d.map(function (dd) {
					yValArr[index].push(dd.value - 0);
				});

			});
			
			var yMaxArr = [];
			var yMinArr = [];
			for(var i = 0; i < noOfSensorData; i++){
				yMaxArr.push(d3.max(yValArr[i]));
				yMinArr.push(d3.min(yValArr[i]));
			}
			
			
			//var yMax = d3.max(data.map(function(d) { return d[1]; } )); //for array of data
			
			//log("timelineHandles: yMax = " + yMax);

			xContext.domain(d3.extent(xDomain));
			yContext.domain([0, yMax + 2]);		
			for(var i = 0; i < noOfSensorData; i++) {
				var extraHeight = 0.15 * (yMaxArr[i] - yMinArr[i]);
				yContextArr[i].domain([0, yMaxArr[i] + extraHeight]);
				//extra height added so that the max value is can be seen properly in the y-axis
			}

			
			//#####################################################################################
			//### Drawing each of the data (except GPS data)
			for(var i = 0; i < noOfData; i++) {
				//log("timelineHandles: l "  + data[i].data());
				//log("timelineHandles: dataColor = " + data[i].style.dataColor());
				
				if(data[i].dataType() == 0) {
					//if Nominal data
					
					var d = data[i].data();		
					d.map(function(dd, index) {
						
						context.append('circle')
								.attr("id", "THcircleNominal" + i + "-" + index)
								.attr('class', 'circle dataElement data' + i )
								.attr("cx", xContext(dd.timestamp))
								.attr("cy", function() {
									if(isNoiseDataAvailable) {
										return yContext(0);
									}
									else {
										return 25;
									}
								})
								.attr("r", 5)
								.attr('stroke', data[i].style.dataColor()) //based on the index
								.attr('stroke-width', 1)
								.attr('fill', data[i].styles[dd.value]);
					});
					
				}				
				else if(data[i].dataType() == 1){
					//ordinal data
					
					var d = data[i].data();
					//d = d.values;					
					d.map(function(dd, index) {
						
						context.append('circle')
								.attr("id", "THcircleOrdinal" + i + "-" + index)
								.attr('class', 'circle dataElement data' + i )
								.attr("cx", xContext(dd.timestamp))
								.attr("cy", function() {
									if(isNoiseDataAvailable) {
										return yContext(0);
									}
									else {
										return 25;
									}
								})
								.attr("r", 5)
								.attr('stroke', data[i].styles[dd.value]) //based on the index
								.attr('stroke-width', 1)
								.attr('fill', data[i].styles[dd.value]);
					});
										
				}
				else if(data[i].dataType() == 2) {
					//### Sensor data
					var maxVal = data[i].dataInfo().max;
					var minVal = data[i].dataInfo().min;
				
					context.append("g")
							.attr("id", "THline" + (yContextArrIndex["" + i] - 0) + "cover")
							.attr('class', 'lineCovers dataElement data' + i )
						.append('path')
							.attr('id', "line" + (yContextArrIndex["" + i] - 0))
							.attr('class', 'dataElement data' + i )
							.attr('d', genLine(data[i].data(), (yContextArrIndex["" + i] - 0)))
							.attr('stroke', function() {
								return data[i].style.dataColor();
							})
							.attr('stroke-width', data[i].style.lineSize())
							.attr('fill', 'none');
							
									
					context.select("#THline" + (yContextArrIndex["" + i] - 0) + "cover")
							.selectAll(".dot")
							.data(function () {
								return data[i].data();
							})
						.enter()
						.append("circle")
							.attr("id", function(dd) { 
								return "THcirclePoint" + i + "" + (dd.timestamp - 0);
							})
							.attr('class', 'theCircle')
							.attr("stroke", function (dd) {
								return data[i].style.dataColor(); //return color("#00ff00")//this.parentNode.__data__.name)
							})
							.attr("cx", function (dd) {
								return xContext(new Date(dd.timestamp - 0));
							})
							.attr("cy", function (dd) {
								return yContextArr[(yContextArrIndex["" + i] - 0)](dd.value - 0);//yFocus(dd.value - 0);
							})
							.attr("r", function(dd) {
								
								if(dd.value == maxVal || dd.value == minVal) {
									log("min or max " + dd.value)
									return data[i].style.lineContextNodeRadius() - 0 ;
								}
								else {
									return 0;
								}
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
							.attr("stroke-width", data[i].style.lineSize());
							
				}
				
			}
			//### generate the line
			function genLine(dd, index) {
		
				//log("d = " + JSON.stringify(dd))
				//log("index = " + index)
				var theLine = d3.svg.line()
									.x(function (d) {
										//log("index = " + index)
										return xContext(new Date(d.timestamp - 0));
									})
									.y(function (d) {
										//log("index = " + yContextArr[index])
										return yContextArr[index](d.value - 0);
									})
									.interpolate("monotone");
						
				return theLine(dd)
			}
			
			
			context.append('g')
					.attr('class', 'x axis')
					.attr('transform', 'translate(0,' + contextHeight + ')')
					.call(xAxisContext);

			var startDate = new Date(xDomain[0] - 0);
			var lastDate = new Date(xDomain[xDomain.length - 1] - 0);
			//log("timelineHandles: th start date :" + startDate);
			//log("timelineHandles: th Stop date :" + lastDate);

			theBrush = d3.svg.brush()
									.x(xContext)
									.extent([startDate, lastDate])
									.on('brush', timelineHandles.brushed);

			context.append('g')
					.attr('class', 'x brush')
					.call(theBrush);

			//show the charts
			//timelineHandles.brushed();
			//timelineHandles.brushed();

			// Don't allow the brushing from background and single click context switch
			context.select(".background")
							.on("mousedown.brush", nobrush)
							.on("touchstart.brush", nobrush);

			context.selectAll("rect")
						.attr('y', contextHeightPadding - 2)
						.attr("height", contextHeight - contextHeightPadding + 1);

			//the handles configuration
			context.selectAll(".resize").append("rect")
											.attr("width", '5px')
											.attr("height", contextHeight  + 15)
											.classed("border");


			//#######################################################
			
			function nobrush(a, b, c) {
				//to stop the brushing from the chart background
				//log('Brushing from background diabled')
				d3.event.stopPropagation()
			}
			
			function calculateTimeRange(data){
				//log("timelineHandles: calculating time range");
				var start, end;
				if(data.length >= 1) {
					start = data[0].data();
					start = start[0].timestamp - 0;
					//log("timelineHandles: start: " + start);
					
					end = data[0].data();
					end = end[end.length - 1].timestamp - 0;
					
					
					startTimeRange = start;
					endTimeRange = end;
					//log("timelineHandles: end: " + end);
				}
				if(data.length > 1) {						
					for(var i = 1; i < data.length; i++) {
						var s = data[i].data();
						s = s[0].timestamp - 0;
						
						var e = data[i].data();
						e = e[e.length - 1].timestamp - 0;
						
						
						if(s < start) {
							startTimeRange = s;
						}
						if(e > end) {
							endTimeRange = e;
						}
					}
				
					//log("timelineHandles:  timelinehandler: Start timestamp: " + start + " and End timestamp: " + end );
				}
			}
			
			//#######################################################
			
		});

		return timelineHandles;
	}

	// Expose Public Variables

	timelineHandles.margin = function (_) {
		if (!arguments.length)
			return margin;
		margin.top = typeof _.top !== 'undefined' ? _.top : margin.top;
		margin.right = typeof _.right !== 'undefined' ? _.right : margin.right;
		margin.left = typeof _.left !== 'undefined' ? _.left : margin.left;
		margin.bottom = typeof _.bottom !== 'undefined' ? _.bottom : margin.bottom;
		return timelineHandles;
	};

	timelineHandles.padding = function (_) {
		if (!arguments.length)
			return padding;
		padding.top = typeof _.top !== 'undefined' ? _.top : padding.top;
		padding.right = typeof _.right !== 'undefined' ? _.right : padding.right;
		padding.left = typeof _.left !== 'undefined' ? _.left : padding.left;
		padding.bottom = typeof _.bottom !== 'undefined' ? _.bottom : padding.bottom;
		return timelineHandles;
	};

	timelineHandles.width = function (_) {
		if (!arguments.length)
			return width;
		width = _;
		return timelineHandles;
	};

	timelineHandles.height = function (_) {
		if (!arguments.length)
			return height;
		height = _;
		return timelineHandles;
	};

	timelineHandles.contextHeight = function (_) {
		if (!arguments.length)
			return contextHeight;
		contextHeight = _;
		return timelineHandles;
	};

	timelineHandles.areaSpace = function (_) {
		if (!arguments.length)
			return areaSpace;
		areaSpace = _;
		return timelineHandles;
	};

	//##############################################
	timelineHandles.timelineBarHeight = function (_) {
		if (!arguments.length)
			return timelineBarHeight;
		timelineBarHeight = _;
		return timelineHandles;
	};

	timelineHandles.brushed = function() {
		//log("timelineHandles:  $$$$$$$$$$$$$$$$$$$$$$$$ brushed $$$$$$$$$$$$$$$$$$$$$$$$")
		//log("timelineHandles:  extent: " + theBrush.extent());
		theRange = theBrush.extent();
		
		var startD = new Date(theRange[0]).getTime();
		var endD = new Date(theRange[1]).getTime();
						
		//don't go smaller than 1 seconds
		if(endD < (startD + 1000)){
			
			endD = startD + 1000;
			theRange[1] = new Date(endD);
			
			context.select('.brush').call(theBrush.extent(theRange));
		}				
		
		for(var i = 0; i < noOfData; i++) {
			//context.select('.line').attr('d', lineGen(data[0].data())); //lineContext //show the context line
		}
		subject.notify(theRange, "timelineHandles");//notifying all the observers about the change in range
	};
	
	//#######################################################
	timelineHandles.reload = function(data) {
		
		theSensorData = [];		
		yContextArr = [];
		yContextArrIndex = {};
		yAxisContext = [];
	
		container.selectAll("*").remove();
		d3.select('#TimeLineHandlerDIV').html("");
		d3.select('#TimeLineHandlerDIV')
						.datum(data)
						.call(timelineHandles);
	};

	//#######################################################
	
	timelineHandles.update = function (range, caller) {
		//log("timelineHandles: $$$$$$$$$$$$")
		
		
		
		
	};
	
	timelineHandles.update = function (range, caller, zoomScale, index) {
		
		if(caller == "itemHighlighted") {
			var str = zoomScale.substring(0, 4);
			log("timeline: str = " + str )
			
			//context.select("TH" + zoomScale).parentNode.appendChild(context.select("TH" + zoomScale));
			//$("#TH" + zoomScale).parentNode.appendChild($("#TH" + zoomScale));
			log("#TH" + zoomScale)
			
			if(str == "circ") {
				context.select("#TH" + zoomScale)
									.attr('r', function() {
										//### bringing it to the front
										this.parentNode.appendChild(this);
										
										return 7;									
									});
			}
			else if(str == "line") {
				var lineStr = zoomScale.substring(0,5);
				context.select("#" + lineStr )
								.attr('stroke-width', function(){
									//### bringing it to the front
									this.parentNode.parentNode.appendChild(this.parentNode);
									
									return 4;
								});
			}
			
			//context.select("#TH" + zoomScale).parentNode.appendChild(context.select("#TH" + zoomScale));					
		}
		else if(caller == "itemHighlightedOut") {
			var str = zoomScale.substring(0, 4);
			
			if(str == "circ") {
				context.select("#TH" + zoomScale)
								.attr('r', 5);
			}
			else if(str == "line") {
				var lineStr = zoomScale.substring(0,5);
				context.select("#" + lineStr )
								.attr('stroke-width', 2);
			}
			
			
		}
		
		theRange = range;
		context.select('.brush').call(theBrush.extent(theRange));
		
		
		//log("timelineHandles:  caller = " + caller);
		//log("timelineHandles:  theBrush : " + theBrush.extent());
		//log("timelineHandles:  before " + theBrush.extent());
		theRange = range;
		//theBrush.extent(range);
		//log("timelineHandles:  range = " + theRange + " ### Caller : " + caller + "###");
		
		//log("timelineHandles:  after  " + theBrush.extent());
		if(theBrush.extent() != null) {
			//timeline.changeHandles();
			if(caller == "focusZoomed") {
				//log("timelineHandles:  called by focus")
				
				
				
				if(zoomScale == 1) {
					theRange[0] = new Date(theStartValue - 0);
					theRange[1] = new Date(theEndValue - 0);
				}
				else {
				
					var rangeStart  = new Date(theRange[0] - 0).getTime();
					var rangeEnd	= new Date(theRange[1] - 0).getTime();
					//don't let the range go below or above the initial range
					//log("timelineHandles:  theStartValue = " + theStartValue + " : " + new Date(theRange[0] - 0).getTime() + " diff: " + (theStartValue - new Date(theRange[0] - 0).getTime()));
					//log("timelineHandles:  theEndValue   = " + theEndValue + " : " + new Date(theRange[1] - 0).getTime() + " diff: " + (new Date(theRange[1] - 0).getTime() - theEndValue));
					
					//if less than 1 second
					if((rangeEnd - rangeStart) < 1000) {
						if(theEndValue > (theEndValue + 1000)) {
							theRange[1] = new Date(rangeStart + 1000);
						}
						else {
							theRange[0] = new Date(rangeEnd - 1000);
						}
					}
					
					if(rangeStart < theStartValue) {
						
						var diff = (theStartValue - rangeStart);
						theRange[0] = new Date(theStartValue - 0);
						
						theRange[1] = new Date(rangeEnd + diff);				
						if(rangeEnd > theEndValue){
							theRange[1] = new Date(theEndValue - 0);
						}
						//log("timelineHandles:  < too small: fixed : theRange[1] : " + theRange[1] + " < diff : " + diff);
					}
					
					if(rangeEnd > theEndValue) {
						
						var diff = (rangeEnd - theEndValue);
						
						theRange[1] = new Date(theEndValue - 0);
						
						theRange[0] = new Date(rangeStart - diff);	
						if(rangeStart < theStartValue){
							theRange[0] = new Date(theStartValue - 0);
						}
						//log("timelineHandles:  > too big: fixed");
					}
					
					
				
				}
				//theBrush.extent(theRange);
				context.select('.brush').call(theBrush.extent(theRange));
				//timelineHandles.brushed();
				subject.notify(theRange, "timelineHandlesZoomed", zoomScale)
			}
			else {
			
				context.select('.brush').call(theBrush.extent(theRange));
			}
		}
		
		
		
	};
	
	

	timelineHandles.hideData = function(index) {
		log("timelineHandles: about to hide data" + index);
		context.selectAll(".data" + index).attr("visibility", "hidden");
	};
	
	timelineHandles.showData = function(index) {
		log("timelineHandles: about to show data" + index);
		context.selectAll(".data" + index).attr("visibility", "visible");
	};
	
	
	
	return timelineHandles;
};
