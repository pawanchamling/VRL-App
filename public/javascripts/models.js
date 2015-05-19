var VRL = function() {

	var allData = []; //to keep all the data
	
	theApp.addData = function(data) {
		//### Adding a new data in the list of data
		allData.push(new VRL.TheData(data))
	};
	
	theApp.getData = function() {
		return allData;
	};
	
	theApp.noOfData = function() {
		return allData.length;
	};
	
	theApp.getDataAt = function(index) {		
		if(index < allData.length) { 
			return allData[index];
		}
		else {
			return "Data not found";
		}
	};


	function theApp() { 
		//### the App
	}

	return theApp;
};



//### Data Styles
VRL.DataStyle = function() {
	
	//### attributes with defaults
	var dataColor = "#0000ff"; // hex
	var lineSize = 2; //in pixels
	var timelineSize = 20; //in pixels
	var lineNodeRadius = 4;
	var lineContextNodeRadius = 2; //radius of node in timehandles chart
	var userNodeFocusRadius = 9;
	var userNodeContexRadius = 10;
	
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
	this.lineNodeRadius = function(_) {
		if (!arguments.length)
			return lineNodeRadius;
		lineNodeRadius = _;
	};
	this.lineContextNodeRadius = function(_) {
		if (!arguments.length)
			return lineContextNodeRadius;
		lineContextNodeRadius = _;
	};
	this.userNodeFocusRadius = function(_) {
		if (!arguments.length)
			return userNodeFocusRadius;
		userNodeFocusRadius = _;
	};
	this.userNodeContexRadius = function(_) {
		if (!arguments.length)
			return userNodeContexRadius;
		userNodeContexRadius = _;
	};
}

//### The Data Wrapper
VRL.TheData = function(data) {
	
	var dataName = data.name;
	var dataSource = data.source;
	var dataType = data.type;
	var dataInfo = data.valueInfo;
	var data = data.values;
	var filePath = "";
	
	this.visible = true; //showing the data or not
	
	this.style = new VRL.DataStyle();
	this.styles = [];
	
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
	this.filePath = function(_) {
		if (!arguments.length)
			return filePath;
		filePath = _;
	};
				
}



