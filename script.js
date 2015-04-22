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
    var height = 500;
	
    var contextHeight = 100;
	var contextHeightPadding = 5;
    var areaSpace = 40;

    function widget(selection) {
        selection.each(function(data) {
			
            var availableWidth = width - padding.left - padding.right;
            var availableHeight = height - padding.top - padding.bottom;

            var container = d3.select(this);
            var svg = container.append('svg')
                .attr('width', width + margin.left + margin.right)
                .attr('height', height + margin.top + margin.bottom);
						
            var x = d3.time.scale().range([0, availableWidth]); //for focus
            var x2 = d3.time.scale().range([0, availableWidth]); //for context
            var y = d3.scale.linear().range([availableHeight - contextHeight - areaSpace, 0]);
            var y2 = d3.scale.linear().range([contextHeight - contextHeightPadding, 0 + contextHeightPadding]);
			
            var xAxis = d3.svg.axis().scale(x).orient('bottom');
            var xAxis2 = d3.svg.axis().scale(x2).orient('bottom');
            var yAxis = d3.svg.axis().scale(y).orient('left');
            var yAxis2 = d3.svg.axis().scale(y).orient('right');
	
			var xDomain = [];
			data.forEach(function(d) {
				//console.log(d.timestamp);
				xDomain.push( new Date(d.timestamp * 1000));
			});
			
			
				
			//for focus	
            var line = d3.svg.line()
                .interpolate('monotone')
                .x(function(d) { return x(new Date(d.timestamp * 1000)); })
                .y(function(d) { return y(d.value - 0);});

			//for context
            var line2 = d3.svg.line()
                .interpolate('monotone')
                .x(function(d) { return x2(new Date(d.timestamp * 1000)); })
                .y(function(d) { console.log("line 2 value:" + d.value);
				return y2(d.value - 0);});

            svg.append('defs').append('clipPath')
                .attr('id', 'clip')
                .append('rect')
                .attr('width', availableWidth)
                .attr('height', height - contextHeight - areaSpace);

            var wrap = svg.append('g')
                .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

            var focus = wrap.append('g')
                .attr('class', 'focus')
                .attr('transform', 'translate(' + padding.left + ',' + padding.top + ')');

            var context = wrap.append('g')
                .attr('class', 'context')
                .attr('transform', 'translate(' + padding.left + ',' + (availableHeight - contextHeight) + ')');

					          
			//var yMax = d3.max(data.map(function(d) { return d[1]; } ));
			var yValues = [];
			data.forEach(function(d) {
				yValues.push(d.value - 0); 
			});
			
			//console.log(yValues);
			var yMax = d3.max(yValues);
			//var yMax = 100;
			console.log("yMax = " + yMax);
			
            x.domain(d3.extent(xDomain));
            y.domain([0, yMax]);
            x2.domain(x.domain());
            y2.domain(y.domain());			
			
            focus.append('path')
                .data(data)
                .attr('class', 'line')
                .attr('d', line);
			
            focus.append('g')
                .attr('class', 'x axis')
                .attr('transform', 'translate(0,' + (availableHeight - contextHeight - areaSpace) + ')')
                .call(xAxis);

            focus.append('g')
                .attr('class', 'y axis')
                .call(yAxis);

            focus.append('g')
                .attr('class', 'y axis')
                .attr('transform', 'translate(' + availableWidth + ',0)')
                .call(yAxis2);

            context.append('path')
                .data(data)
                .attr('class', 'line')
                .attr('d', line2);

            context.append('g')
                .attr('class', 'x axis')
                .attr('transform', 'translate(0,' + contextHeight + ')')
                .call(xAxis2);
			
			var startDate = new Date(xDomain[0] - 0);
			var lastDate = new Date(xDomain[xDomain.length - 1] - 0);
			console.log("start date :" + startDate);
			console.log("Stop date :" + lastDate);
			 
			 var theBrush = d3.svg.brush()
                .x(x2)
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
				.attr("height", contextHeight - contextHeightPadding + 1);
				
			//the handles configuration
			  context.selectAll(".resize").append("rect")
				.attr("width", '5px')
				.attr("height", contextHeight + 15)
				.classed("border");
		    
								
		
			
			
            function brushed() {
                console.log("extent: " + theBrush.extent());
				
                x.domain(theBrush.empty() ? x2.domain() : theBrush.extent());				
                focus.select('.line').attr('d', line);	//show the focus line		
                context.select('.line').attr('d', line2);	//show the context line												
                focus.select('.x.axis').call(xAxis);
            }
			
			function nobrush(a, b, c) {
				//to stop the brushing from the chart background
				console.log('Brushing from background diabled')
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

    return widget;
};
