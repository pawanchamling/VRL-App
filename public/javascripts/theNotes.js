VRL.TheNotes = function (notesDIV) {
	
	var theData;
	var notesData = [];
	var theRange;
	
	
	//##############################################
	//For Observer Pattern
	
	var subject = new Subject();

	theNotes.addObserver = function addObserver(newObserver) {
		subject.observe(newObserver);
	};

	theNotes.removeObserver = function removeObserver(deleteObserver) {
		subject.unobserve(deleteObserver);
	};

	theNotes.handlesUpdated = function fetchRange() {
		// notify our observers of the stock change
		subject.notify(theRange, "theNotes");
	};
	//##############################################

	
	function theNotes() {
	}
	
	theNotes.initialize = function(data) {
		log("theNotes: TheNotes initialized");
		
		
		
		theData = data;
		
		var notesDataAvailable = false;
		theData.forEach(function (d) {
			//d = d.data();
			if(d.dataType() == 0 || d.dataType() == 1) {
				notesDataAvailable = true;
			}
		});
		
		if(notesDataAvailable) {
			
			theData.forEach(function (d) {
				if(d.dataType() == 0 || d.dataType() == 1) {
					
					dd = d.data();
					
					var noteColor;
					if(d.dataType() == 0) {
						noteColor = d.style.dataColor();
					}
					
					var aNote = {};
					dd.forEach(function (ddd) {
						var noteStr;
						if(d.dataType() == 1) {
							noteStr = d.dataInfo();
							noteStr = getKey(noteStr, ddd.value - 0);
							noteColor = d.styles[ddd.value];
						} 
						else {						
							noteStr = ddd.value;
						}
						aNote = {
							color: noteColor,
							timestamp: ddd.timestamp - 0,
							value: noteStr
						};
						//log(noteStr)
						
						//test to see how it looks when the text is very long
						//aNote.value = "this is one long note that a user may enter. because some of the user are so crazy that they would just do these kind of things just for fun. you know the psychopaths. anyways even the testers are the psychopaths. they would alwasys find some problem. alsways.";
						
						var str = 	
							"<div id='" + aNote.timestamp + "' class='noteBox noteBoxBackground1'>" + 
								"<div id='" + aNote.timestamp + "ColorBox' class='noteBoxColor' style='background: " + aNote.color + "'></div>" +
								"<div class='noteBoxTimestamp'>" + new Date(aNote.timestamp).toLocaleString() + "</div>" + 
								"<div id='" + aNote.timestamp + "Notes' class='noteBoxNotes'><b>\"" + aNote.value + "\"</b></div>" + 
							"</div>";
						
						$(notesDIV).append(str);
						
						var divWidth = $("#" + aNote.timestamp).width();
						$("#" + aNote.timestamp).css("width", divWidth)
						//log("divWidth = " + divWidth);
						//log("divHeight = " + divHeight);
						
						$("#" + aNote.timestamp + " .noteBoxNotes").css("width", divWidth - 180);
						
						var divHeight = $("#" + aNote.timestamp + "Notes").height();
						if(divHeight < 17){divHeight = 17};
						$("#" + aNote.timestamp).css("height", divHeight + 10);
						$("#" + aNote.timestamp + "ColorBox").css("height", divHeight );
						
						//log(str)
						
						notesData.push(aNote);
					});

					
					//log("length " + notesData.length)						
					
					
					
				}
			});
		
			//### now sorting the DIVs based on the timeline
			var mainDIV = $(notesDIV).attr("id");
			tinysort("#" + mainDIV + " > div", {attr: "id"});
			
			//### Let's show the data (if they are on)
			theNotes.showData();
			$(".nano").nanoScroller();
		}
		else {
			//no notes data available
		}
				
	};

	
	function getKey(obj, val) {
		for (var key in obj) {
			if (val === obj[key])
				return key;
		}
	}
	
	function getKey2(arr, val) {
		for (var i = 0; i < arr.length; i++) {
			var item = arr[i];
			for (var key in item) {
				log("val = " + val)
				if (val === item[key])
					return key;
			}
		}
		return null; // not found
	}
	
	
	theNotes.showData = function() {
		//notesData
		var rangeStart  = new Date(theRange[0] - 0).getTime();
		var rangeEnd	= new Date(theRange[1] - 0).getTime();
		//log("theNotes: rangeStart " + rangeStart + " rangeEnd " + rangeEnd );
		
		//removing the previous notes
		//$(notesDIV).empty();
		
		//only show the DIVs/Notes within the range
		notesData.forEach(function (d) {
			//log(d.timestamp)			
			if(d.timestamp >= rangeStart && d.timestamp <= rangeEnd){
				$("#" + d.timestamp).css("display", "block");
			}
			else {
				$("#" + d.timestamp).css("display", "none");
			}
			
		});
		
		
		
	};
	
	theNotes.reload = function(data) {
		notesData = [];
		$(notesDIV).empty();
		theNotes.initialize(data);
	};
	
	theNotes.update = function (range, caller, dataObject, timestamp) {
		
		if(caller == "itemHighlighted") {
			var str = dataObject.substring(0, 4);
			if(str == "circ") {
				$("#" + timestamp).removeClass("noteBoxBackground1");
				$("#" + timestamp).addClass("noteBoxBackground2");
			}
		}
		else if(caller == "itemHighlightedOut") {
			var str = dataObject.substring(0, 4);
		
			if(str == "circ") {
				$("#" + timestamp).removeClass("noteBoxBackground2");
				$("#" + timestamp).addClass("noteBoxBackground1");
			}
		}
		else {
			//### When the time-range is changed
			
			theRange = range;
			theNotes.showData();
		}
		
	};
	
	
	
	
	
	
	
	return theNotes;
};