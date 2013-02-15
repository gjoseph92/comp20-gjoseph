function start_game() {
	canvas = document.getElementById('game');
	if (canvas.getContext) {
		ctx = canvas.getContext('2d');
		sprites = new Image();
		sprites.src = "assets/frogger_sprites.png";
		sprite_width = sprites.width;	//???
		
		drawBackground();
	}
	else {
		error = document.createElement('h2');
		error.textContent = "Oops, your browser doesn't support Canvas in HTML5.";
		
		wrapper = canvas.parentNode;
		wrapper.replaceChild(error, canvas);
	}
}

function drawBackground() {
	//black;
	//level elements
	//water;
	drawRoadBG(274, 236);
	drawLily(57);
	
	drawOverlays(); //Header and footer
}

function drawRoadBG(y, height) { }

function drawLily(y) { }

function drawOverlays() { }