stations = {};
platformTimes = {};
carmen_waldo_markers = [];
var posMarker;

function init_map() {
	tuftsLatLng = new google.maps.LatLng(42.40546, -71.117764);
	var mapOptions = {
		zoom: 12,
		center: tuftsLatLng,
		mapTypeId: google.maps.MapTypeId.ROADMAP
	};
	map = new google.maps.Map(document.getElementById("map_canvas"), mapOptions);
	
	infoWindow = new google.maps.InfoWindow({
		content: 'Station Info'
	});

	var stationsAJAX = new XMLHttpRequestRetryer(2);
	stationsAJAX.onSuccess = showStations;
	stationsAJAX.open('GET', 'stations.json', true);
	stationsAJAX.send();

	var redlineAJAX = new XMLHttpRequestRetryer(5);
	redlineAJAX.onSuccess = buildPlatformTimesFromJSON;
	redlineAJAX.onFail = function() { console.log('Unable to access current Red Line times!'); };
	redlineAJAX.open('GET', 'http://mbtamap-cedar.herokuapp.com/mapper/redline.json', true);
	redlineAJAX.send();
	
	var carmenWaldoAJAX = new XMLHttpRequestRetryer(10);
	carmenWaldoAJAX.onSuccess = showCarmenWaldo;
	carmenWaldoAJAX.onFail = function() { console.log('Carmen and Waldo are sneaky! Their location cannot be found'); };
	carmenWaldoAJAX.open('GET', 'http://messagehub.herokuapp.com/a3.json', true);
	carmenWaldoAJAX.send();
	
	if (navigator.geolocation) {
		navigator.geolocation.watchPosition(function(position) {
			var location = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
			if (posMarker == null)
				posMarker = new google.maps.Marker({
					position: location,
					map: map,
					title: 'You are here'
				});
			else
				posMarker.setPosition(location);
			
			//Calculate and display Carmen & Waldo distances
			var dist_overlay = document.getElementById('dist_overlay');
			if (carmen_waldo_markers.length > 0) {
				dist_overlay.style.visibility = 'visible';
				dist_overlay.innerHTML = '';	//clear contents in case this is a location update
			}
			for (var i = 0; i < carmen_waldo_markers.length; i++) {
				var marker = carmen_waldo_markers[i];
				var dist_row = document.createElement('div');
				var distance = google.maps.geometry.spherical.computeDistanceBetween(posMarker.getPosition(), marker.getPosition());
				dist_row.innerHTML = '<img src="' + marker.getIcon() + '" alt="' + marker.getTitle() + '"/>' +
									 '<p>' + (distance*0.000621371).toPrecision(1) + ' miles</p>';
				dist_overlay.appendChild(dist_row);
			}
			
			//Find closest station and prepare info window for user's current location marker
			var closest = findClosestStation(posMarker.getPosition());
			google.maps.event.addListener(posMarker, 'click', function() {
				infoWindow.setContent('<h3>You are here.</h3><p>Nearest Red Line station: ' + closest.station_marker.getTitle() +
									  ' (' + (closest.distance*0.000621371).toPrecision(1) + ' miles away)</p>');
				infoWindow.open(map, posMarker);
			});
		});
	}
	else
		alert("Your browser doesn't support geolocation.");
}

function showStations(csvResponseText) {
	stations = JSON.parse(csvResponseText);
	//draw markers
	for (var stationName in stations) {
		station = stations[stationName];
		var icon = 'mbta_small.png'
		var marker = new google.maps.Marker({
			position: new google.maps.LatLng(parseFloat(station[0].stop_lat), parseFloat(station[0].stop_lon)),
			map: map,
			title: stationName,
			icon: icon
		});
		setMarkerCallback(marker);
		stations[stationName]["marker"] = marker;
	}
	drawRedline();
}

function setMarkerCallback(marker) {						    //A separate function so each closure keeps its own marker
	google.maps.event.addListener(marker, 'click', function() {	//instead of all taking the last one in the loop
		var stationName = marker.getTitle();
		var platforms = stations[stationName];
		var contents = document.createElement('div');
		for (var i = 0; i < platforms.length; i++) {
			var platform = platforms[i];
			var col_div = document.createElement('div');
			col_div.className = 'platform_div';
			var title = document.createElement('h4');
			title.textContent = platform.PlatformName;
			col_div.appendChild(title);
			
			var timeList = document.createElement('ul');
			timeList.className = 'timeList';
			col_div.appendChild(timeList);
			var times = platformTimes[platform.PlatformKey];
			if (times != null) {
				for (var j = 0; j < times.length; j++) {
					var time = times[j].time;
					var timeItem = document.createElement('li');
					timeItem.textContent = time;
					timeList.appendChild(timeItem);
				}
			}
			contents.appendChild(col_div);
		}

		infoWindow.setContent(contents);
		infoWindow.open(map, marker);
	});
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

function showCarmenWaldo(responseText) {
	cwJson = JSON.parse(responseText);
	if (cwJson.length == 0)
		this.retry();
	else {
		for (var i in cwJson) {
			var person = cwJson[i];
			var latLng = new google.maps.LatLng(person.loc.latitude, person.loc.longitude);
			var icon = (person.name == 'Waldo') ? 'waldo.png' : 'carmen.png';
			var marker = new google.maps.Marker({
				position: latLng,
				map: map,
				title: person.name,
				icon: icon
			});
			var listener = (function(person_ref) {
				return function() {
					infoWindow.setContent('<h3>' + person_ref.name + '</h3><p>' + person_ref.loc.note + '</p>');
					infoWindow.open(map, this);
				}
			})(person);
			google.maps.event.addListener(marker, 'click', listener);
			carmen_waldo_markers.push(marker);
		}
	}
}

function findClosestStation(posLatLng) {
	var min_dist = Infinity;
	var min_station = null;
	for (var s in stations) {
		var station = stations[s];
		var station_pos = station.marker.getPosition();
		var dist = google.maps.geometry.spherical.computeDistanceBetween(posLatLng, station_pos);
		if (dist < min_dist) {
			min_dist = dist;
			min_station = station.marker;
		}
	}
	return { station_marker: min_station, distance: min_dist };
}

function buildPlatformTimesFromJSON(responseText) {
	json = JSON.parse(responseText);
	for (var i = 0; i < json.length; i++) {
		var train = json[i];
		if (train.Line == 'Red' && train.InformationType == 'Predicted') {
			var trainInfo = {
				time: train.Time,
				timeRemaining: train.TimeRemaining,		//TODO: format times here
				platformKey: train.PlatformKey
			};
			if (platformTimes[train.PlatformKey] == null) platformTimes[train.PlatformKey] = [];
			platformTimes[train.PlatformKey].push(trainInfo);	//TODO: sort times here
		}
	}
}