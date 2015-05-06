VRL.TheMap = function (theMapDIV) {

	var map;
	var mapOptions;
	
	var theData;
	var theRange;
	
	var gpsData = [];
	var gpsPoints = [];
	var markers = [];
	var paths = [];
	
	
	var isMapInitialized = false;
	
	//##############################################
	//For Observer Pattern
	
	var subject = new Subject();

	theMap.addObserver = function addObserver(newObserver) {
		subject.observe(newObserver);
	};

	theMap.removeObserver = function removeObserver(deleteObserver) {
		subject.unobserve(deleteObserver);
	};

	theMap.handlesUpdated = function fetchRange() {
		// notify our observers of the stock change
		subject.notify(theRange, "theMap");
	};
	//##############################################

	theMap.Path = function() {
		var path;
	};
	

	function theMap() {
		//log("theMap: initializing");
		
		theMap.initialize();
	}
	

	theMap.initialize = function(data) {
		log("theMap: map initialized")
		
		
		theData = data;
		isMapInitialized = true;
		
		//
		var gpsDataAvailable = false;
		theData.forEach(function (d) {
			//d = d.data();
			if(d.dataType() == 3) {
				gpsDataAvailable = true;
				//break;
			}

		});
		
		if(gpsDataAvailable) {
			
			theData.forEach(function (d) {
				//d = d.data();
				if(d.dataType() == 3) {
					gpsData.push(d);
					//break;
				}

			});
			//log("theMap: no. of GPS data = " + gpsData.length);
			
			var firstData = gpsData[0].data();
			var firstLat, firstLong;
			firstData.map(function(d, index) {
				if(index == 0){
					firstLat  = d.latitude - 0;
					firstLong = d.longitude - 0;
				}
			});
			
			var mapOptions = {
				center: new google.maps.LatLng(firstLat, firstLong),
				zoom: 13
				//,mapTypeId: google.maps.MapTypeId.ROADMAP
			}			
			//log("theMap: firstLat " + firstLat + " firstLong " + firstLong);
			
			
			theMap.loadMap(mapOptions);
			theMap.loadData(gpsData);
			
		}
		else {
			
		}
		
		
	};

	theMap.loadMap = function(mapOptions) {		
		map = new google.maps.Map(theMapDIV, mapOptions);
	};

	
	theMap.loadData = function(data) {
		
		data.forEach(function (d, index) {
			//log("theMap : " + index + " - " + d.data())
			d = d.data();
			d.forEach(function(dd, index) {
				var posData = {
					timestamp: dd.timestamp,
					latLng: new google.maps.LatLng(dd.latitude, dd.longitude)
				}
				gpsPoints.push(posData);
			});
		});
		
		
		
		theMap.showMarkers();
		theMap.showPaths(data);
	};
	
	theMap.showMarkers = function() {
		//log("theMap : showing gpsPoints");
		
		//removing all the markers 
			
		for (var i = 0; i < markers.length; i++) {
			markers[i].setMap(null);
		}
		markers = [];
		
		gpsPoints.forEach(function (d, index) {
			
			
			var rangeStart  = new Date(theRange[0] - 0).getTime();
			var rangeEnd	= new Date(theRange[1] - 0).getTime();
			
			
			if(d.timestamp >= rangeStart && d.timestamp <= rangeEnd){
				//log("theMap : marker in a good range");
				var marker = new google.maps.Marker({
					position: d.latLng,
					map: map
				});
				
				markers.push(marker);
			}
				
			
			
		});
		
		
	};

	theMap.showPaths = function(data) {
		var rangeStart  = new Date(theRange[0] - 0).getTime();
		var rangeEnd	= new Date(theRange[1] - 0).getTime();
		
		for (var i = 0; i < paths.length; i++) {
			paths[i].setMap(null);
		}
		paths = [];		
		
		data.forEach(function (d, index) {
			var coordinates = [];
			var dataColor = d.style.dataColor();
			
			d = d.data();
			
			//d.style().dataColor()
			
			d.forEach(function(dd, index) {
				//log("theMap: " + dd.timestamp)
				if(dd.timestamp >= rangeStart && dd.timestamp <= rangeEnd) {
					coordinates.push(new google.maps.LatLng(dd.latitude, dd.longitude));
				}
			});			
			if(coordinates.length > 0) {
				var pathLine = new google.maps.Polyline({
								path: coordinates,
								geodesic: true,
								strokeColor: dataColor,
								strokeOpacity: 1.0,
								strokeWeight: 2
							});
			
				pathLine.setMap(map);
				paths.push(pathLine);
			}
		});
			
	};
	
	var previousTime = new Date().getTime();
	theMap.reloadElements = function(){
		var currentTime = new Date().getTime();
		
		////if(currentTime > (previousTime + 1000)) {
			//log("theMap: previousTime = " + previousTime + " currentTime = " + currentTime);
			theMap.showMarkers();
			theMap.showPaths(gpsData);
			
		//}
		
		
		previousTime = currentTime;
		
	}
	
	theMap.update = function (range, caller) {
		//log("theMap: caller = " + caller + " : range = " + range);
		theRange = range;
		
		//if the map has already been initialized
		if(isMapInitialized) {
			//theMap.showMarkers();
			//theMap.showPaths(theData);
			theMap.reloadElements();
		}
		
	};
	
	


	return theMap;
};