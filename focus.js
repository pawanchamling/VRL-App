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

	var width = 960;
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
		subject.notify(theRange);
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
				//log("d = " + d);
				d.map(function (dd) {
					//log("dd = " + dd.timestamp);
					xDomain.push(new Date(dd.timestamp - 0));
				});

			});
			
			startTimeRange = xDomain[0];
			endTimeRange = xDomain[xDomain.length - 1];
			
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

				
			xFocus = d3.time.scale().range([0, availableWidth]); //for theFocus			
			yFocus = d3.scale.linear().range([availableHeight, 0]);

			xAxisFocus 			= d3.svg.axis().scale(xFocus).orient('bottom').tickFormat(d3.time.format("%X"));
            var yAxisFocusLeft 	= d3.svg.axis().scale(yFocus).orient('left');
            var yAxisFocusRight = d3.svg.axis().scale(yFocus).orient('right');

			xFocus.domain(d3.extent(xDomain));			
			yFocus.domain([0, yMax]);	
			
						
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
									.scaleExtent([0, 10])
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
				//log("extent: " + theBrush.extent());
				theRange = theBrush.extent();
				for (var i = 0; i < noOfData; i++) {
					//theFocus.select('.line').attr('d', lineGen(data[0].data())); //lineContext //show the theFocus line
				}
				
				theZoom.x(xFocus);
				
				subject.notify(theRange); //notifying all the observers about the change in range
			}

			function nobrush(a, b, c) {
				//to stop the brushing from the chart background
				//log('Brushing from background diabled')
				d3.event.stopPropagation()
			}

			function calculateTimeRange(data) {
				//log("calculating time range");
				var start,
				end;
				if (data.length >= 1) {
					start = data[0].data();
					start = start[0].timestamp + 0;
					//log("start: " + start);

					end = data[0].data();
					end = end[end.length - 1].timestamp + 0;
					//log("end: " + end);
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
			theFocus.append('path')
				.attr("id", "line" + i)
                .attr('class', 'theLine')
				.attr('d', lineGen(data[i].data()))
				.attr('stroke', data[i].style.dataColor())
				.attr('stroke-width', data[i].style.lineSize())
				.attr('fill', 'none');
		}
	};

	focus.redrawLines = function(data) {
		for (var i = 0; i < noOfData; i++) {
			theFocus.select('#' + 'line' + i).attr('d', lineGen(data[i].data()));
		}
	}
	
	focus.zoomed = function() {
		//check if domain is okay
		//log(startTimeRange)
		log(d3.event.translate[0] + " - " + d3.event.translate[1] + " : " + theRange);
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
			theZoom.translate([0,0]);
		}
		theRange = xFocus.domain();
		if (theRange[0] < startTimeRange) {
			//log("here")
			theRange[0] = startTimeRange;
			xFocus.domain()[0] = startTimeRange;
			
			
			//theZoom.translate([0,0]);
			//log("not anymore " + theRange[0] + " : " + startTimeRange);
		}
		else { 
			//log("not anymore " + theRange[0] + " : " + startTimeRange);
		}
		if (theRange[1] > endTimeRange) {
			//theZoom.translate([0,0]);
			theRange[1] = endTimeRange;
			xFocus.domain()[1] = endTimeRange;
		}
		else {
			//log("yes, not anymore");
		}
		

		//log(xFocus.domain()[0])
		if (theFocus != undefined) {
			//theZoom.translate(theRange);
			//theZoom.translate(theZoom.translate()[0]);
			//log(theZoom.scale())
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
	//subject.notify(theRange);//notifying all the observers about the change in range
		
		//log("zoomed : " + brushExtent);
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
	
	
	
	focus.update = function (range) {
	
		theRange = range;
		if (theFocus != undefined) {		
			xFocus.domain(theRange);
			focus.redrawLines(theData);
			//theFocus.select('.line').attr('d', lineFocus);	//show the focus line	
			theFocus.select('.x.axis').call(xAxisFocus);
		}
		
	};

	return focus;
};
