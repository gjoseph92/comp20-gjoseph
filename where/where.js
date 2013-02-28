function init_map() {
	var mapOptions = {
		zoom: 8,
		center: new google.maps.LatLng(42.40546, -71.117764),
		mapTypeId: google.maps.MapTypeId.ROADMAP
	};
	var map = new google.maps.Map(document.getElementById("map_canvas"), mapOptions);
}