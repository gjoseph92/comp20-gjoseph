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
function BoundingBox(ul_x, ul_y, lr_x, lr_y) {
	this.ul_x = ul_x;
	this.ul_y = ul_y;
	this.lr_x = lr_x;
	this.lr_y = lr_y;
}
BoundingBox.prototype.checkCollision = function(otherBoundingBox) {
	if (this.lr_x < otherBoundingBox.ul_x) return false;
	if (this.ul_x > otherBoundingBox.lr_x) return false;
	if (this.lr_y < otherBoundingBox.ul_y) return false;
	if (this.ul_y > otherBoundingBox.lr_y) return false;
	return true;
}
BoundingBox.prototype.draw = function() {	//for debugging collisions
	ctx.save();
	ctx.strokeStyle = 'orange';
	ctx.strokeRect(this.ul_x, this.ul_y, this.lr_x - this.ul_x, this.lr_y - this.ul_y);
	ctx.restore();
}

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
	this.v_x = 0;
	this.v_y = 0;
	this.direction = RIGHT;
	this.sprite = null;
	this.sprites = {};
}
GameObj.prototype.update = function() {}
GameObj.prototype.draw = function() {
	this.x += this.v_x;
	this.y += this.v_y;
	ctx.save();
	ctx.translate(this.x, this.y);
	ctx.rotate(this.direction - this.sprite.angle);
	ctx.drawImage(spriteSheet, this.sprite.x, this.sprite.y, this.sprite.width, this.sprite.height,
				  -this.sprite.width/2, -this.sprite.height/2, this.sprite.width, this.sprite.height);
	ctx.restore();
}
GameObj.prototype.boundingBox = function() {	//KNOWN ERROR: bounding boxes do not account for object direction!
	var half_w = this.sprite.width / 2;
	var half_h = this.sprite.height / 2;
	var x = this.x;
	var y = this.y;
	return new BoundingBox(x - half_w, y - half_h, x + half_w, y + half_h);
}

/////////////// SPECIFIC TYPES AND CLASSES ///
function LilyMat() {											//TODO: lily object probably won't be used
	GameObj.call(this);
	this.sprite = new SpriteSheetCoords(0, 55, 399, 53);
	this.x = canvas.width/2;
}
LilyMat.prototype = Object.create(GameObj.prototype);
function Log() {
	GameObj.call(this);
	this.sprites = {
		short : new SpriteSheetCoords(7, 230, 84, 21),
		med : new SpriteSheetCoords(7, 198, 116, 21),
		long : new SpriteSheetCoords(7, 166, 177, 21),
	};
	this.start_x = null;
	this.entered_game = false;
}
Log.prototype = Object.create(GameObj.prototype);
Log.prototype.update = wrapToStart;
function Car() {
	GameObj.call(this);
	this.sprites = {
		car : new SpriteSheetCoords(10, 267, 28, 20, LEFT),
		racecar : new SpriteSheetCoords(47, 265, 27, 24, RIGHT),
		yellow_racer : new SpriteSheetCoords(82, 264, 24, 26, RIGHT),
		truck : new SpriteSheetCoords(106, 302, 46, 18, LEFT)
	};
	this.start_x = null;
	this.entered_game = false;
}
Car.prototype = Object.create(GameObj.prototype);
Car.prototype.update = wrapToStart;
function Frogger() {
	GameObj.call(this);
	this.sprites = {
		sitting : new SpriteSheetCoords(13, 334, 17, 23, RIGHT),
		jumping : new SpriteSheetCoords(43, 335, 25, 22, RIGHT)
	};
}
Frogger.prototype = Object.create(GameObj.prototype);

//Call this in an objet's update() to return to starting point
//after it goes offscreen (to create constantly looping objects)
//Expects start_x and entered_game to be set
function wrapToStart() {
	if (!inGame(this.boundingBox())) {	
		if (this.entered_game) {
			this.x = this.start_x;
			this.entered_game = false;
		}
	} else
		this.entered_game = true;
}

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
			
			//Globals
			level = 1;
			lives = 3;
			score = 0;
			highscore = 0;	//for now
			
			gameBB = new BoundingBox(0, 0, canvas.width, canvas.height);
			objects = initLevelObjects();
			var frogger = new Frogger();
			frogger.sprite = frogger.sprites.sitting;
			frogger.x = 199; frogger.y = 515;
			frogger.direction = UP;
			objects.push(frogger);
			
			var intervalID = setInterval(gameLoop, 35);
		}
	}
	else {
		error = document.createElement('h2');
		error.textContent = "Oops, your browser doesn't support Canvas in HTML5.";
		wrapper = canvas.parentNode;
		wrapper.replaceChild(error, canvas);
	}
}

function initLevelObjects() {
	var objects = [];
	var obstacles = [];
	
	var car = new Car();
	car.sprite = car.sprites.car;
	car.x = -20, car.y = 400;
	car.start_x = -20;
	car.direction = RIGHT;
	car.v_x = 5;
	objects.push(car);
	obstacles.push(car);
	
	var truck = new Car();
	truck.sprite = truck.sprites.truck;
	truck.x = 250; truck.y = 300;
	truck.start_x = canvas.width + 30;
	truck.direction = LEFT;
	truck.v_x = -4;
	objects.push(truck);
	obstacles.push(truck);
	
	var log = new Log();
	log.sprite = log.sprites.med;
	log.x = canvas.width+150; log.y = 200;
	log.start_x = canvas.width+150;
	log.v_x = -2;
	objects.push(log);
	obstacles.push(log);
	
	return objects;
}

/////////////// GAME LOOP ///
function update() {
	for (var i = 0; i < objects.length; i++) {
		objects[i].update();
		for (var j = 0; j < objects.length; j++) {
			if (j != i && objects[i].boundingBox().checkCollision( objects[j].boundingBox() )) {
				objects[i].v_x = 0;
				objects[i].v_y = 0;
				objects[j].v_x = 0;
				objects[j].v_y = 0;
			}
		}
	}
}

function draw() {
	drawBackground();
	for (var i = 0; i < objects.length; i++) {
		objects[i].draw();
		objects[i].boundingBox().draw();
	}
}

function gameLoop() {
	update();
	draw();
}

/////////////// DRAW FUNCTIONS ///
function drawBackground() {
	ctx.fillStyle = 'black';
	ctx.fillRect(0, 0, canvas.width, canvas.height);
	
	//Level elements
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

/////////////// UTILITY FUNCTIONS ///
function rand(start, end) { return Math.floor(Math.random()*(end-start+1)) + start; }

function inGame(boundingBox) { return boundingBox.checkCollision(gameBB); }