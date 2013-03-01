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
	stationsAJAX.onSuccess = buildStationsArrFromCSV;
	stationsAJAX.onFail = function() { console.log('poop! cant get the stations!'); };
	stationsAJAX.open('GET', 'http://developer.mbta.com/RT_Archive/RealTimeHeavyRailKeys.csv', true);
	stationsAJAX.send();

	var redlineAJAX = new XMLHttpRequestRetryer(5);
	redlineAJAX.onSuccess = function(responseText) { json = JSON.parse(responseText); console.log('got the json. yeah.'); };
	redlineAJAX.onFail = function() { console.log('poop! 404!'); };
	redlineAJAX.open('GET', 'http://mbtamap-cedar.herokuapp.com/mapper/redline.json', true);
	redlineAJAX.send();
	
	console.log(stations.length);
}

function showStations() {
	for (var station in stations) {
		//console.log('hi');
		station = stations[station];
		var lon_str = station[0].stop_lon;		//Why is stop_lon undefined??
		var lon = parseFloat(lon_str);
		var pos = new google.maps.LatLng(parseFloat(station[0].stop_lat), lon);
		var marker = new google.maps.Marker({
			position: pos,
			map: map,
			title: station[0].StationName
		});
		station["marker"] = marker;
	}
}

function buildStationsArrFromCSV(responseText) {
	var stationsCsv = responseText.split('\n');
	var headings = stationsCsv[0].split(',');
	for (var i = 1; i < stationsCsv.length; i++) {
		var values = stationsCsv[i].split(',');
		var platform = new Object();
		for (var j = 0; j < headings.length; j++)	//build platform objects using fields listed in CSV header (row 0)
			platform[ headings[j] ] = values[j];
		if (platform.Line == 'Red') {	//only take the red line
			if (stations[ platform.StationName ] == null)	//store platforms in an array
				stations[ platform.StationName ] = [platform];
			else
				if (platform.Direction == 'NB') stations[platform.StationName].unshift(platform);	//put NB stations first in platforms array
				else stations[platform.StationName].push(platform);
		}
	}
	showStations();
}