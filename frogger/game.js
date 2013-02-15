function start_game() {
	canvas = document.getElementById('game');
	if (canvas.getContext) {
		ctx = canvas.getContext('2d');
		sprites = new Image();
		sprites.src = "assets/frogger_sprites.png";
		sprite_width = sprites.width;	//???
		
		//Globals
		level = 1;
		lives = 3;
		score = 0;
		highscore = 0;	//for now
		
		drawBackground();
		drawFrog(199, 515, 'up', 'sit');
		drawLog(100, 200, rand(1, 3))
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
	drawRoadBG(274, 530);
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
	ctx.drawImage(sprites, 0, 120, 399, 33, 0, y_start, 399, 33);	//upper road
	ctx.drawImage(sprites, 0, 120, 399, 33, 0, y_end - 33, 399, 33);	//lower road
	ctx.restore();
}
function drawLily(y) {
	ctx.drawImage(sprites, 0, 55, 399, 53, 0, y, 399, 53);
}
function drawOverlays() {
	ctx.drawImage(sprites, 14, 12, 323, 31, 14, 12, 323, 31);	//Frogger title
	ctx.save();
	ctx.fillStyle = 'black';
	ctx.fillRect(0, canvas.height - 35, canvas.width, 35);	//bottom bar
	ctx.fillStyle = 'LimeGreen';
	ctx.font = "bold 24px Helvetica";
	ctx.fillText('Level ' + level, 58, canvas.height - 15);
	ctx.font = "bold 12px Helvetica";
	ctx.fillText('Score: ' + score, 0, canvas.height - 2);
	ctx.fillText('Highscore: ' + highscore, 78, canvas.height - 2);
	for (var i = 0; i < lives; i++)		//draw lives as frogs
		ctx.drawImage(sprites, 13, 334, 17, 23, i * 19, canvas.height - 35, 17, 23);
	ctx.restore();
}

//direction: 'up'/'u', 'left'/'l', 'right'/'r', 'down'/'d'
//jump: 'jump' or 'sit'
//x and y are middle of frog
function drawFrog(x, y, direction, jump) {
	var jumping = false;
	var spriteX = 13;
	var spriteY = 369;
	var spriteWidth = 22;
	var spriteHeight = 17;
	if (jump == 'jump') jumping = true;
	if (direction == 'up' || direction == 'u') {
		if (jumping) {
			spriteX = 46;
			spriteY = 366;
			spriteWidth = 22;
			spriteHeight = 25;
		}
		else {
			spriteX = 13;
			spriteY = 369;
			spriteWidth = 22;
			spriteHeight = 17;
		}
	}
	else if (direction == 'down' || direction == 'd') {
		if (jumping) {
			spriteX = 114;
			spriteY = 366;
			spriteWidth = 21;
			spriteHeight = 25;
		}
		else {
			spriteX = 81;
			spriteY = 369;
			spriteWidth = 22;
			spriteHeight = 17;
		}
	}
	else if (direction == 'left' || direction == 'l') {
		if (jumping) {
			spriteX = 112;
			spriteY = 338;
			spriteWidth = 25;
			spriteHeight = 21;
		}
		else {
			spriteX = 83;
			spriteY = 335;
			spriteWidth = 17;
			spriteHeight = 23;
		}
	}
	else if (direction == 'right' || direction == 'r') {
		if (jumping) {
			spriteX = 43;
			spriteY = 335;
			spriteWidth = 25;
			spriteHeight = 22;
		}
		else {
			spriteX = 13;
			spriteY = 334;
			spriteWidth = 17;
			spriteHeight = 23;
		}
	}
	ctx.drawImage(sprites, spriteX, spriteY, spriteWidth, spriteHeight, x - spriteWidth/2, y- spriteHeight/2, spriteWidth, spriteHeight);
}
//length: 'short'/'s'/1, 'medium'/'m'/2, 'long'/'l'/3
function drawLog(x, y, length) {
	var spriteX;
	var spriteY;
	var spriteWidth;
	var spriteHeight;
	if (!length || length == 'short' || length == 's' || length == 1) {
		spriteX = 7;
		spriteY = 230;
		spriteWidth = 84;
		spriteHeight = 21;
	}
	else if (length == 'medium' || length == 'm' || length == 2) {
		spriteX = 7;
		spriteY = 198;
		spriteWidth = 116;
		spriteHeight = 21;
	}
	else if (length == 'long' || length == 'l' || length == 3) {
		spriteX = 7;
		spriteY = 166;
		spriteWidth = 177;
		spriteHeight = 21;
	}
	ctx.drawImage(sprites, spriteX, spriteY, spriteWidth, spriteHeight, x, y, spriteWidth, spriteHeight);	
}

function rand(start, end) { return Math.floor(Math.random()*(end-start+1)) + start; }