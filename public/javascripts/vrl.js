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
//### for listing all the classes in svg element 
$.fn.classList = function() {return this[0].className.split(/\s+/);};
//#######################################################

//### to show/hide the panels and charts //### not in use currently ###
$(".showHide1").each( function () {
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
		["#c1ff06", "#89b700", "#536f00", "#669900", "#3e5b00", "#e7ff9b", "#d5ff53"],
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

var workingWidth = docWidth - extraSpaces;

var notesDIVwidth = $("#NotesDIV").width();
$("#NotesDIV").css("width", notesDIVwidth - 3 );// so that the nodesDIV fits in

log("VRL: notesDIVwidth = " + notesDIVwidth);


//######################################################
//### The main App ###
var TheApp = VRL();

//### The charts and panels
var theContext = VRL.TheContext(docWidth, docHeight, extraSpaces);
var timeline = VRL.TheTimeline(docWidth, docHeight, extraSpaces);
var focus = VRL.TheFocus(docWidth, docHeight, extraSpaces);

var mapDIV = document.getElementById("LocationDIV");

log("workingWidth = " + workingWidth);
$("#timeRangeDIV").css("width", workingWidth - 400)

var mapDIVwidth = Math.round(0.7 * workingWidth);
$(mapDIV).css("width", mapDIVwidth);
var map = VRL.TheMap(mapDIV);

var notesDIV = document.getElementById("NotesPanelContents");
$(notesDIV).css("width", workingWidth - mapDIVwidth - 2);
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
			.call(theContext);		
	
	
	d3.select('#FocusDIV')
			.datum(TheApp.getData())
			.call(focus);
	
	map.initialize(TheApp.getData());
	theNotes.initialize(TheApp.getData());
	
	
}

		
			
//###########  adding the Observers   ########################
theContext.addObserver(timeline);
theContext.addObserver(focus);
theContext.addObserver(map);
theContext.addObserver(theNotes);

timeline.addObserver(theContext);
timeline.addObserver(focus);
timeline.addObserver(map);
timeline.addObserver(theNotes);

focus.addObserver(theContext)
focus.addObserver(timeline)
focus.addObserver(theNotes)

//#############################################################


//### For testing puspose: loading data 	
setTimeout(loadLastData, 001);		

function loadLastData() {
	log("VRL: Fired after some time")

	d3.json("data/2015-05-27-012055_Temperature_data.json", function (data) {	
		//2015-04-21-230058_Nominal_data
		//2015-04-21-230058_Ordinal_data
		//2015-04-29-181948_GPS_data
		//2015-04-21-230058_GPS_data
		//2015-04-21-230058_Noise_data
		//Noise_data
		//Noise_data3					
		//gps, ordinal, nominal, noise, temperature
		//2015-05-26-134442
		//2015-05-27-012055
		
		TheApp.addData(data);
		setDataColors(data);					
		
	});
	d3.json("data/2015-05-27-012055_Ordinal_data.json", function (data) {
		TheApp.addData(data);
		setDataColors(data);
	});
	d3.json("data/2015-05-27-012055_Nominal_data.json", function (data) {
		TheApp.addData(data);
		setDataColors(data);
	});
	d3.json("data/2015-05-27-012055_GPS_data.json", function (data) {
		TheApp.addData(data);
		setDataColors(data);
	});
	/*
	d3.json("data/Noise_data3.json", function (data) {
		TheApp.addData(data);
		setDataColors(data);
	});	*/
	d3.json("data/2015-05-27-012055_Noise_data.json", function (data) {
		TheApp.addData(data);
		setDataColors(data);
	});
	
	
	/*
	d3.json("data/2015-05-27-012055_GPS_data.json", function (data) {
		TheApp.addData(data);
		setDataColors(data);
	}); */  /*
	d3.json("data/Noise_data2.json", function (data) {
		TheApp.addData(data);
		setDataColors(data);
	});*/

	
	setTimeout(reloadEverything, 1000);
	//setTimeout(hideData, 3000);
		
}

var ii = 0;
function hideData() {
	log("### hiding the data")
	
	if(ii != 5)	{	
		focus.hideData(ii); //.selectAll(".data" + 1).attr("visibility", "hidden");
		timeline.hideData(ii);
		theContext.hideData(ii);
		
		ii++;
		setTimeout(hideData, 4000);
	}
	
}

//### Reload the data in every charts and panels			
function reloadEverything() {
			
	//### reload everything
	timeline.reload(TheApp.getData());
	theContext.reload(TheApp.getData());
	focus.reload(TheApp.getData());
	map.reload(TheApp.getData());
	theNotes.reload(TheApp.getData());
	
	resetShowHideDataPopup();
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
		
		TheApp.getDataAt(TheApp.noOfData() - 1).style.dataColor(ordinalColors[totalOrdinalData][2]);
		
		totalOrdinalData++;
	}				
	else if(dataTypeIs == 2) {
		//### Sensor data
		var color = sensorColors[totalSensorData % 8];
		TheApp.getDataAt(TheApp.noOfData() - 1).style.dataColor(color);
		
		totalSensorData++;
	}				
	else if(dataTypeIs == 3) {
		//### GPS data
		var color = mapColors[totalSensorData % 6];
		TheApp.getDataAt(TheApp.noOfData() - 1).style.dataColor(color);
		
	}
	
	
}


//### For "Add data" popup modal ####
$('#addDataBtn').click(function(e) {
	//$("#fileUploadDIV").css("display", "block");
	$('#addDataModal').bPopup({});
});

//### For "Reset" popup modal ####
$('#resetBtn').click(function(e) {
	$('#resetDialogModal').bPopup({});
});

//### When "Yes" for Reset is clicked in Reset popup modal ####
$('#resetYesBtn').click(function(e) {
	TheApp.resetData();	
	
	totalOrdinalData = 0;
	totalSensorData = 0;
	totalMapData = 0;
	
	reloadEverything()
});





//### the popup for show/hide data 
function resetShowHideDataPopup() {

	//emptying the previous data
	$("#listDataDIV").empty();
	
	var theData = TheApp.getData();
	theData.forEach(function (d, i) {
		dd = d.data();
		var startTime, endTime;
		var timeRangeString = "";
		
		//### updating the time range text shown at the top bar
		if(dd.length > 0) {
			dd.forEach(function (ddd, index) {
				if(index == 0) {
					startTime = ddd.timestamp - 0;
				}
				if(index == dd.length - 1) {
					endTime = ddd.timestamp - 0;
				}
			});
			
			timeRangeString = "From <span class='timestampString'> <b>" + new Date(startTime).toLocaleString() + "</b>" +  
								"</span> to  <span class='timestampString'> <b>" + new Date(endTime).toLocaleString() + "</b>" +
								"</span>";
		}
		else {
			timeRangeString = "No Data";
		}
		
		var otherInfo = ""; 
		if(d.dataType() == 0 || d.dataType() == 1) {
			otherInfo = "( no of items = <b>" + d.data().length + "</b>)";
		}
		
		var str = 	"<div class='listDataItemDIV' id='data" + i + "cover'>" + 
						"<div class='listDataItemVisibilityStatus'> " +
							"<form action=''>" + 
								"Show <input class='showHideDataCheck' id='showHideData" + i + "' type='checkbox' name='visible' value='isVisible' >"  + 
							"</form>" + 
						"</div>" + 
						"<div class='colorPickerCover'>" + 
							"<input id='data" + i + "colorInput' type='text' name='theSceneColorInput' size='10' class='colorPicker'/>" +
						"</div>" +
					//	"<div class='listDataItemColorBox' style='background: " + d.style.dataColor() + "'></div>" + 
						"<div class='listDataNameAndRangeCover'>" + 
							"<div class='listDataItemDataName'><b>" + d.dataName() + "</b> " + otherInfo +"</div>" +
							"<div class='listDataItemTimeRange'>" + timeRangeString + "</div>" + 
						"</div>" + 
					"</div>";
		$("#listDataDIV").append(str);
		
		//### for the ordinal value
		if(d.dataType() == 1) {
			var divStr = 	"<div class='listOrdinalDataDIV' id='ordinalValues" + i + "cover'>" + 
								"<div id='ordinalValuesContainer'>";
			
			var dataInfo = d.dataInfo();
			var noOfKeys = Object.keys(dataInfo).length;
			var noOfEachKeys = [];
			
			//### to know how many of each ordinal values are in the data
			for(j = 0; j < noOfKeys; j++) {
				noOfEachKeys.push(0);
			}			
			dd.forEach(function (ddd, index) {
				noOfEachKeys[ddd.value]++;
			});		
			
			//### Creating the HTML DOM to be inserted 
			for(var j = 0; j < noOfKeys; j++) {
				divStr += 	"<div class='ordinalItem'>" +
								"<div class='noOfOrdinalItem'>" + "" + "</div>" +
								"<div class='listDataItemColorBox' id='ordinalValue" + i + "-" + j + "' style='background: " + d.styles[j] + "'>" + "</div>" +
								"<div class='ordinalValueText' >" + getKey(dataInfo, j) + " (" + noOfEachKeys[j] + ") </div>" +
							"</div>";
			}
			divStr += "</div>"
			$("#listDataDIV").append(divStr);
			
		}
		else if(d.dataType() == 2) {
			//### including the max and min values 
			
			otherInfo = "( max: <b>" + (d.dataInfo().max - 0).toFixed(3) + " " + d.dataInfo().unit + "</b> and min: <b>" + (d.dataInfo().min - 0).toFixed(3) + " " + d.dataInfo().unit + "</b> )";
			
			var divStr = 	"<div class='sensorDataInfoDIV' >" + 
								"<div class='sensorDataInfo'>" + otherInfo + "</div>";
					divStr += "</div>"
			$("#listDataDIV").append(divStr);
			
		}
		
		
		//### Status of the checkbox based on if the data is set visible or not
		if(d.visible) {			
			$("#showHideData" + i).prop( "checked", true );
		}
		
		//### Show the current color 
		$("#data" + i + "colorInput").val(d.style.dataColor());
		
		
		//### set the listener for color changes
		$("#data" + i + "colorInput").spectrum({
			preferredFormat: "hex",
			showInitial: true,
			showInput: true,
			move: function(theColorIs) {
				theColorIs = theColorIs.toHexString();
				
				changeDataColors(theColorIs)							
			},
			hide: function(theColorIs) {
				theColorIs = theColorIs.toHexString();
				
				changeDataColors(theColorIs)
			}
		});
		
		function changeDataColors(theColorIs) {
			focus.changeColor(i, theColorIs);
				theContext.changeColor(i, theColorIs);
				timeline.changeColor(i, theColorIs);
				if(d.dataType() == 3) {
					map.changeColor(i, theColorIs);
				}
				theNotes.reload(TheApp.getData());
		}
		
		//### Defining the event listeners for each of the check boxes for each of the data
		$("#showHideData" + i).change(function () {
			
			var idIs = $(this).attr("id");
			var ii = idIs.substring(12, idIs.length);
			
			if(this.checked) {
				log("check " + $(this).attr("id") + " checked");
				d.visible = true;
				
				if(d.dataType() == 0 || d.dataType() == 1 || d.dataType() == 2) {
					focus.showData(ii); 
					theContext.showData(ii);
				}
				if(d.dataType() == 3) {
					map.showData(ii);
				}
				if(d.dataType() == 0 || d.dataType() == 1 ) {
					theNotes.unhideData(ii);
				}
				
				timeline.showData(ii);
				
			}
			else {				
				log("check " + $(this).attr("id") + " unchecked");
				
				d.visible = false;
				
				if(d.dataType() == 0 || d.dataType() == 1 || d.dataType() == 2) {
					focus.hideData(ii); 
					theContext.hideData(ii);
				}
				if(d.dataType() == 3) {
					map.showData(ii);
				}
				if(d.dataType() == 0 || d.dataType() == 1 ) {
					theNotes.hideData(ii);
				}
					
				timeline.hideData(ii);
				
			}
			
		});
		
		
	});

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
				log('VRL: Opps, something bad happened. File Upload failed');
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
 
	//### remove the file-upload selection - so that the user won't click on it again to upload the same data
	var fileUploadName = $("#fileUploadName");
	$("#fileUploadName").replaceWith( fileUploadName = fileUploadName.clone( true ) );
 
	//### close the popped-up modal
	parent.$("#addDataModal").bPopup().close();
	// Have to stop the form from submitting and causing                                                                                                       
	// a page refresh - don't forget this                                                                                                                      
	return false;
});
 
//### when the show/hide Data button is hovered show the showHideButtonPanel
$("#showHideBtn").click(function() {
	var dropMenu = $(this).next();
	if(dropMenu.is(':hidden')) {
		dropMenu.show("fast");
	}
	else {
		dropMenu.hide("fast");
	}
});

$("#closeSettingButton").click(function() {
	$("#showHideButtonPanel").css( "display", "none" );
});

/*
$("#showHideButtonPanel").hover(	
	function() {
		$( this ).css( "display", "block" );
	}, function() {
		//$( this ).css( "display", "none" );
	}
);
*/

/*
//### comment it out later -- just for test
$('#submitFileUploadBtn').click(function() {
	//$("#chooseColorContainer").css("display", "block");
	//$("#fileUploadDIV").css("display", "none");
	parent.$("#addDataModal").bPopup().close();
       return false;
	
});
*/


$(".resize").each(function() {
	$(this).hover(function() {
		log("hovering");
	},
	function() {
	});
});
				
