myWidget = function() {
    "use strict";
    // default settings
    var margin = {
        top: 10,
        bottom: 10,
        left: 10,
        right: 10
    };
	
    var padding = {
        top: 10,
        bottom: 10,
        left: 40,
        right: 40
    };
	
    var width = 960;
    var height = 600;
	
    var contextHeight = 100;
	var timelineHeight = 100;
	var contextHeightPadding = 5;	
    var areaSpace = 40;
	
	var noOfData = 1;
	var timelineBarHeight = 20; //timelineHeight / noOfData;
	
	
	//==< for browser logs >===
	function log(msg, color) {
		
		if($.browser.msie){
			console.log(msg);
		}
		else {
			console.log("%c" + msg, "color:" + color + ";font-weight:bold;");
		}
	}
	function log(msg) {
		console.log(msg);
	}
	//==< for browser logs >===
	
    function widget(selection) {
        selection.each(function(data) {
			
			log(data);
			data = data.values;
			log(data);
			
			
            var availableWidth = width - padding.left - padding.right;
            var availableHeight = height - padding.top - padding.bottom;
			
			var focusHeight = availableHeight - contextHeight - timelineHeight ;
			
            var container = d3.select(this);
            var svg = container.append('svg')
                .attr('width', width + margin.left + margin.right)
                .attr('height', height + margin.top + margin.bottom);
						
            var xFocus 	 = d3.time.scale().range([0, availableWidth]); //for focus
            var xContext = d3.time.scale().range([0, availableWidth]); //for context
            var xTimeline= d3.time.scale().range([0, availableWidth]); //for timeline
            var yFocus = d3.scale.linear().range([focusHeight - areaSpace, 0]);
            var yContext = d3.scale.linear().range([contextHeight - contextHeightPadding , 0 + contextHeightPadding]);
            var yTimeline = d3.scale.linear().range([timelineHeight, 0 ]);
			
            var xAxisFocus = d3.svg.axis().scale(xFocus).orient('bottom');
            var xAxisContext = d3.svg.axis().scale(xContext).orient('bottom');
            var xAxisTimeline = d3.svg.axis().scale(xTimeline).orient('bottom');
            var yAxisFocusLeft = d3.svg.axis().scale(yFocus).orient('left');
            var yAxisFocusRight = d3.svg.axis().scale(yFocus).orient('right');
	
			var xDomain = [];
			data.forEach(function(d) {
				//log(d.timestamp);
				xDomain.push( new Date(d.timestamp * 1000));
			});
			
			
				
			//for focus	
            var lineFocus = d3.svg.line()
                .interpolate('monotone')
                .x(function(d) { return xFocus(new Date(d.timestamp * 1000)); })
                .y(function(d) { return yFocus(d.value - 0);});

			//for context
            var lineContext = d3.svg.line()
                .interpolate('monotone')
                .x(function(d) { return xContext(new Date(d.timestamp * 1000)); })
                .y(function(d) { return yContext(d.value - 0);});

			var lineTimeline = d3.svg.line()
                .interpolate('monotone')
                .x(function(d) { return xTimeline(new Date(d.timestamp * 1000)); })
                .y(function(d) { return 89;}); //where to keep the bar
				
				
            svg.append('defs').append('clipPath')
                .attr('id', 'clip')
                .append('rect')
                .attr('width', availableWidth)
                .attr('height', height - contextHeight - timelineHeight - areaSpace);

            var wrap = svg.append('g')
                .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

            var focus = wrap.append('g')
                .attr('class', 'focus')
                .attr('transform', 'translate(' + padding.left + ',' + padding.top + ')');

            var timeline = wrap.append('g')
                .attr('class', 'timeline')
                .attr('transform', 'translate(' + padding.left + ',' + (availableHeight - timelineHeight) + ')');
           
		   var context = wrap.append('g')
                .attr('class', 'context')
                .attr('transform', 'translate(' + padding.left + ',' + (focusHeight) + ')');

					          
			//var yMax = d3.max(data.map(function(d) { return d[1]; } ));
			var yValues = [];
			data.forEach(function(d) {
				yValues.push(d.value - 0); 
			});
			
			//log(yValues);
			var yMax = d3.max(yValues);
			//var yMax = 100;
			log("yMax = " + yMax);
			
            xFocus.domain(d3.extent(xDomain));	
            xContext.domain(xFocus.domain());		
            xTimeline.domain(xFocus.domain());
            yFocus.domain([0, yMax]);		
            yContext.domain(yFocus.domain());
            yTimeline.domain(yFocus.domain());				
			
            focus.append('path')
                .data(data)
                .attr('class', 'line')
                .attr('d', lineFocus);
			
            focus.append('g')
                .attr('class', 'x axis')
                .attr('transform', 'translate(0,' + (focusHeight - areaSpace) + ')')
                .call(xAxisFocus);

            focus.append('g')
                .attr('class', 'y axis')
                .call(yAxisFocusLeft);

            focus.append('g')
                .attr('class', 'y axis')
                .attr('transform', 'translate(' + availableWidth + ',0)')
                .call(yAxisFocusRight);
				
				
			timeline.append('path')
                .data(data)
                .attr('class', 'line')
                .attr('d', lineTimeline)
				.style("stroke-width", timelineBarHeight);
				
			timeline.append('g')
                .attr('class', 'x axis')
                .attr('transform', 'translate(0,' + (timelineHeight)  + ')')
                .call(xAxisTimeline);

            context.append('path')
                .data(data)
                .attr('class', 'line')
                .attr('d', lineContext);

            context.append('g')
                .attr('class', 'x axis')
                .attr('transform', 'translate(0,' + contextHeight  + ')')
                .call(xAxisContext);
			
			
				
				
			
			var startDate = new Date(xDomain[0] - 0);
			var lastDate = new Date(xDomain[xDomain.length - 1] - 0);
			log("start date :" + startDate);
			log("Stop date :" + lastDate);
			 
			 var theBrush = d3.svg.brush()
                .x(xContext)
				.extent([startDate, lastDate])
                .on('brush', brushed);
       
			context.append('g')
                .attr('class', 'x brush')
                .call(theBrush);
						
			
            //show the charts
            brushed();
			
			// Don't allow the brushing from background and single click context switch
			context.select(".background")
				.on("mousedown.brush", nobrush)
				.on("touchstart.brush", nobrush);
				
			context.selectAll("rect")
                .attr('y', contextHeightPadding - 2)
				.attr("height", contextHeight + timelineHeight - contextHeightPadding + 1);
				
			//the handles configuration
			  context.selectAll(".resize").append("rect")
				.attr("width", '5px')
				.attr("height", contextHeight + timelineHeight + 15)
				.classed("border");
		    
			//context.style("background-color", "#00ff00");					
		
			
			
            function brushed() {
                log("extent: " + theBrush.extent());
				
                xFocus.domain(theBrush.empty() ? xContext.domain() : theBrush.extent());				
                focus.select('.line').attr('d', lineFocus);	//show the focus line		
                timeline.select('.line').attr('d', lineTimeline);	//show the timeline line	
                context.select('.line').attr('d', lineContext);	//show the context line													
                focus.select('.x.axis').call(xAxisFocus);
				
				
            }
			
			function nobrush(a, b, c) {
				//to stop the brushing from the chart background
				log('Brushing from background diabled')
				d3.event.stopPropagation()
			}
        });

        return widget;
    }

    // Expose Public Variables

    widget.margin = function(_) {
        if (!arguments.length) return margin;
        margin.top = typeof _.top !== 'undefined' ? _.top : margin.top;
        margin.right = typeof _.right !== 'undefined' ? _.right : margin.right;
        margin.left = typeof _.left !== 'undefined' ? _.left : margin.left;
        margin.bottom = typeof _.bottom !== 'undefined' ? _.bottom : margin.bottom;
        return widget;
    };

    widget.padding = function(_) {
        if (!arguments.length) return padding;
        padding.top = typeof _.top !== 'undefined' ? _.top : padding.top;
        padding.right = typeof _.right !== 'undefined' ? _.right : padding.right;
        padding.left = typeof _.left !== 'undefined' ? _.left : padding.left;
        padding.bottom = typeof _.bottom !== 'undefined' ? _.bottom : padding.bottom;
        return widget;
    };

    widget.width = function(_) {
        if (!arguments.length) return width;
        width = _;
        return widget;
    };

    widget.height = function(_) {
        if (!arguments.length) return height;
        height = _;
        return widget;
    };

    widget.contextHeight = function(_) {
        if (!arguments.length) return contextHeight;
        contextHeight = _;
        return widget;
    };

    widget.areaSpace = function(_) {
        if (!arguments.length) return areaSpace;
        areaSpace = _;
        return widget;
    };
	
	//##############################################
	widget.timelineBarHeight = function(_) {
        if (!arguments.length) return timelineBarHeight;
        timelineBarHeight = _;
        return widget;
    };
	
    return widget;
};
