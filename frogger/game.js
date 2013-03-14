////////////////
// Gabe Joseph
// 2012
//
// Convention: all coordinates are by an object's center, NOT upper-left corner

var UP = -Math.PI/2;
var DOWN = Math.PI/2;
var LEFT = Math.PI;
var RIGHT = 0;

/////////////// ABSTRACT TYPES AND CLASSES ///
function BoundingBox(ul, ur, ll, lr) {
	this.ul = ul;
	this.ur = ur;
	this.ll = ll;
	this.lr = lr;
}
BoundingBox.prototype.checkCollision = function(otherBoundingBox) {}

function SpriteSheetCoords(x, y, width, height, angle) {
	this.x = x;
	this.y = y;
	this.width = width;
	this.height = height;
	this.angle = (arguments.length == 5) ? angle : RIGHT;
}

function GameObj() {
	this.x = 0;
	this.y = 0;
	this.direction = RIGHT;
	this.sprite = null;
	this.sprites = {};
}
GameObj.prototype.update = function() {}
GameObj.prototype.draw = function() {
	ctx.save();
	ctx.translate(this.x, this.y);
	ctx.rotate(this.direction - this.sprite.angle);
	ctx.drawImage(spriteSheet, this.sprite.x, this.sprite.y, this.sprite.width, this.sprite.height,
				  -this.sprite.width/2, -this.sprite.height/2, this.sprite.width, this.sprite.height);
	ctx.restore();
}
GameObj.prototype.boundingBox = function() {}

/////////////// SPECIFIC TYPES AND CLASSES ///
function LilyMat() {
	GameObj.call(this);
	this.sprite = new SpriteSheetCoords(0, 55, 399, 53);
	this.x = canvas.width/2;
}
LilyMat.prototype = Object.create(GameObj.prototype);

/////////////// GAME INITIALIZATION ///
var canvas;
var ctx; //the Canvas context
var spriteSheet; //Image object of the sprite sheet
function start_game() {
	canvas = document.getElementById('game');
	if (canvas.getContext) {
		ctx = canvas.getContext('2d');
		spriteSheet = new Image();
		spriteSheet.src = "assets/frogger_sprites.png";
		spriteSheet.onload = function() {
			sprite_width = spriteSheet.width;	//
			
			//Globals
			level = 1;
			lives = 3;
			score = 0;
			highscore = 0;	//for now
			
			drawBackground();
			drawFrog(199, 515, 'up', 'sit');
			drawLog(100, 200, rand(1, 3));
			drawCar(40, 400, rand(1,4), rand(1,4));
			drawCar(250, 450, rand(1,4), rand(1,4));
	}
	}
	else {
		error = document.createElement('h2');
		error.textContent = "Oops, your browser doesn't support Canvas in HTML5.";
		wrapper = canvas.parentNode;
		wrapper.replaceChild(error, canvas);
	}
}

/////////////// DRAW FUNCTIONS ///	(TODO: objectify)
function drawBackground() {
	ctx.fillStyle = 'black';
	ctx.fillRect(0, 0, canvas.width, canvas.height);
	
	//Level elements
	drawWater(0, 274);
	drawRoadBG(274, 530);
	//drawLily(57);
	var lily = new LilyMat();
	lily.y = 57 + lily.sprite.height/2;
	lily.draw();
	
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
	ctx.drawImage(spriteSheet, 0, 120, 399, 33, 0, y_start, 399, 33);	//upper road
	ctx.drawImage(spriteSheet, 0, 120, 399, 33, 0, y_end - 33, 399, 33);	//lower road
	ctx.restore();
}
function drawLily(y) {
	ctx.drawImage(spriteSheet, 0, 55, 399, 53, 0, y, 399, 53);
}

//Draw Frogger title and game info footer
function drawOverlays() {
	ctx.drawImage(spriteSheet, 14, 12, 323, 31, 14, 12, 323, 31);	//Frogger title
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
		ctx.drawImage(spriteSheet, 13, 334, 17, 23, i * 19, canvas.height - 35, 17, 23);
	ctx.restore();
}

//direction: 'up'/'u'/1, 'left'/'l'/2, 'right'/'r'/3, 'down'/'d'/4
//jump: 'jump' or 'sit'
//x and y are middle of frog
function drawFrog(x, y, direction, jump) {
	var jumping = false;
	var spriteX = 13;
	var spriteY = 369;
	var spriteWidth = 22;
	var spriteHeight = 17;
	if (jump == 'jump') jumping = true;
	if (direction == 'up' || direction == 'u' || direction == 1) {
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
	else if (direction == 'down' || direction == 'd' || direction == 4) {
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
	else if (direction == 'left' || direction == 'l' || direction == 2) {
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
	else if (direction == 'right' || direction == 'r' || direction == 3) {
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
	ctx.drawImage(spriteSheet, spriteX, spriteY, spriteWidth, spriteHeight, x - spriteWidth/2, y- spriteHeight/2, spriteWidth, spriteHeight);
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
	ctx.drawImage(spriteSheet, spriteX, spriteY, spriteWidth, spriteHeight, x, y, spriteWidth, spriteHeight);	
}

//type: 'car'/1, 'racecar'/2, 'yellow_racer'/3, 'truck'/4
//direction: 'up'/'u'/1, 'left'/'l'/2, 'right'/'r'/3, 'down'/'d'/4
//x and y are middle of car
function drawCar(x, y, type, direction) {
	var spriteX;
	var spriteY;
	var spriteWidth;
	var spriteHeight;
	var spriteAngle;
	var drawAngle;
	if (!type || type == 'car' ||  type == 1) {
		spriteX = 10;
		spriteY = 267;
		spriteWidth = 28;
		spriteHeight = 20;
		spriteAngle = Math.PI;
	}
	else if (type == 'racecar' ||  type == 2) {
		spriteX = 47;
		spriteY = 265;
		spriteWidth = 27;
		spriteHeight = 24;
		spriteAngle = 0;
	}
	else if (type == 'yellow_racer' ||  type == 3) {
		spriteX = 82;
		spriteY = 264;
		spriteWidth = 24;
		spriteHeight = 26;
		spriteAngle = Math.PI;
	}
	else if (type == 'truck' ||  type == 4) {
		spriteX = 106;
		spriteY = 302;
		spriteWidth = 46;
		spriteHeight = 18;
		spriteAngle = Math.PI;
	}
	if (!direction || direction == 'up' || direction == 'u' || direction == 1)
		drawAngle = -Math.PI/2;
	else if (!direction || direction == 'left' || direction == 'l' || direction == 2)
		drawAngle = -Math.PI;
	else if (!direction || direction == 'right' || direction == 'r' || direction == 3)
		drawAngle = 0;
	else if (!direction || direction == 'down' || direction == 'd' || direction == 4)
		drawAngle = Math.PI/2;
	
	ctx.save();
	ctx.translate(x, y);
	ctx.rotate(drawAngle - spriteAngle);
	ctx.drawImage(spriteSheet, spriteX, spriteY, spriteWidth, spriteHeight, -spriteWidth/2, -spriteHeight/2, spriteWidth, spriteHeight);
	ctx.restore();	
}

/////////////// UTILITY FUNCTIONS ///
function rand(start, end) { return Math.floor(Math.random()*(end-start+1)) + start; }