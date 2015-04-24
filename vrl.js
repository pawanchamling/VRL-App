var VRL = function(){

	var allData = []; //to keep all the data
	
	theApp.addData = function(data) {
		//### Adding a new data in the list of data
		allData.push(new VRL.TheData(data))
		log("VRL: Observers Notified");
		subject.notify(theApp.getData());
	};
	
	theApp.getData = function() {
		//log("VRL: getData");
		return allData;
	};
	
	//theApp.updateData = function() {}
	//###############################################
	//### For the Observer Pattern
	var subject = new Subject();

	theApp.addObserver = function addObserver(newObserver) {
		subject.observe(newObserver);
	};

	theApp.removeObserver = function removeObserver(deleteObserver) {
		subject.unobserve(deleteObserver);
	};
	
	theApp.handlesUpdated = function fetchRange() {
		// fake fetching the stocks
		var stocks = {
			aapl : 167.00,
			goog : 243.67,
			msft : 99.34
		};

		// notify our observers of the stock change
		subject.notify(theRange);
	};
	
	//###############################################


	function theApp() { 
		
	}


	return theApp;
};

	
//VRL.allData = []; //stores all TheData here

//VRL.

//Data Styles
VRL.DataStyle = function() {
	var dataColor = "#0000ff"; // hex
	var lineSize = 2; //in pixels
	var timelineSize = 20; //in pixels
	
	this.dataColor = function(_) {
			if (!arguments.length)
				return dataColor;
			dataColor = _;
	};
	this.lineSize = function(_) {
			if (!arguments.length)
				return lineSize;
			lineSize = _;
	};
	this.timelineSize = function(_) {
			if (!arguments.length)
				return timelineSize;
			timelineSize = _;
	};
}

//The Data Wrapper
VRL.TheData = function(data) {
		//data = JSON.parse(data); //only when we have the JSON string
		var dataName = data.name;
		var dataSource = data.source;
		var dataType = data.type;
		var dataInfo = data.valueInfo;
		var data = data.values;					
		
		this.style = new VRL.DataStyle();
		
		this.dataName = function(_) {
				if (!arguments.length)
					return dataName;
				dataName = _;
		};
		this.dataSource = function(_) {
				if (!arguments.length)
					return dataSource;
				dataSource = _;
		};
		this.dataType = function(_) {
				if (!arguments.length)
					return dataType;
				dataType = _;
		};
		this.dataInfo = function(_) {
				if (!arguments.length)
					return dataInfo;
				dataInfo = _;
		};
		this.data = function(_) {
				if (!arguments.length)
					return data;
				data = _;
		};
				
}



