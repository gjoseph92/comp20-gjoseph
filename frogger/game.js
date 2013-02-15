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
	//black
	ctx.fillStyle = 'black';
	ctx.fillRect(0, 0, canvas.width, canvas.height);
	
	//level elements
	drawWater(0, 274);
	drawRoadBG(274, 510);
	drawLily(57);
	
	drawOverlays(); //Header and footer
}

function drawWater(y_start, y_end) {
	ctx.save();
	ctx.fillStyle = 'MidnightBlue';
	ctx.fillRect(0, y_start, canvas.width, y_end - y_start);
	ctx.restore();
}

function drawRoadBG(y_start, y_end) {
	ctx.save();
	ctx.fillStyle = 'black';
	ctx.fillRect(0, y_start, canvas.width, y_end - y_start);
	ctx.drawImage(sprites, 0, 120, 399, 33, 0, y_start, 399, 33);
	ctx.drawImage(sprites, 0, 120, 399, 33, 0, y_end - 33, 399, 33);
	ctx.restore();
}

function drawLily(y) { }

function drawOverlays() { }