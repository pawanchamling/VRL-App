//### convert seconds to hrs:min:seconds:milliseconds format
function secondsToTime(s) {
  //var ms = s % 1000; //for milliseconds, if needed
 // s = (s - ms) / 1000;
	if(isNaN(s)) {
		return "unknown";
	}
	
	var secs = s % 60;
	s = (s - secs) / 60;
	var mins = s % 60;
	var hrs = (s - mins) / 60;

	secs = Math.round(secs);
	
	if(hrs == 0 && mins == 0){
		return secs + " secs";
	}
	else if(hrs == 0 && mins != 0) {
		return mins + ' mins ' + secs + " secs";
	}
	else {
		return hrs + ' hrs ' + mins + ' mins ' + secs + " secs"; // + '.' + ms;
	}
	
	//return hrs + ' hrs ' + mins + ' mins ' + secs + " secs"; // + '.' + ms;
}


	
//### returns the key based on the value from an object
function getKey(obj, val) {
	for (var key in obj) {
		if (val === obj[key])
			return key;
	}
}
	
	
//### A function that returns color based on the color send and the luminance value... 
//### basically a new gradient of the given color based on the luminance value
function ColorLuminance(hex, lum) {

	// validate hex string
	hex = String(hex).replace(/[^0-9a-f]/gi, '');
	if (hex.length < 6) {
		hex = hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2];
	}
	lum = lum || 0;

	// convert to decimal and change luminosity
	var rgb = "#", c, i;
	for (i = 0; i < 3; i++) {
		c = parseInt(hex.substr(i*2,2), 16);
		c = Math.round(Math.min(Math.max(0, c + (c * lum)), 255)).toString(16);
		rgb += ("00"+c).substr(c.length);
	}

	return rgb;
}

function log10(val) {
  return Math.log(val) / Math.LN10;
}

	