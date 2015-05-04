TheFocus = function () {
	"use strict";
	// default settings
	var margin = {
		top : 10,
		bottom : 10,
		left : 10,
		right : 10
	};

	var padding = {
		top : 10,
		bottom : 10,
		left : 40,
		right : 40
	};

	var width = 1260;
	var height = 240;

	var focusHeight = 200;
	var focusHeightPadding = 5;
	var areaSpace = 40;

	var noOfData = 1;

	//The total time range
	var startTimeRange = 0;
	var endTimeRange = 0;

	var panExtent = [0, 0];
	//

	var theData;
	var theFocus;
	var theRange = d3.svg.brush();
	var theBrush = d3.svg.brush();
	var xFocus = d3.time.scale();
	var yFocus = d3.scale.linear();
	var xAxisFocus = d3.svg.axis();
	var lineGen = d3.svg.line();
	var theZoom = d3.behavior.zoom();
	var drag = d3.behavior.drag();
	
	var fullTimeRangeDifference = 0;
	var initialStartDateTime = 0;
	
	
	
	var lastZoomScale = 1;
	
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
			//var data = selection;
			theData = data;
			noOfData = data.length;
			
			calculateTimeRange(data);
			
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
					
			var startDate = new Date(startValue - 0);
			var lastDate = new Date(endValue - 0);
			//log("foc:start date :" + startDate);
			//log("foc:Stop date :" + lastDate);
			//###-----------------------------------------------------------------
			
			
			
			startTimeRange = xDomain[0];
			endTimeRange = xDomain[xDomain.length - 1];
			
			initialStartDateTime = startTimeRange;
			fullTimeRangeDifference = (new Date(endTimeRange).getTime()) - (new Date(startTimeRange).getTime())
			log("foc:fullTimeRangeDifference : " + fullTimeRangeDifference)
			
			panExtent = [startTimeRange, endTimeRange];
			
			var yValues = [];
			data.forEach(function (d) {
				d = d.data();
				d.map(function (dd) {
					yValues.push(dd.value - 0);
				});

			});

			var yMax = d3.max(yValues);
			
			var availableWidth = width - padding.left - padding.right;
			var availableHeight = height - padding.top - padding.bottom;

			var container = d3.select(this);
			var svg = container.append('svg')
				.attr('width', width + margin.left + margin.right)
				.attr('height', height + margin.top + margin.bottom);

				
			xFocus = d3.time.scale().range([0, availableWidth]); //.nice(d3.time.day) //for theFocus			
			yFocus = d3.scale.linear().range([availableHeight, 0]);

			
			//var formatTime = d3.time.format("%H:%M");
			//var formatMinutes = function(d) { return formatTime(new Date(2015, 0, 1, 0, d)); };
			xAxisFocus 			= d3.svg.axis().scale(xFocus).orient('bottom').tickFormat(d3.time.format("%X"));
            var yAxisFocusLeft 	= d3.svg.axis().scale(yFocus).orient('left');
            var yAxisFocusRight = d3.svg.axis().scale(yFocus).orient('right');

			xFocus.domain(d3.extent(xDomain));			
			yFocus.domain([0, yMax + 2]);	
			
						
			svg.append('defs').append('clipPath')
				.attr('id', 'clip')
				.append('rect')
				.attr('width', availableWidth)
				.attr('height', availableHeight + 10); //just adding some more height so that the lines are shown smooth - not cut out

			var wrap = svg.append('g')
				.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

			
			theFocus = wrap.append('g')
				.attr('class', 'theFocus')
				.attr('transform', 'translate(' + padding.left + ',' + (padding.top) + ')');

			//line generator			
			lineGen = d3.svg.line()
				.x(function (d) {
					return xFocus(new Date(d.timestamp - 0));
				})
				.y(function (d) {
					return yFocus(d.value - 0);
				})
				.interpolate("monotone");
			
			//circle generator
			/*
			circleGen = d3.svg.circle()
					.cx(function (d){
						return xFocus(new Date(d.timestamp - 0));
					})
					.cy(function (d) {
						return yFocus(2);
					})
			*/	
			
			
			focus.drawLines(data);

			theFocus.append('g')
                .attr('class', 'y axis')
                .call(yAxisFocusLeft);

            theFocus.append('g')
                .attr('class', 'y axis')
                .attr('transform', 'translate(' + availableWidth + ',0)')
                .call(yAxisFocusRight);
			
			theFocus.append('g')
					.attr('class', 'x axis')
					.attr('transform', 'translate(0,' + availableHeight + ')')
					.call(xAxisFocus);

			
			
			theFocus.append('g')
					.attr('class', 'x brush')
					.call(theBrush);

			//.x(x1).scaleExtent([1,10]) //limits zoom from 1X to 10X
			theZoom = d3.behavior.zoom()
									.x(xFocus)
									.scaleExtent([1, 111])
									.on("zoom", focus.zoomed); //.x(x1).scaleExtent([1,10])		
			
			/*
			drag = d3.behavior.drag()
								.origin(function(d) { return d; })
								.on("dragstart", dragstarted)
								.on("drag", dragged)
								.on("dragend", dragended);		
			
			*/
			
//Used for zoom function
			theFocus.append("rect")
						.attr("class", "pane")
						.attr("width", availableWidth)
						.attr("height", availableHeight)
						.call(theZoom);
						
			// Don't allow the brushing from background and single click theFocus switch
			theFocus.select(".background")
			.on("mousedown.brush", nobrush)
			.on("touchstart.brush", nobrush);

			
			//#######################################################
			function brushed() {
				//log("foc:extent: " + theBrush.extent());
				theRange = theBrush.extent();
				for (var i = 0; i < noOfData; i++) {
					//theFocus.select('.line').attr('d', lineGen(data[0].data())); //lineContext //show the theFocus line
				}
				
				theZoom.x(xFocus);
				
				subject.notify(theRange, "focus"); //notifying all the observers about the change in range
			}

			function nobrush(a, b, c) {
				//to stop the brushing from the chart background
				//log('Brushing from background diabled')
				d3.event.stopPropagation()
			}

			function calculateTimeRange(data) {
				//log("foc:calculating time range");
				var start,
				end;
				if (data.length >= 1) {
					start = data[0].data();
					start = start[0].timestamp + 0;
					//log("foc:start: " + start);

					end = data[0].data();
					end = end[end.length - 1].timestamp + 0;
					//log("foc:end: " + end);
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

	focus.focusHeight = function (_) {
		if (!arguments.length)
			return focusHeight;
		focusHeight = _;
		return focus;
	};

	focus.areaSpace = function (_) {
		if (!arguments.length)
			return areaSpace;
		areaSpace = _;
		return focus;
	};

	//##############################################
	
	focus.drawLines = function(data) {
		for (var i = 0; i < noOfData; i++) {
			
			if(data[i].dataType() == 0){
				//Nominal values
				var d = data[i].data();
				//d = d.values;					
				d.map(function(dd, index) {
					var startPos = xFocus(dd.timestamp);
					
					theFocus.append('circle')
							.attr("id", "circleNominal" + i + "-" + index)
							.attr('class', 'theCircle')
							.attr("cx", xFocus(dd.timestamp))
							.attr("cy", yFocus(2))
							.attr("r", 10)
							.attr('stroke', data[i].style.dataColor()) //based on the index
							.attr('stroke-width', 1)
							.attr('fill', data[i].styles[dd.value]);
							
					//log(circleGen(data[i].data()));		
				});
									
			}
			else if(data[i].dataType() == 2) {
				theFocus.append('path')
					.attr("id", "line" + i)
					.attr('class', 'theLine')
					.attr('d', lineGen(data[i].data()))
					.attr('stroke', data[i].style.dataColor())
					.attr('stroke-width', data[i].style.lineSize())
					.attr('fill', 'none');
					
					//log(lineGen(data[i].data()));
			}				
			else if(data[i].dataType() == 1){
				var d = data[i].data();
				//d = d.values;					
				d.map(function(dd, index) {
					var startPos = xFocus(dd.timestamp);
					
					theFocus.append('circle')
							.attr("id", "circle" + i + "-" + index)
							.attr('class', 'theCircle')
							.attr("cx", xFocus(dd.timestamp))
							.attr("cy", yFocus(2))
							.attr("r", 10)
							.attr('stroke', data[i].styles[dd.value]) //based on the index
							.attr('stroke-width', 1)
							.attr('fill', data[i].styles[dd.value]);
							
					//log(circleGen(data[i].data()));		
				});
									
			}
			
			
		}
	};

	focus.redrawLines = function(data) {
		for (var i = 0; i < noOfData; i++) {
			if(data[i].dataType() == 0) {
				//Nominal data
				var d = data[i].data();
				d.map(function(dd, index) {
					//log("foc:here we go")
					theFocus.select("#" + "circleNominal" + i + "-" + index)
							.attr('class', 'theCircle')
							//.attr('d', circleGen(data[i].data()));						
							.attr("cx", xFocus(dd.timestamp))
							.attr("cy", yFocus(2))
							.attr("r", 10)
							.attr('stroke', data[i].style.dataColor()) //based on the index
							.attr('stroke-width', 1)
							.attr('fill', data[i].styles[dd.value]);
				});
			}
			else if(data[i].dataType() == 1) {
				//Ordinal data
				var d = data[i].data();
				d.map(function(dd, index) {
					//log("foc:here we go")
					theFocus.select("#" + "circle" + i + "-" + index)
							.attr('class', 'theCircle')
							//.attr('d', circleGen(data[i].data()));						
							.attr("cx", xFocus(dd.timestamp))
							.attr("cy", yFocus(2))
							.attr("r", 10)
							.attr('stroke', data[i].styles[dd.value]) //based on the index
							.attr('stroke-width', 1)
							.attr('fill', data[i].styles[dd.value]);
				});
			}
			else if(data[i].dataType() == 2){
				//Sensor data
				theFocus.select('#' + 'line' + i).attr('d', lineGen(data[i].data()));
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
				log("foc:here " );
				
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
	
	focus.update = function (range, caller) {
		
		log("foc:############## here we go ################");
		
		theRange = range;
		if (theFocus != undefined) {
			xFocus.domain(theRange);			
			theZoom.x(xFocus);
			log("foc:scalec : " + theZoom.scale());
			
			focus.redrawLines(theData);
			
			//theFocus.select('.line').attr('d', lineFocus);	//show the focus line	
			theFocus.select('.x.axis').call(xAxisFocus);
			
		}
	};
	
	focus.update = function (range, caller, zoomScale) {
		//log("foc: who called me");
		
		theRange = range;
		log("foc: update: range = " + theRange + " caller : " + caller);
		if (theFocus != undefined ) {	
			log("foc: update: scale : " + theZoom.scale() + " ZoomScale = " + zoomScale + " #########");		
			xFocus.domain(theRange);
			if(caller != "timelineHandlesZoomed") {
				//theZoom.scale(scaleVal);
				//theZoom.x(xFocus);
			}				
			//theZoom.x(xFocus);
			log("foc: update: scale : " + theZoom.scale());
			
			//log("foc: update: x " + theZoom.x());
			
			var dateRangeDiff = new Date(theRange[1]).getTime() - new Date(theRange[0]).getTime();
			var scaleVal = fullTimeRangeDifference / dateRangeDiff;
			//theZoom.scale(scaleVal);
			//theZoom.scale(zoomScale - 0);
			
			//theZoom.scale(1)
			//log("foc: update: start : " + new Date(theRange[0]).getTime() + " - end : " + new Date(theRange[1]).getTime())
			//log("foc: update: scaleb : " + theZoom.scale());
			
			//var dateRangeDiff = new Date(theRange[1]).getTime() - new Date(theRange[0]).getTime();
			
			//var calculatedScale = dateRangeDiff/fullTimeRangeDifference * Math.pow(2, 6.8);
			//log("foc: update: dateRangeDiff : " + dateRangeDiff);
			//log("foc: update: calculatedScale : " + calculatedScale);
			
			//var powerVal = ((dateRangeDiff - fullTimeRangeDifference) * 6.8 ) / (1000 - fullTimeRangeDifference);
			//log("foc: update: powerVal : " + powerVal);					
			//var scaleVal2 = Math.pow(2, powerVal);
			
			log("foc: update: scaleVal : " + scaleVal);
			//log("foc: update: scaleVal2 : " + scaleVal2);
			//theZoom.scale(scaleVal);
			
			//theZoom.scale(scaleVal);
			//log("foc: update: scaleu : " + theZoom.scale());
			//log("foc: update: scale now : " + theZoom.scale());
			
			focus.redrawLines(theData);
			
			//theFocus.select('.line').attr('d', lineFocus);	//show the focus line	
			theFocus.select('.x.axis').call(xAxisFocus);
			//theZoom.scale(scaleVal);
			if(caller == "timelineHandlesZoomed") {
				//theZoom.scale(scaleVal);
				//theZoom.x(xFocus);
				lastZoomScale = scaleVal;
			}
			else {
				//theZoom.scale(zoomScale);
				theZoom.scale(scaleVal);
				var temp = theZoom.scale();
				//theZoom.scale(lastZoomScale);
				lastZoomScale = scaleVal;
				
			}
			log("foc: update: scaleu2: " + theZoom.scale());
			log("foc: update: range = " + theRange + " caller : " + caller);
			
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
	};

	return focus;
};
