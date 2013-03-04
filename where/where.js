stations = {};
platformTimes = {};

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
	stationsAJAX.onFail = function() { console.log('poop! cant get the stations!'); };
	stationsAJAX.open('GET', 'stations.json', true);
	stationsAJAX.send();

	var redlineAJAX = new XMLHttpRequestRetryer(5);
	redlineAJAX.onSuccess = buildPlatformTimesFromJSON;
	redlineAJAX.onFail = function() { console.log('poop! 404!'); };
	redlineAJAX.open('GET', 'http://mbtamap-cedar.herokuapp.com/mapper/redline.json', true);
	redlineAJAX.send();
	
	var carmenWaldoAJAX = new XMLHttpRequestRetryer(10);
	carmenWaldoAJAX.onSuccess = showCarmenWaldo;
	carmenWaldoAJAX.onFail = function() { console.log('poop! carmen and waldo are sneaky!'); };
	carmenWaldoAJAX.open('GET', 'http://messagehub.herokuapp.com/a3.json', true);
	carmenWaldoAJAX.send();
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
			//console.log('platform '+i+' of '+stationName+' ('+platform.PlatformKey+'): '+times.length+' items.');
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
	//try {
		cwJson = JSON.parse(responseText);
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
			})(person)
			google.maps.event.addListener(marker, 'click', listener);
		}
/*
	} catch (err) {
		console.log('Carmen and Waldo do not wish to be found, they are obfuscating their locations!');
	}
*/
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