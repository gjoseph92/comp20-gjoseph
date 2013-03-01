stations = {};

function init_map() {
	tuftsLatLng = new google.maps.LatLng(42.40546, -71.117764);
	var mapOptions = {
		zoom: 11,
		center: tuftsLatLng,
		mapTypeId: google.maps.MapTypeId.ROADMAP
	};
	map = new google.maps.Map(document.getElementById("map_canvas"), mapOptions);

	var stationsAJAX = new XMLHttpRequestRetryer(2);
	stationsAJAX.onSuccess = showStations;
	stationsAJAX.onFail = function() { console.log('poop! cant get the stations!'); };
	stationsAJAX.open('GET', 'http://developer.mbta.com/RT_Archive/RealTimeHeavyRailKeys.csv', true);
	stationsAJAX.send();

	var redlineAJAX = new XMLHttpRequestRetryer(5);
	redlineAJAX.onSuccess = function(responseText) { json = JSON.parse(responseText); console.log('got the json. yeah.'); };
	redlineAJAX.onFail = function() { console.log('poop! 404!'); };
	redlineAJAX.open('GET', 'http://mbtamap-cedar.herokuapp.com/mapper/redline.json', true);
	redlineAJAX.send();
}

function showStations(csvResponseText) {
	buildStationsArrFromCSV(csvResponseText);
	//draw markers
	for (var stationName in stations) {
		station = stations[stationName];
		var marker = new google.maps.Marker({
			position: new google.maps.LatLng(parseFloat(station[0].stop_lat), parseFloat(station[0].stop_lon)),
			map: map,
			title: station[0].stop_name
		});
		stations[stationName]["marker"] = marker;
	}
	drawRedline();
}

function drawRedline() {
	var trunk = ['Alewife Station','Davis Station','Porter Square Station','Harvard Square Station','Central Square Station','Kendall/MIT Station','Charles/MGH Station','Park St. Station','Downtown Crossing Station','South Station','Broadway Station','Andrew Station','JFK/UMass Station','Savin Hill Station'];
	var braintree = ['Savin Hill Station','North Quincy Station','Wollaston Station','Quincy Center Station','Quincy Adams Station','Braintree Station'];
	var ashmont = ['Savin Hill Station','Fields Corner Station','Shawmut Station','Ashmont Station'];
	var orderedBranches = [trunk, braintree, ashmont];
	
	for (var i = 0; i < orderedBranches.length; i++) {
		var line = orderedBranches[i];
		var points = [];
		for (var j = 0; j < line.length; j++) {
			var marker = stations[ line[j] ].marker;
			points.push(marker.getPosition());
		}
		var polyLine = new google.maps.Polyline({
			path: points,
			strokeColor: "#d50c00",
			strokeOpacity: 0.7,
			strokeWeight: 3
		});
		polyLine.setMap(map);
	}
}

function buildStationsArrFromCSV(responseText) {
	var stationsCsv = responseText.split(/[\n|\r]+/);	//newlines take many forms
	var headings = stationsCsv[0].split(',');
	for (var i = 1; i < stationsCsv.length; i++) {
		var values = stationsCsv[i].split(',');
		var platform = new Object();
		for (var j = 0; j < headings.length; j++)	//build platform objects using fields listed in CSV header (row 0)
			platform[ headings[j] ] = values[j];
		if (platform.Line == 'Red') {	//only take the red line
			if (stations[ platform.stop_name ] == null)	//store platforms in an array
				stations[ platform.stop_name ] = [platform];
			else
				if (platform.Direction == 'NB') stations[platform.stop_name].unshift(platform);	//put NB stations first in platforms array
				else stations[platform.stop_name].push(platform);
		}
	}
}