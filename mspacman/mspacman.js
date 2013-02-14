function drawPacman() {
	canvas = document.getElementById('pacman');
	if (canvas.getContext) {
		ctx = canvas.getContext('2d');
		board = new Image();
		board.src = 'pacman10-hp-sprite.png';
		
		ctx.drawImage(board, 321, 2, 465, 136, 0, 0, 465, 136);	//background
		ctx.drawImage(board, 121, 2, 18, 18, 270, 114, 18, 18);	//ms. pac-man
		ctx.drawImage(board, 63, 83, 15, 15, 283, 55, 15, 15);	//ghost
	}
	else {
		error = document.createElement('h2');
		error.textContent = "Oops, your browser doesn't support Canvas in HTML5.";
		
		wrapper = canvas.parentNode;
		wrapper.replaceChild(error, canvas);
	}
}