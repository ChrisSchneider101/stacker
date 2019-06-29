Game = function() {
	this.div = document.createElement("div");
	this.div.style.backgroundColor = "rgb(50,50,80)";
	//this.div.style.display = "inline-block";
	this.div.style.position = "absolute";
	//this.div.style.border = "solid black 10px";
	this.div.style.bottom = 0;
	
	this.container = document.getElementById("game");
	
	this.canvas = document.createElement("canvas");
	this.ctx = this.canvas.getContext("2d");
	this.div.appendChild(this.canvas);
	//this.canvas.style.border = "3px solid white";
	
	this.block_size = 64;
	//this.
	
	this.height;
	this.width;
	this.height_blocks;
	this.width_blocks;
	
	this.drop_left;
	this.drop_length;
	this.drop_height;
	this.safe_left;
	this.safe_length;
	
	this.score;
	this.ready_to_stop;
	this.ready_to_reset;
	this.move_ms;
	this.move_interval;
	
	this.setHeight = function(blocks) {
		var old_height = this.height;
		
		// set numeric and div height
		this.height = blocks * this.block_size;
		this.height_blocks = blocks;
		this.div.style.height = blocks * this.block_size;
		var con_offset = this.height - (15 * this.block_size);
		//console.log(con_offset);
		if (con_offset > 0) this.container.style.top = con_offset;
		
		// make a temp canvas of new size, copy old canvas image to it, push image accordingly
		var copy_canvas = document.createElement("canvas");
		var copy_ctx = copy_canvas.getContext("2d");
		var offset = (blocks * this.block_size) - old_height;
		copy_canvas.height = blocks * this.block_size;
		copy_canvas.width = 2000;//this.width;
		copy_ctx.drawImage(this.canvas, 0, offset);
		
		// resize main canvase, copy image from temp canvas back to main canvas
		this.canvas.height = blocks * this.block_size;
		this.ctx.drawImage(copy_canvas, 0, 0);
	}
	
	this.setWidth = function(blocks) {
		this.width = blocks * this.block_size;
		this.width_blocks = blocks;
		this.div.style.width = blocks * this.block_size;
		this.canvas.width = blocks * this.block_size;
		document.getElementById("game").style.width = blocks * this.block_size;
	}
	
	this.getPixHeight = function(game_y) {
		return this.height - ((game_y + 1) * this.block_size);
	}
	
	this.getPixWidth = function(game_x) {
		return game_x * this.block_size;
	}
	
	this.drawBlock = function(x, y) {
		this.ctx.fillStyle = "white";
		var pix_x = this.getPixWidth(x);
		var pix_y = this.getPixHeight(y);
		this.ctx.fillRect(pix_x, pix_y, this.block_size, this.block_size);
	}
	
	this.drawLine = function(x, y, length) {
		for (let i = x; i < x + length; i++)
			this.drawBlock(i, y);
	}
	
	this.clearBlock = function(x, y) {
		var pix_x = this.getPixWidth(x);
		var pix_y = this.getPixHeight(y);
		this.ctx.clearRect(pix_x, pix_y, this.block_size, this.block_size);
	}
	
	this.clearRow = function(y) {
		var pix_y = this.getPixHeight(y);
		this.ctx.clearRect(0, pix_y, this.width, this.block_size);
	}
	
	this.blinkClearBlock = function(x, y) {
		var show = true;
		var blinks_remaining = 6;
		var bx = x;
		var by = y;
		
		function callback() { clearInterval(blink_interval); }
		
		var blink_interval = setInterval(function() {
			//console.log(x + ' ' + y);
			if (show) {
				this.drawBlock(bx, by);
				show = false;
			}
			else {
				this.clearBlock(bx, by);
				show = true;
			}
			blinks_remaining--;
			if (blinks_remaining == 0) callback();
		}.bind(this), 100);
	}
	
	this.startMove = function() {
		this.ready_to_stop = false;
		
		var max_left = this.width_blocks - this.drop_length;
		
		//this.drop_left = 1;
		this.drop_left = Math.floor(Math.random() * (max_left + 1));
		//this.move_right = false;
		var right = Math.floor(Math.random() * 2);
		if (right == 0) this.move_right = false;
		else this.move_right = true;
		
		
		this.move_interval = setInterval(function() {
			if (this.move_right) {
				if (this.drop_left + this.drop_length == this.width_blocks) {
					this.move_right = false;
					this.drop_left--;
					this.clearRow(this.drop_height);
					this.drawLine(this.drop_left, this.drop_height, this.drop_length);
				}
				else {
					this.drop_left++;
					this.clearRow(this.drop_height);
					this.drawLine(this.drop_left, this.drop_height, this.drop_length);
				}
			}
			else {
				if (this.drop_left == 0) {
					this.move_right = true;
					this.drop_left++;
					this.clearRow(this.drop_height);
					this.drawLine(this.drop_left, this.drop_height, this.drop_length);
				}
				else {
					this.drop_left--;
					this.clearRow(this.drop_height);
					this.drawLine(this.drop_left, this.drop_height, this.drop_length);
				}
			}
			this.ready_to_stop = true;
		}.bind(this), this.move_ms);
	}
	
	this.stopMove = function() {
		this.ready_to_stop = false;
		clearInterval(this.move_interval);
	}
	
	this.increaseHeight = function() {
		this.drop_height++;
		
		if (this.drop_height > 8) {
			this.setHeight(this.height_blocks + 1);
			window.scrollY = parseInt(window.scrollY) + this.block_size;
		}
		//console.log(this.height);
		//console.log(this.div.style.height);
		//console.log(this.canvas.height);
	}
	
	this.increaseSpeed = function() {
		this.move_ms = this.move_ms * .9;
	}
	
	this.increaseScore = function() {
		this.score++;
		document.getElementById("score").innerHTML = this.score;
	}
	
	this.dropBlocks = function() {
		var old_left = this.drop_left;
		var old_length = this.drop_length;
		
		var new_left = this.drop_left;
		var new_length = 0;
		
		for (let i = this.drop_left + this.drop_length - 1; i >= this.drop_left; i--) {
			if (i >= this.safe_left && i < this.safe_left + this.safe_length) {
				new_left = i;
				new_length++;
				//console.log("safes");
			}
			else this.blinkClearBlock(i, this.drop_height);
		}
		
		this.safe_left = new_left;
		this.safe_length = new_length;
		this.drop_length = new_length;
		
		if (new_length > 0) {
			this.increaseHeight();
			this.increaseScore();
			this.increaseSpeed();
			this.startMove();
		}
		else {
			//console.log("game end");
			this.ready_to_reset = true;
			//console.log(this.ready_to_stop);
		}
		
		//console.log(this.safe_left);
		//console.log(this.safe_length);
	}
	
	this.tap = function() {
		if (this.ready_to_stop) {
			this.stopMove();
			this.dropBlocks();
			//this.startMove();
			//console.log("tap");
		}
		else if (this.ready_to_reset) {
			//console.log("hit");
			this.resetGame();
		}
	}
	document.body.addEventListener("mousedown", this.tap.bind(this));
	
	this.resetGame = function() {
		this.ready_to_stop = false;
		this.ready_to_reset = false;
		this.score = 0;
		document.getElementById("score").innerHTML = 0;
		this.height = 15 * this.block_size;	//setWidth depends on this being already set
		this.width = 7 * this.block_size;	//setHeight depends on this being already set
		this.setHeight(15);
		this.setWidth(7);
		this.drop_height = 0;
		this.drop_length = 3;
		this.safe_left = 0;
		this.safe_length = this.width_blocks
		this.move_ms = 1000;
		
		this.startMove();
	}
	
	this.resetGame();
	
	return this;
}

var game = new Game();
document.getElementById("game").appendChild(game.div);