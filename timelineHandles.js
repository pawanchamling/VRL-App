TheTimelineHandles = function () {
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
	var height = 120;

	var contextHeight = 100;
	var contextHeightPadding = 5;
	var areaSpace = 40;

	var noOfData = 1;
	var timelineBarHeight = 20; //timelineHeight / noOfData;

	//The total time range
	var startTimeRange = 0;
	var endTimeRange = 0;
	
	//
		
	var  context;	
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
		// notify our observers of the stock change
		subject.notify(theRange);
	};
	//##############################################
	
	
	function timelineHandles(selection) {
		selection.each(function (data) {
			//var data = selection;
			
			noOfData = data.length;
			//log("noOfData = " + noOfData);
			calculateTimeRange(data);
			
			//log("data size = " + data);
			//log("data str : " + JSON.stringify(data));
			//data = data.getData();
			//log("data str: " + JSON.stringify(data));
			//log(data);	
						
			
			
			var availableWidth = width - padding.left - padding.right;
			var availableHeight = height - padding.top - padding.bottom;

			var container = d3.select(this);
			var svg = container.append('svg')
				.attr('width', width + margin.left + margin.right)
				.attr('height', height + margin.top + margin.bottom);
			
			var xContext = d3.time.scale().range([0, availableWidth]); //for context
			var yContext = d3.scale.linear().range([contextHeight, 0 + contextHeightPadding]);
			var xAxisContext = d3.svg.axis().scale(xContext).orient('bottom');

			//var xDomain = data.map(function(d) { return d[0]; });//if array
			
		
			
			
			//if object
			var xDomain = [];
			data.forEach(function (d) {
				d = d.data();
				//log("d = " + d);
				d.map(function(dd) {
					//log("dd = " + dd.timestamp);
					xDomain.push(new Date(dd.timestamp * 1000));
				});
				
			});
			//log("xDomain = " + xDomain);
			/**/
			
	
			//for context
			/*
			var lines = [];
			for(var i = 0; i < noOfData; i++) {
				lines[i] = d3.svg.line()
					.interpolate('monotone')
					.x(function (d) {
						return xContext(new Date(d.timestamp * 1000));
					})
					.y(function (d) {
						return yContext(d.value - 0);
					});
			}
			*/
			var lineGen = d3.svg.line()
									.x(function(d) {
										return xContext(new Date(d.timestamp * 1000));
									})
									.y(function(d) {
										return yContext(d.value - 0);
									})
									.interpolate("monotone");
			/*
			var lineContext = d3.svg.line()
				.interpolate('monotone')
				.x(function (d) {
					return xContext(new Date(d.timestamp * 1000));
				})
				.y(function (d) {
					return yContext(d.value - 0);
				});
			*/

			svg.append('defs').append('clipPath')
								.attr('id', 'clip')
								.append('rect')
								.attr('width', availableWidth)
								.attr('height', height - areaSpace);

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
				//log("d = " + d);
				d.map(function(dd) {
					//log("dd = " + dd.timestamp);
					//xDomain.push(new Date(dd.timestamp * 1000));
					yValues.push(dd.value - 0);
				});
				
			});
			//log("yValues : " + yValues);
			
			var yMax = d3.max(yValues);
			//var yMax = d3.max(data.map(function(d) { return d[1]; } )); //for array of data
			
			//log("yMax = " + yMax);

			xContext.domain(d3.extent(xDomain));
			yContext.domain([0, yMax]);

		
			for(var i = 0; i < noOfData; i++) {
				//log("l "  + data[i].data());
				//log("dataColor = " + data[i].style.dataColor());
				context.append('path')
						//.data(data[i].data())
						//.attr('class', 'line')						
						.attr('d', lineGen(data[i].data()))
						.attr('stroke', data[i].style.dataColor())
						.attr('stroke-width', data[i].style.lineSize())
						.attr('fill', 'none');
			}
			
			context.append('g')
					.attr('class', 'x axis')
					.attr('transform', 'translate(0,' + contextHeight + ')')
					.call(xAxisContext);

			var startDate = new Date(xDomain[0] - 0);
			var lastDate = new Date(xDomain[xDomain.length - 1] - 0);
			//log("start date :" + startDate);
			//log("Stop date :" + lastDate);

			theBrush = d3.svg.brush()
									.x(xContext)
									.extent([startDate, lastDate])
									.on('brush', brushed);

			context.append('g')
					.attr('class', 'x brush')
					.call(theBrush);

			//show the charts
			brushed();
			//brushed();

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
			function brushed() {
				//log("extent: " + theBrush.extent());
				theRange = theBrush.extent();
				for(var i = 0; i < noOfData; i++) {
					//context.select('.line').attr('d', lineGen(data[0].data())); //lineContext //show the context line
				}
				subject.notify(theRange);//notifying all the observers about the change in range
			}

			function nobrush(a, b, c) {
				//to stop the brushing from the chart background
				//log('Brushing from background diabled')
				d3.event.stopPropagation()
			}
			
			function calculateTimeRange(data){
				//log("calculating time range");
				var start, end;
				if(data.length >= 1) {
					start = data[0].data();
					start = start[0].timestamp + 0;
					//log("start: " + start);
					
					end = data[0].data();
					end = end[end.length - 1].timestamp + 0;
					//log("end: " + end);
				}
				if(data.length > 1) {						
					for(var i = 1; i < data.length; i++) {
						var s = data[i].data();
						s = s[0].timestamp + 0;
						
						var e = data[i].data();
						e = e[e.length - 1].timestamp + 0;
						
						
						if(s < start) {
							startTimeRange = s;
						}
						if(e > end) {
							endTimeRange = e;
						}
					}
				
					//log("Start timestamp: " + start + " and End timestamp: " + end );
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


	timelineHandles.update = function (range) {
		
		//log("theBrush : " + theBrush.extent());
		//log("before " + theBrush.extent());
		theRange = range;
		theBrush.extent(range);
		
		//log("after  " + theBrush.extent());
		if(theBrush.extent() != null) {
			//timeline.changeHandles();
			context.select('.brush').call(theBrush.extent(theRange));
		}
		
	}
	
	return timelineHandles;
};
