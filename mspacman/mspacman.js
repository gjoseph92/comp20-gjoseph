function drawPacman() {
	canvas = document.getElementById('pacman');
	if (canvas.getContext) {
		ctx = canvas.getContext('2d');
		board = new Image();
		board.src = 'pacman10-hp-sprite.png';
		
		ctx.drawImage(board, 321, 2, 465, 136, 0, 0, 465, 136);	//background

	}
	else {
		error = document.createElement('h2');
		error.textContent = "Oops, your browser doesn't support Canvas in HTML5.";
		
		wrapper = canvas.parentNode;
		wrapper.replaceChild(error, canvas);
	}
}