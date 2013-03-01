function init_map() {
	tuftsLatLng = new google.maps.LatLng(42.40546, -71.117764);
	var mapOptions = {
		zoom: 8,
		center: tuftsLatLng,
		mapTypeId: google.maps.MapTypeId.ROADMAP
	};
	map = new google.maps.Map(document.getElementById("map_canvas"), mapOptions);

	var xmlhttp = new XMLHttpRequestRetryer(5);
	xmlhttp.onSuccess = function(responseText) { json = JSON.parse(responseText); console.log('got the json. yeah.'); };
	xmlhttp.onFail = function() { console.log('poop! 404!'); };
	xmlhttp.open('GET', 'http://mbtamap-cedar.herokuapp.com/mapper/redline.json', true);
	xmlhttp.send();
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