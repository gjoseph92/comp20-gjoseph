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
function FinishLily() {
	GameObj.call(this);
	this.sprite = new SpriteSheetCoords(0, 0, 25, 25);	//coords just used to set dimensions, never drawn
}
FinishLily.prototype = Object.create(GameObj.prototype);
FinishLily.prototype.draw = function() { ctx.save(); ctx.fillStyle = 'green'; ctx.strokeStyle = 'yellow'; ctx.translate(this.x, this.y);
										 ctx.fillRect(-this.sprite.width/2, -this.sprite.height/2, this.sprite.width, this.sprite.height);
										 ctx.strokeRect(-this.sprite.width/2, -this.sprite.height/2, this.sprite.width, this.sprite.height)
										 ctx.restore(); }
function Log() {
	GameObj.call(this);
	this.sprites = {
		short : new SpriteSheetCoords(7, 230, 84, 21),
		med   : new SpriteSheetCoords(7, 198, 116, 21),
		long  : new SpriteSheetCoords(7, 166, 177, 21),
	};
	this.start_x = null;
	this.entered_game = false;
}
Log.prototype = Object.create(GameObj.prototype);
Log.prototype.update = wrapToStart;
function Car() {
	GameObj.call(this);
	this.sprites = {
		car			 : new SpriteSheetCoords(10, 267, 28, 20, LEFT),
		racecar		 : new SpriteSheetCoords(47, 265, 27, 24, RIGHT),
		yellow_racer : new SpriteSheetCoords(82, 264, 24, 26, LEFT),
		truck		 : new SpriteSheetCoords(106, 302, 46, 18, LEFT)
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
		jumping : new SpriteSheetCoords(43, 335, 25, 22, RIGHT),
		dead	: new SpriteSheetCoords(185, 192, 18, 24, UP)
	};
}
Frogger.prototype = Object.create(GameObj.prototype);
function Fly() {
	GameObj.call(this);
	this.sprite = new SpriteSheetCoords(144, 232, 25, 24, RIGHT);
}
Fly.prototype = Object.create(GameObj.prototype);

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
var highscore = 0;
function start_game() {
	console.log('starting');
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
			best_row = 510;
			gameOver = false;
			lockControls = false;
			
			drawBB = false; //for debugging
			collisions = true; //for debugging
			
			gameBB = new BoundingBox(0, 0, canvas.width, canvas.height);
			initLevelObjects();
			frogger = new Frogger();
			frogger.sprite = frogger.sprites.sitting;
			frogger.x = 197; frogger.y = 510;
			frogger.direction = UP;
			objects.push(frogger);
			
			$('body').keydown(keyDown);
			var music = $('#music_snd')[0];
			if (typeof music.loop == 'boolean') music.loop = true;
			else music.addEventListener('ended', function() { this.play(); }, false);		//TODO: loop callback!!
			music.play();
			$('#get_started_snd')[0].play();
			
			intervalID = setInterval(gameLoop, 35);
		}
	}
	else {
		error = document.createElement('h2');
		error.textContent = "Oops, your browser doesn't support Canvas in HTML5.";
		wrapper = canvas.parentNode;
		wrapper.replaceChild(error, canvas);
	}
}

//Creates arrays of all objects, obstacles, platforms, finish_pads, cars, and logs
function initLevelObjects() {
	cars = initCars();
	logs = initLogs();
	
	objects = cars.concat(logs);
	obstacles = cars;
	platforms = logs;

	waterArea = new BoundingBox(0, 105, canvas.width, 282);
	for (var i = 0; i < 6; i++)	{	//make peninsulas on lilypad into obstacles
		var obj = new GameObj();
		obj.sprite = new SpriteSheetCoords(0, 0, 47, 47);	//coords just used to set dimensions, never drawn
		obj.x = -17 + i*85;
		obj.y = 80;
		obstacles.push(obj);
	}
	finish_pads = [];
	for (var i = 0; i < 5; i++) {
		var lily = new FinishLily();
		lily.x = 27 + i*85; lily.y = 88;
		finish_pads.push(lily);
		objects.push(lily);
	}


}

function initCars() {
	var cars = [];
	
	for (var i = 0; i < 3; i++) {		//1st row: white racers
		var car_obst = new Car();
		car_obst.sprite = car_obst.sprites.racecar;
		car_obst.x = 20 + 180*i; car_obst.y = 335;
		car_obst.start_x = canvas.width + 30;
		car_obst.direction = LEFT;
		car_obst.v_x = -4;
		cars.push(car_obst);
	}
	
	for (var i = 0; i < 3; i++) {		//2nd row: purple cars
		var car = new Car();
		car.sprite = car.sprites.car;
		car.x = 300 - 120*i, car.y = 370;
		car.start_x = -20;
		car.direction = RIGHT;
		car.v_x = 1;
		cars.push(car);
	}
	
	for (var i = 0; i < 3; i++) {		//3rd row: yellow racers
		var car_obst = new Car();
		car_obst.sprite = car_obst.sprites.yellow_racer;
		car_obst.x = 30 + 50*i; car_obst.y = 405;
		car_obst.start_x = canvas.width + 30;
		car_obst.direction = LEFT;
		car_obst.v_x = -2.5;
		cars.push(car_obst);
	}
	
	for (var i = 0; i < 3; i++) {		//4th row: trucks
		var car_obst = new Car();
		car_obst.sprite = car_obst.sprites.truck;
		car_obst.x = 50 + (canvas.width/3)*i; car_obst.y = 440;
		car_obst.start_x = canvas.width + 50;
		car_obst.direction = LEFT;
		car_obst.v_x = -1;
		cars.push(car_obst);
	}
	
	for (var i = 0; i < 4; i++) {		//5th row: white racers
		var car_obst = new Car();
		car_obst.sprite = car_obst.sprites.racecar;
		car_obst.x = canvas.width/2 - (canvas.width/3)*i; car_obst.y = 475;
		car_obst.start_x = -40;
		car_obst.direction = RIGHT;
		car_obst.v_x = 2.5;
		cars.push(car_obst);
	}
	
	return cars;
}

function initLogs() {
	var logs = [];
	
	for (var i = 0; i < 3; i++) {		//1st row: med
		var log = new Log();
		log.sprite = log.sprites.med;
		log.x = 50 + (log.sprite.width+10)*i; log.y = 124;
		log.start_x = -60;
		log.v_x = 2;
		logs.push(log);
	}
	
	for (var i = 0; i < 3; i++) {		//2nd row: short
		var log = new Log();
		log.sprite = log.sprites.short;
		log.x = 50 + (canvas.width/3)*i; log.y = 159;
		log.start_x = -60;
		log.v_x = 4;
		logs.push(log);
	}
	
	for (var i = 0; i < 2; i++) {		//3rd row: long
		var log = new Log();
		log.sprite = log.sprites.long;
		log.x = 300*i; log.y = 194;
		log.start_x = -100;
		log.v_x = 2.5;
		logs.push(log);
	}
	
	for (var i = 0; i < 4; i++) {		//4th row: med
		var log = new Log();
		log.sprite = log.sprites.med;
		log.x = 0 + (log.sprite.width+15)*i; log.y = 229;
		log.start_x = -120;
		log.v_x = 3.5;
		logs.push(log);
	}
	
	for (var i = 0; i < 3; i++) {		//5th row: short
		var log = new Log();
		log.sprite = log.sprites.short;
		log.x = -50 + (canvas.width/2)*i; log.y = 264;
		log.start_x = -100;
		log.v_x = 1;
		logs.push(log);
	}
	
	return logs;
}

/////////////// GAME LOOP ///
function gameLoop() {
	update();
	draw();
}

function update() {
	for (var i = 0; i < objects.length; i++)
		objects[i].update();
	
	if (gameOver || lockControls) return;
	var froggerBB = frogger.boundingBox();
	if (!inGame(froggerBB)) die();
	//Sit frogger on platforms
	var on_platform = false;
	for (var j = 0; j < platforms.length; j++) {
		if (platforms[j].boundingBox().checkCollision( froggerBB )) {
			frogger.v_x = platforms[j].v_x;
			frogger.v_y = platforms[j].v_y;
			on_platform = true;
		}
	}
	
	if (!on_platform) {
		frogger.v_x = 0;
		frogger.v_y = 0;
		if (collisions && froggerBB.checkCollision(waterArea)) {
			die();
			return;
		}
	}
	
	//Check collisions
	if (collisions) {
		for (var j = 0; j < obstacles.length; j++) {
			if (obstacles[j].boundingBox().checkCollision( froggerBB )) {
				die();
				return;
			}
		}
	}
	
	//Check for win
	for (var i = 0; i < finish_pads.length; i++) {
		if (finish_pads[i].boundingBox().checkCollision( froggerBB ))
			win();
			return;
	}
}

function draw() {
	drawBackground();
	for (var i = 0; i < objects.length; i++) {
		objects[i].draw();
		if (drawBB) objects[i].boundingBox().draw();
	}
	
	if (drawBB) {
		for (var i = 0; i < finish_pads.length; i++)
			finish_pads[i].boundingBox().draw();
		for (var i = 0; i < obstacles.length; i++)
			obstacles[i].boundingBox().draw();
		waterArea.draw();
	}
	if (gameOver) drawGameOver();
}

function die() {
	console.log('died');
	frogger.direction = UP;
	frogger.sprite = frogger.sprites.dead;
	lives--;
	$('#death_snd')[0].play();
	lockControls = true;
	setTimeout(function() {
		frogger.sprite = frogger.sprites.sitting;
		frogger.x = 197; frogger.y = 510;
		frogger.direction = UP;
		lockControls = false;
		if (lives < 0) {
			gameOver = true;
			lockControls = true;
			$('canvas').one('click', function() {
				console.log('clicked');
				$('body').off('keydown');
				if (score > highscore) highscore = score;
				clearInterval(intervalID);
				start_game();
			} );
		}
	}, 1000);
}

function win() {
	frogger.sprite = frogger.sprites.sitting;
	frogger.x = 197; frogger.y = 510;
	frogger.direction = UP;
	score += 50;
	level++;
	if (((level-1) % 5) == 0) score += 1000;
	$('#on_your_marks_snd')[0].play();
}
function drawGameOver() {
	ctx.save();

	ctx.fillStyle = "rgba(0, 0, 0, 0.6)";		//TODO: rgba? how?
	ctx.fillRect(0, 0, canvas.width, canvas.height);

	ctx.fillStyle = 'white';
	ctx.fillRect(0, canvas.height/2 - 60, canvas.width, 110);
	
	ctx.fillStyle = 'black';
	ctx.font = '48pt Helvetica';
	ctx.textAlign = 'center';
	ctx.fillText('Game Over!', canvas.width/2, canvas.height/2);
	ctx.font = '18pt Helvetica';
	ctx.fillText('Click anywhere to play again', canvas.width/2, canvas.height/2+35);
	
	ctx.restore();
}

/////////////// USER INPUT HANDLING ///
function keyDown(event) {
	console.log(event.keyCode);	//!!!:
	if (lockControls) return;
	switch(event.keyCode) {
		case 38: 	//up
			frogger.y -= 35;
			frogger.direction = UP;
			if (frogger.y < best_row) {
				best_row = frogger.y;
				score += 10;
			}
			event.preventDefault();
			playJumpSound();
			break;
		case 40:	//down
			frogger.y += 35;
			frogger.direction = DOWN;
			event.preventDefault();
			playJumpSound();
			break;
		case 37:	//left
			frogger.x -= 21;
			frogger.direction = LEFT;
			event.preventDefault();
			playJumpSound();
			break;
		case 39:	//right
			frogger.x += 21;
			frogger.direction = RIGHT;
			event.preventDefault();
			playJumpSound();
			break;
		case 66:	//'b'	-- show bounding boxes
			drawBB = !drawBB;
			break;
		case 67:	//'c'	-- disable collisions
			collisions = !collisions;
			console.log(collisions);
			break;
	}
}

/////////////// DRAW FUNCTIONS ///
function drawBackground() {
	ctx.fillStyle = 'black';
	ctx.fillRect(0, 0, canvas.width, canvas.height);
	
	//Level elements
	drawWater(0, 282);
	drawRoadBG(282, 530);
	drawLily(53);
	
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

//Alternate playing the 2 copies of the jump sound to allowing overlapping sound effects
function playJumpSound() {
	var jump_sound1 = $('#jump_snd1')[0];
	var jump_sound2 = $('#jump_snd2')[0];
	if (jump_sound1.currentTime > 0 && jump_sound1.currentTime < jump_sound1.duration) {
		jump_sound2.play()
	}
	else
		jump_sound1.play();
}