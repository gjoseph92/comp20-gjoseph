stations = [];

function init_map() {
	tuftsLatLng = new google.maps.LatLng(42.40546, -71.117764);
	var mapOptions = {
		zoom: 8,
		center: tuftsLatLng,
		mapTypeId: google.maps.MapTypeId.ROADMAP
	};
	map = new google.maps.Map(document.getElementById("map_canvas"), mapOptions);
	google.maps.event.addListener(map, 'click', addClickMarker);

	var stationsAJAX = new XMLHttpRequestRetryer(2);
	stationsAJAX.onSuccess = function(responseText) {
		var stationsCsv = responseText.split('\n');
		var headings = stationsCsv[0].split(',');
		//stations = [];
		for (var i = 1; i < stationsCsv.length; i++) {
			var values = stationsCsv[i].split(',');
			var station = new Object();
			for (var j = 0; j < headings.length; j++)
				station[ headings[j] ] = values[j];
			stations[ station.PlatformKey ] = station;
		}
	};
	stationsAJAX.onFail = function() { console.log('poop! cant get the stations!'); };
	stationsAJAX.open('GET', 'http://developer.mbta.com/RT_Archive/RealTimeHeavyRailKeys.csv', true);
	stationsAJAX.send();

	var redlineAJAX = new XMLHttpRequestRetryer(5);
	redlineAJAX.onSuccess = function(responseText) { json = JSON.parse(responseText); console.log('got the json. yeah.'); };
	redlineAJAX.onFail = function() { console.log('poop! 404!'); };
	redlineAJAX.open('GET', 'http://mbtamap-cedar.herokuapp.com/mapper/redline.json', true);
	redlineAJAX.send();
}

function addClickMarker(event) {
	marker = new google.maps.Marker( {
		position: event.latLng,
		draggable: true,
		map: map,
		animation: google.maps.Animation.DROP
	});
	marker.setTitle(Math.random().toString());
}
/*
function getScheduleJSON(onComplete) {
	xmlhttp = new XMLHttpRequest();
	xmlhttp.onreadystatechange = function() {
		if (xmlhttp.readyState == 4 && xmlhttp.status == 200)
			onComplete( JSON.parse(xmlhttp.responseText) );
	}
	xmlhttp.open('GET', 'http://mbtamap-cedar.herokuapp.com/mapper/redline.json', true);
	xmlhttp.send();
}
*/