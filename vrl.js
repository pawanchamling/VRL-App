//#######################################################	
//### for browser logs ###
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

	
//#######################################################
//### For the Observer Pattern

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



//#######################################################

//#######################################################

//### to show/hide the panels and charts 
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


//### to know how many of the different types of data are loaded so that different color schemes can be used
var totalOrdinalData = 0;
var totalSensorData = 0;
var totalMapData = 0;

//### different colors for different data types
var ordinalColors = [
		["#3e5b00", "#669900", "#83b602", "#99cc00", "#c1ff06", "#d5ff53", "#e7ff9b"],
		["#491861", "#75269b", "#a03fcf", "#b163d8", "#b86fdb", "#cd9be6", "#e0c0ef"],
		["#005977", "#007ba4", "#0099cc", "#00befd", "#48d1ff", "#84e0ff", "#b0ecff"],
		["#894b01", "#ba6701", "#e47e01", "#fe981b", "#fead4b", "#fec076", "#fed8a9"]
	];

var sensorColors = ["#a041d0", "#28bef0", "#ff2d2d", "#91d700",   "#ff8a01", "#acec01", "#ff6d00", "#c70461" ];

var mapColors = ["#ff8a01", "#ffa00e", "#ffbd5b", "#ffd08a", "#ffdfae", "#aa6600"];	

//######################################################
   
		   
//### the Document width and height
var docWidth  = $(document).width();
var docHeight = $(document).height();
var extraSpaces = 22; //because of margin and borders

var notesDIVwidth = $("#NotesDIV").width();
$("#NotesDIV").css("width", notesDIVwidth - 3 );// so that the nodesDIV fits in

log("VRL: notesDIVwidth = " + notesDIVwidth);


//######################################################
//### The main App ###
var TheApp = VRL();

//### The charts and panels
var timelineHandles = VRL.TheTimelineHandles(docWidth, docHeight, extraSpaces);
var timeline = VRL.TheTimeline(docWidth, docHeight, extraSpaces);
var focus = VRL.TheFocus(docWidth, docHeight, extraSpaces);

var mapDIV = document.getElementById("LocationDIV");
var map = VRL.TheMap(mapDIV);

var notesDIV = document.getElementById("NotesPanelContents");
var theNotes = VRL.TheNotes(notesDIV);
//######################################################



loadChart();

//### Load all the charts and panels to visualize data
function loadChart() {
	
	d3.select('#TimeLineDIV')
			.datum(TheApp.getData())
			.call(timeline);
	
	d3.select('#TimeLineHandlerDIV')
			.datum(TheApp.getData())
			.call(timelineHandles);		
	
	
	d3.select('#FocusDIV')
			.datum(TheApp.getData())
			.call(focus);
	
	map.initialize(TheApp.getData());
	theNotes.initialize(TheApp.getData());
	
	
}

		
			
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
//#############################################################


//### For testing puspose: loading data 	
setTimeout(loadLastData, 3000);		

function loadLastData() {
	log("VRL: Fired after some time")
	d3.json("data/gps.json", function (data) {	
		//2015-04-21-230058_Nominal_data.json
		//2015-04-21-230058_Ordinal_data.json
		//2015-04-29-181948_GPS_data
		//2015-04-21-230058_GPS_data
		//Noise_data
		//Noise_data3					
		
		TheApp.addData(data);
		setDataColors(data);					
		
	});	
	d3.json("data/ordinal.json", function (data) {
		TheApp.addData(data);
		setDataColors(data);
	});
	d3.json("data/nominal.json", function (data) {
		TheApp.addData(data);
		setDataColors(data);
	});
	d3.json("data/noise.json", function (data) {
		TheApp.addData(data);
		setDataColors(data);
	});
	d3.json("data/temperature.json", function (data) {
		TheApp.addData(data);
		setDataColors(data);
	});
	
	setTimeout(reloadEverything, 1000);
		
}

//### Reload the data in every charts and panels			
function reloadEverything() {			
	//### reload everything
	timeline.reload(TheApp.getData());
	timelineHandles.reload(TheApp.getData());
	focus.reload(TheApp.getData());
	map.reload(TheApp.getData());
	theNotes.reload(TheApp.getData());
}
			
			
//### Set the default color for the data according to the data type - for data color variations			
function setDataColors(data) {
	
	var dataTypeIs = data.type;

	if(dataTypeIs == 0) {
		//### Nominal data
		TheApp.getDataAt(TheApp.noOfData() - 1).style.dataColor("#222222");
	}
	else if(dataTypeIs == 1) {
		//### Ordinal data
		var noOfOrdinalKeys = Object.keys(data.valueInfo).length;
		
		for(var i = 0; i < noOfOrdinalKeys; i++) {
			var color = ordinalColors[totalOrdinalData][i % 7];
			TheApp.getDataAt(TheApp.noOfData() - 1).styles.push(color);
		}
		
		totalOrdinalData++;
	}				
	else if(dataTypeIs == 2) {
		//### Sensor data
		var color = sensorColors[totalSensorData % 8];
		TheApp.getDataAt(TheApp.noOfData() - 1).style.dataColor(color);
		
		totalSensorData++;
	}				
	else if(dataTypeIs == 3) {
		//### Sensor data
		var color = mapColors[totalSensorData % 6];
		TheApp.getDataAt(TheApp.noOfData() - 1).style.dataColor(color);
		
		totalSensorData++;
	}
	
	
}

			
//### Handle the uploading of data file and loading of the uploaded file
$('#uploadForm').submit(function() {
    
	log('VRL: Uploading the file ...');
 	$(this).ajaxSubmit({

		error: function(xhr) {
			log('VRL: Error: ' + xhr.status);
		},

		success: function(response) {				
			if(response.error) {
				log('VRL: Opps, something bad happened');
				return;
			}
	 
			var imageUrlOnServer = response.path;
	 
			log('VRL: Success, file uploaded to:' + imageUrlOnServer);
			
			//### load the uploaded data
			d3.json(imageUrlOnServer, function (data) {	
				
				TheApp.addData(data);
				setDataColors(data);
				
				reloadEverything()
			});	
			
		}
	});
 
	// Have to stop the form from submitting and causing                                                                                                       
	// a page refresh - don't forget this                                                                                                                      
	return false;
});
 

		
			