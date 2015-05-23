VRL.TheTimeline = function (docWidth, docHeight, extraSpaces) {
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

	//The total time range
	var startTimeRange = 0;
	var endTimeRange = 0;
	
	//
	var theBrush = d3.svg.brush();
	var theRange = d3.svg.brush();
	
	var xDomain = [];
	var xContext = 1;
	
	var eachDataHeight = 0;
			
	var yContextArr = [];
	var yContextArrIndex = {};
	
	var availableWidth;
		
	//##############################################
	//For Observer Pattern
	
	var subject = new Subject();

	timeline.addObserver = function addObserver(newObserver) {
		subject.observe(newObserver);
	};

	timeline.removeObserver = function removeObserver(deleteObserver) {
		subject.unobserve(deleteObserver);
	};
	
	timeline.handlesUpdated = function fetchRange() {
		// notify our observers of the stock change
		subject.notify(theRange, "timeline");
	};
	//##############################################
			
	var  context;
	var container;
				
	function timeline(selection) {
		selection.each(function (data) {
			log("timeL: timeline");
			//var data = selection;
			
			
			theData = data;
			
			noOfData = theData.length;
			log("timeL: noOfData = " + noOfData);
			//calculateTimeRange(data);
			
			container = d3.select(this);
			var svg = container.append('svg')
				.attr('width', width + margin.left + margin.right)
				.attr('height', height + margin.top + margin.bottom);
			
			availableWidth = width - padding.left - padding.right;
			var availableHeight = height - padding.top - padding.bottom;
			
			
			//### collecting all the sensor data in one place
			for(var i = 0; i < noOfData; i++) {
				if(theData[i].dataType() == 2) {
					theSensorData.push(theData[i]);
					yContextArrIndex["" + i] = (theSensorData.length - 1) ;
				}
			}
			noOfSensorData = theSensorData.length;
			
			xContext = d3.time.scale().range([0, availableWidth]); //for context
			var yContext = d3.scale.linear().range([contextHeight, 0 + contextHeightPadding]); 
			var xAxisContext = d3.svg.axis().scale(xContext).orient('bottom');//.tickFormat(d3.time.format("%X"));
			
			svg.append('defs').append('clipPath')
								.attr('id', 'clip')
								.append('rect')
								.attr('width', availableWidth)
								.attr('height', height - areaSpace);

			var wrap = svg.append('g')
				.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

				
			context = wrap.append('g')
				.attr('class', 'context')
				.attr('transform', 'translate(' + padding.left + ',' + (padding.top) + ')');
			
			//Generate lines for the linecharts
			function lineG(d) {
				//log("timeL: val " +  JSON.stringify(d)  )
				var lineGen = d3.svg.line()
						.x(function(d) {
							return xContext(new Date(d.timestamp - 0));
						})
						.y(function(d) {
							//var val = contextHeight/no * i;
							log("val " +  JSON.stringify(d)  )
							return yContext(0);
						});
		
				return lineGen;
			}
			
			//domain
			data.forEach(function (d) {
				d = d.data();
				//log("d = " + d);
				d.map(function(dd) {
					//log("dd = " + dd.timestamp);
					xDomain.push(new Date(dd.timestamp - 0).getTime());
				});
				
			});
			
			//log("timeL: xDomain size = " + xDomain.length);
			
			//### Calculating the start and the end timeline among the data ###
			var startValue = xDomain[0] - 0;
			var startIndex = 0;
			var endValue   = xDomain[xDomain.length - 1] - 0;
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
			var temp = xDomain[0];
			xDomain[0] = startValue;
			xDomain[startIndex] = temp;
			
			temp = xDomain[xDomain.length - 1];
			xDomain[xDomain.length - 1] = endValue;
			xDomain[endIndex] = temp;
					
			
			//log("timeL: start date :" + xDomain[0]);
			//log("timeL: Stop date  :" + xDomain[xDomain.length - 1]);
			
			if(xDomain[0] + (1000*60*60*24) > xDomain[xDomain.length - 1]) {
				log("timeL: range smaller than a day");
				//put hourly ticks for the x-axis
				xAxisContext.tickFormat(d3.time.format("%X"));
				
			}
			//###
			
		
			//yValues
			var yValues = [];
			data.forEach(function (d) {
				d = d.data();
				//log("d = " + d);
				d.map(function(dd) {
					//log("dd = " + dd.timestamp);
					//xDomain.push(new Date(dd.timestamp - 0));
					yValues.push(dd.value - 0);
				});
				
			});
			//log("yValues : " + yValues);
			
			var yMax = d3.max(yValues);
			//var yMax = d3.max(data.map(function(d) { return d[1]; } )); //for array of data
			
			//log("yMax = " + yMax);

		
			xContext.domain(d3.extent(xDomain));
			yContext.domain([0, contextHeight]);
		
			
		
			//### for drawing the lines based on the data
			var no = noOfData;
			var h = contextHeight - contextHeightPadding - 5;
				h = h/no;
			var hy = h;	//h  for height of the lines
						//hy for 'y' coordinate for each line
			//draw the data as straight lines 
			
			if(h > 20) {
				h = 20;
			}
			
			eachDataHeight = h; //so that it can be used later for highlighting
			
			//### to keep all the figures inside this
			context.append("g")
					.attr("id", "timelineObjectContainer");
			
			
			for(var i = 0; i < noOfData; i++) {
				var start, end
				
				//find the next 'y' for a new line and fix the gap between them
				hy = i * h +  h/2 + i * 2;
				
				start = data[i].data();
				//log(start);
				if(start.length > 0) {
					//### Nominal Data
					start = start[0].timestamp - 0 ;
				
					start = xContext(start);
					//log("data: " + data[i].dataType());
					
					end = data[i].data();
					end = end[end.length - 1].timestamp - 0 ;
					end = xContext(end);
						//log("line end: " + end);
						//log("xContext = " + xContext.domain());
						//log("yContext" + yContext());
					if(data[i].dataType() == 0) {
						//if Nominal data
						
						var d = data[i].data();		
						d.map(function(dd, index) {
							
							context.select("#timelineObjectContainer")
								.append('line')
									.attr("id", "TcircleNominal" + i + "-" + index)
									.attr('class', 'nominal theNominalTick dataElement data' + i )
									.attr("x1", xContext(dd.timestamp))
									.attr("y1", yContext(hy))
									.attr("x2", xContext(dd.timestamp) + 3)
									.attr("y2", yContext(hy))
									.attr('stroke', data[i].style.dataColor()) //based on the index
									.attr('stroke-width', h)
									.attr('fill', 'none');
						});
						
					}
					else if(data[i].dataType() == 1) {
					//### Ordinal Data
						
						var d = data[i].data();		
						d.map(function(dd, index) {
														
							context.select("#timelineObjectContainer")
								.append('line')
									.attr("id", "TcircleOrdinal" + i + "-" + index)
									.attr('class', 'ordinal dataElement data' + i  + " ordinal" + dd.value )
									.attr("x1", xContext(dd.timestamp))
									.attr("y1", yContext(hy))
									.attr("y2", yContext(hy))
									.attr("x2", xContext(dd.timestamp) + 3)
									.attr('stroke', data[i].styles[dd.value]) //based on the index
									.attr('stroke-width', h)
									.attr('fill', 'none');
						});
						
					}
					else if(data[i].dataType() == 2 || data[i].dataType() == 3) {
						//if sensor data
						context.select("#timelineObjectContainer")
							.append('line')
								.attr("id", "Tline" + (yContextArrIndex["" + i] - 0))
								.attr('class', 'dataElement data' + i )
								.attr("x1", start)
								.attr("y1", yContext(hy))
								.attr("x2", end)
								.attr("y2", yContext(hy))
								.attr('stroke', data[i].style.dataColor())
								.attr('stroke-width', h)
								.attr('fill', 'none');
					}
				}
				
			}
			

			context.append('g')
					.attr('class', 'x axis')
					.attr('transform', 'translate(0,' + contextHeight + ')')
					.call(xAxisContext);

					
					
		//-----------------------------------------------------------------
			
			var startDate = new Date(xDomain[0] - 0);
			var lastDate = new Date(xDomain[xDomain.length - 1] - 0);

			theBrush = d3.svg.brush()
									.x(xContext)
									.extent([startDate, lastDate])
									.on('brush', timeline.brushed);

			context.append('g')
					.attr('class', 'x brush')
					.call(theBrush);

			//show the charts
			timeline.brushed();
			//brushed();

			// Don't allow the brushing from background and single click context switch
			context.select(".background")
							.on("mousedown.brush", timeline.nobrush)
							.on("touchstart.brush", timeline.nobrush);

			context.selectAll("rect")
						.attr('y', contextHeightPadding - 2)
						.attr("height", contextHeight - contextHeightPadding + 1);

			//the handles configuration
			context.selectAll(".resize").append("rect")
											.attr("width", '5px')
											.attr("height", contextHeight + 15)
											.classed("border");

			
			
		
			
			
		});

		
		
		return timeline;
	}

	// Expose Public Variables

	timeline.margin = function (_) {
		if (!arguments.length)
			return margin;
		margin.top = typeof _.top !== 'undefined' ? _.top : margin.top;
		margin.right = typeof _.right !== 'undefined' ? _.right : margin.right;
		margin.left = typeof _.left !== 'undefined' ? _.left : margin.left;
		margin.bottom = typeof _.bottom !== 'undefined' ? _.bottom : margin.bottom;
		return timeline;
	};

	timeline.padding = function (_) {
		if (!arguments.length)
			return padding;
		padding.top = typeof _.top !== 'undefined' ? _.top : padding.top;
		padding.right = typeof _.right !== 'undefined' ? _.right : padding.right;
		padding.left = typeof _.left !== 'undefined' ? _.left : padding.left;
		padding.bottom = typeof _.bottom !== 'undefined' ? _.bottom : padding.bottom;
		return timeline;
	};

	timeline.width = function (_) {
		if (!arguments.length)
			return width;
		width = _;
		return timeline;
	};

	timeline.height = function (_) {
		if (!arguments.length)
			return height;
		height = _;
		return timeline;
	};

	timeline.contextHeight = function (_) {
		if (!arguments.length)
			return contextHeight;
		contextHeight = _;
		return timeline;
	};

	timeline.areaSpace = function (_) {
		if (!arguments.length)
			return areaSpace;
		areaSpace = _;
		return timeline;
	};

	//##############################################
	timeline.timelineBarHeight = function (_) {
		if (!arguments.length)
			return timelineBarHeight;
		timelineBarHeight = _;
		return timeline;
	};
//#######################################################
			timeline.brushed = function() {
				//log("extent: " + theBrush.extent());
				//log(new Date(startTimeRange) + " : " + new Date(endTimeRange))
				//xContext.domain(theBrush.empty() ? xContext.domain() : theBrush.extent());	
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
				
				//timeline.changeHandles();
				
				
				subject.notify(theRange, "timeline");//notifying all the observers about the change in range
			};
	
			timeline.changeHandles = function(){
				//xContext.domain(theBrush.empty() ? xContext.domain() : theBrush.extent());	
				//context.select('class', 'x brush').call(theBrush);
				//log(theRange)
				//context.select('class', 'x brush')
				context.select('.brush').call(theBrush.extent(theRange));
				//log(context.select('.brush'));
					//;
			};
			
			timeline.nobrush = function(a, b, c) {
				//to stop the brushing from the chart background
				//log('Brushing from background diabled')
				d3.event.stopPropagation()
			};
			
			function calculateTimeRange(data){
				//log("calculating time range");
				
				var start, end;
				if(data.length >= 1) {
					start = data[0].data();
					start = start[0].timestamp - 0;
					//log("start: " + start);
					
					end = data[0].data();
					end = end[end.length - 1].timestamp - 0;
					
					startTimeRange = start;
					endTimeRange = end;
					//log("end: " + end);
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
				
					//log("timeline:   Start: " + new Date(startTimeRange) + " and End : " + new Date(endTimeRange) );
				}
			}
			
			//#######################################################
	timeline.reload = function(data) {
		
		xDomain = [];
		
		container.selectAll("*").remove();
		d3.select('#TimeLineDIV').html("");
		d3.select('#TimeLineDIV')
						.datum(data)
						.call(timeline);
	};

	//### the handle was updated
	timeline.update = function (range, caller, dataObject) {
		//log("theBrush : " + theBrush.extent());
		//log("before " + theBrush.extent());
		
		//### when the item was highlighted in Focus chart
		if(caller == "itemHighlighted") {
			var str = dataObject.substring(0, 4);
			//log(dataObject)
			if(str == "circ") {
				context.select("#T" + dataObject)
									.attr("fill-opacity", 1)
									.attr('stroke-width', function() {	
										this.parentNode.appendChild(this);									
										return eachDataHeight + 10;									
									});
			}
			else if(str == "line") {
				var lineStr = dataObject.substring(0,5);
				context.select("#T" + lineStr )
								.attr("fill-opacity", 0.5)
								.attr('stroke-width', function(){
									this.parentNode.appendChild(this);
									return eachDataHeight + 6;
								});
			}
		}		
		else if(caller == "itemHighlightedOut") {
			var str = dataObject.substring(0, 4);
			
			if(str == "circ") {
				context.select("#T" + dataObject)
								.attr("fill-opacity", 1)
								.attr('stroke-width', eachDataHeight);
			}
			else if(str == "line") {
				var lineStr = dataObject.substring(0,5);
				context.select("#T" + lineStr )
								.attr("fill-opacity", 1)
								.attr('stroke-width', eachDataHeight);
			}
		}
		else {
			theRange = range;
			theBrush.extent(range);
			//log("t: range = " + range);
			
			//log("after  " + theBrush.extent());
			if(theBrush.extent() != null) {
				timeline.changeHandles();
			}
		}
	}

	timeline.hideData = function(index) {
		log("timeline: about to hide data" + index);
		context.selectAll(".data" + index).attr("visibility", "hidden");
	};
	
	timeline.showData = function(index) {
		log("timeline: about to show data" + index);
		context.selectAll(".data" + index).attr("visibility", "visible");
	};
	
	timeline.changeColor = function(dataToChangeIndex, color) {
		//log("data " + dataToChangeIndex + " color " + color);
		
		//log(theData[dataToChangeIndex].dataType())
		
		if(theData[dataToChangeIndex].dataType() == 0) {
			//### Nominal Notes
			
			context.selectAll(".theNominalTick")
							.attr("stroke", color)
							.attr("fill", color);
		}
		else if(theData[dataToChangeIndex].dataType() == 1) {
			//### Ordinal Values
			var dataInfo = theData[dataToChangeIndex].dataInfo();
			var noOfKeys = Object.keys(dataInfo).length;
			
			var plus = 0, 
				minus = 0;
			var gradientColors = [];
			var moreLuminance = [];
			var lessLuminance = [];
			
			var inc;
			if(noOfKeys % 2 == 0) {
				if(noOfKeys > 1) {
					inc = 100 / noOfKeys;
				}
				else {
					inc = 50;
				}
			}
			else {
				if(noOfKeys > 1) {
					inc =  100 / (noOfKeys - 1);
				}
				else {
					inc = 50;
				}
			}
			
			for(var i = 0; i < noOfKeys - 1; i++) {
				if(i % 2 == 0) {
					plus += inc;
					moreLuminance.push(ColorLuminance(color, (plus/100)));
				}
				else {
					minus -= inc;
					lessLuminance.push(ColorLuminance(color, (minus/100)));
				}				
			}
			
			for(var j = moreLuminance.length - 1; j >= 0; j-- ) {
				gradientColors.push(moreLuminance[j]);
			}
			gradientColors.push(color);
			for(var j = 0; j < lessLuminance.length; j++ ) {
				gradientColors.push(lessLuminance[j]);
			}
			
			for(var j = 0; j < gradientColors.length; j++ ) {
				context.selectAll(".ordinal" + j)
						.attr("stroke", gradientColors[j])
						.attr("fill", gradientColors[j]);
			}
			
		}
		else if(theData[dataToChangeIndex].dataType() == 2) {
			//### Sensor data			
			context.select("#Tline" + (yContextArrIndex["" + dataToChangeIndex] - 0))
							.attr("stroke", color);
		}
		else if(theData[dataToChangeIndex].dataType() == 3) {
			//### GPS data			
			context.select("#Tline" + (yContextArrIndex["" + dataToChangeIndex] - 0))
							.attr("stroke", color);
		}
				
	};
	
	return timeline;
};
