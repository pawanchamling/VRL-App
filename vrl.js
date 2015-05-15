//#######################################################	
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
	
//#######################################################
//For the Observer Pattern

var Subject = (function (window, undefined) {

	function Subject() {
		this._list = [];
	}

	// this method will handle adding observers to the internal list
	Subject.prototype.observe = function observeObject(obj) {
		console.log('added new observer');
		this._list.push(obj);
	};

	Subject.prototype.unobserve = function unobserveObject(obj) {
		for (var i = 0, len = this._list.length; i < len; i++) {
			if (this._list[i] === obj) {
				this._list.splice(i, 1);
				console.log('removed existing observer');
				return true;
			}
		}
		return false;
	};

	Subject.prototype.notify = function notifyObservers() {
		var args = Array.prototype.slice.call(arguments, 0);
		for (var i = 0, len = this._list.length; i < len; i++) {
			this._list[i].update.apply(null, args);
		}
	};

	return Subject;

})(window);



var Subject2 = (function (window, undefined) {

	function Subject2() {
		this._list = [];
	}

	// this method will handle adding observers to the internal list
	Subject2.prototype.observe = function observeObject(obj) {
		console.log('added new observer');
		this._list.push(obj);
	};

	Subject2.prototype.unobserve = function unobserveObject(obj) {
		for (var i = 0, len = this._list.length; i < len; i++) {
			if (this._list[i] === obj) {
				this._list.splice(i, 1);
				console.log('removed existing observer');
				return true;
			}
		}
		return false;
	};

	Subject2.prototype.notify = function notifyObservers() {
		var args = Array.prototype.slice.call(arguments, 0);
		for (var i = 0, len = this._list.length; i < len; i++) {
			this._list[i].update.apply(null, args);
		}
	};

	return Subject2;

})(window);

//#######################################################

d3.selection.prototype.moveToFront = function() {
  return this.each(function(){
    this.parentNode.appendChild(this);
  });
};	
	
//#######################################################

$(".showHide").each( function () {
	$(this).click( function () {
			//if()
			var status = $(this).text();
			if(status == "Hide") {
				$(this).text("Show");
				$(this).parent().next().css("display", "none");
			}
			if(status == "Show") {
				$(this).text("Hide");
				$(this).parent().next().css("display", "block");
			}
	});
});


$('#uploadForm').submit(function() {
        log('uploading the file ...');
 
        $(this).ajaxSubmit({                                                                                                                 
 
            error: function(xhr) {
				log('Error: ' + xhr.status);
            },
 
            success: function(response) {				
				if(response.error) {
					log('Opps, something bad happened');
					return;
				}
		 
				var imageUrlOnServer = response.path;
		 
				log('Success, file uploaded to:' + imageUrlOnServer);
				//$('<img/>').attr('src', imageUrlOnServer).appendTo($('body'));
            }
	});
 
	// Have to stop the form from submitting and causing                                                                                                       
	// a page refresh - don't forget this                                                                                                                      
	return false;
});
 


//global namespace
//var VRL = VRL || {};
			
			//var TheApp = VRL();
			//TheApp.addData(jsonData);
			//log(TheApp.allData);
			//log(TheApp.getData());
			
			//log(theD.style.dataColor());
			//log(theD.dataName());
	
			
			
				//log($(window).height());   // returns height of browser viewport
			//log($(document).height()); // returns height of HTML document
			//log($(window).width());   // returns width of browser viewport
			//log($(document).width()); // returns width of HTML document
			//log(screen.height)//screen height
			//log(screen.width)//screen width
		   
		   
		   //### the Document width and height
			var docWidth  = $(document).width();
			var docHeight = $(document).height();
			var extraSpaces = 22; //because of margin and border 
			
			var notesDIVwidth = $("#NotesDIV").width();
			$("#NotesDIV").css("width", notesDIVwidth - 3 );// so that the nodesDIV fits in
			
			log("notesDIVwidth = " + notesDIVwidth);
			
			//
			//var widget = myWidget();
			
			//### The main App
			var TheApp = VRL();
			
			var timelineHandles = VRL.TheTimelineHandles(docWidth, docHeight, extraSpaces);
			var timeline = VRL.TheTimeline(docWidth, docHeight, extraSpaces);
			var focus = VRL.TheFocus(docWidth, docHeight, extraSpaces);
			
			var mapDIV = document.getElementById("LocationDIV");
			var map = VRL.TheMap(mapDIV);
			
			var notesDIV = document.getElementById("NotesPanelContents");
			var theNotes = VRL.TheNotes(notesDIV);
		   
		
		   
		   
		   //log(values);
		   
		   /*
		   d3.select('#TimeLineHandlerDIV')
                    .datum(values)
                    .call(widget);
			*/
			
			var theData = [];
			
			//log("here we go");
			
			d3.json("data/Noise_data.json", function (data) {
				TheApp.addData(data);
				
				loadData2()
			});
			function loadData2() {
				d3.json("data/Noise_data3.json", function (data) {	
					TheApp.addData(data);
					TheApp.getDataAt(1).style.dataColor("#ff0000");
					loadData3();
				});	
			}
			function loadData3() {
				d3.json("data/2015-04-21-230058_Ordinal_data.json", function (data) {	
					TheApp.addData(data);
					TheApp.getDataAt(2).style.dataColor("#00ff00");
					TheApp.getDataAt(2).styles.push("#007900");
					TheApp.getDataAt(2).styles.push("#00df00");
					TheApp.getDataAt(2).styles.push("#88ff88");
					loadData4();
				});	
			}
			function loadData4() {
				d3.json("data/2015-04-21-230058_Nominal_data.json", function (data) {	
					TheApp.addData(data);
					TheApp.getDataAt(3).style.dataColor("#000000");
					loadData5();
					//loadChart();
				});	
			}
			function loadData5() {
			//2015-05-02-200533_Noise_data
				d3.json("data/2015-04-21-230058_GPS_data.json", function (data) {	
					TheApp.addData(data);
					TheApp.getDataAt(4).style.dataColor("#e1d600");
					loadData6();
				});	
			}
			function loadData6() {
			//2015-05-02-200533_Noise_data
				d3.json("data/2015-04-29-181948_GPS_data.json", function (data) {	
					//TheApp.addData(data);
					//TheApp.getDataAt(5).style.dataColor("#e1d600");
					loadData7();
				});	
			}
			function loadData7() {
				d3.json("data/Noise_data4.json", function (data) {	
					TheApp.addData(data);
					TheApp.getDataAt(5).style.dataColor("#f015f0");
					loadData8();
				});	
			}
			function loadData8() {
				/*
				d3.json("data/Noise_data5.json", function (data) {	
					TheApp.addData(data);
					TheApp.getDataAt(6).style.dataColor("#40fd09");
				});	
				*/
				
				loadChart();
			}
			//
			
			function loadChart() {
				//log(theData);
				//var dat = TheApp.getData();
				//log("array size = " + dat.length);
				
				d3.select('#TimeLineDIV')
						.datum(TheApp.getData())
						.call(timeline);
				
				d3.select('#TimeLineHandlerDIV')
						.datum(TheApp.getData())
						.call(timelineHandles);
				//equivalent to : timelineHandles(d3.select('#TimeLineHandlerDIV').datum(theData))
				
				
				
				d3.select('#FocusDIV')
						.datum(TheApp.getData())
						.call(focus);
				
				//initialize map
				map.initialize(TheApp.getData());
				theNotes.initialize(TheApp.getData());
				
				loadMoreData();
				
			}

			var someObserver = {
				update : function () {
					console.log('"update" called: ', arguments);
				}
			};
			
			//###########  adding the Observers   ########################
			timelineHandles.addObserver(timeline);
			timelineHandles.addObserver(focus);
			timelineHandles.addObserver(map);
			timelineHandles.addObserver(theNotes);
			
			timeline.addObserver(timelineHandles);
			timeline.addObserver(focus);
			timeline.addObserver(map);
			timeline.addObserver(theNotes);
			
			focus.addObserver(timelineHandles)
			
			setTimeout(loadLastData, 5000);
			
			function loadLastData() {
				log("Fired after some time")
				d3.json("data/2015-04-27-010729_Ordinal_data.json", function (data) {	
					//2015-04-29-181948_GPS_data
					
					TheApp.addData(data);
					TheApp.getDataAt(6).style.dataColor("#40fd09");
					
					timeline.reload(TheApp.getData());
					timelineHandles.reload(TheApp.getData());
					focus.reload(TheApp.getData());
					map.reload(TheApp.getData());
				});	
			}
			
			//###########
			
			
			function loadMoreData() {
				//widget.addData();
			}
			
			
			
			