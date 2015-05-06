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
						log(noteStr)
						var strValue = "this is one long note that a user may enter. because some of the user are so crazy that they would just do these kind of things just for fun. you know the psychopaths. anyways even the testers are the psychopaths. they would alwasys find some problem. alsways.";
						
						var str = "<div id='" + aNote.timestamp + "' class='noteBox'>";
						str += "<div id='" + aNote.timestamp + "ColorBox' class='noteBoxColor' style='background: " + aNote.color + "'></div>";
						str += "<div class='noteBoxTimestamp'>" + new Date(aNote.timestamp).toLocaleString() + "</div>";
						str += "<div id='" + aNote.timestamp + "Notes' class='noteBoxNotes'>" + strValue + "</div></div>";
						
						$(notesDIV).append(str);
						
						var divWidth = $("#" + aNote.timestamp).width();
						//log("divWidth = " + divWidth);
						//log("divHeight = " + divHeight);
						
						$("#" + aNote.timestamp + " .noteBoxNotes").css("width", divWidth - 200);
						
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
		
			//log("theNotes: no. of notes = " + notesData.length)
			//theMap.loadMap(mapOptions);
			//theMap.loadData(gpsData);
			
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
		
		
		
	};
	
	
	
	theNotes.update = function (range, caller) {
		//log("theNotes: caller = " + caller + " : range = " + range);
		theRange = range;
		
	
		
	};
	
	
	
	
	
	
	
	return theNotes;
};