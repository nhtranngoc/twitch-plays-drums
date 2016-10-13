var five = require('johnny-five');
var board = new five.Board({repl: false});

board.on("ready", function() {
	var vert2 = new five.Servo({pin: 11});
	var vert1 = new five.Servo({pin: 10});
	var horz4 = new five.Servo({pin: 9});
	var horz3 = new five.Servo({pin: 6});
	var horz2 = new	five.Servo({pin: 5});
	var horz1 = new	five.Servo({pin: 3});

	// var servos = new five.Servos([horz1, horz2, horz3, horz4, vert1, vert2]);
	var servos = new five.Servos([horz1, horz2, horz4, vert1, vert2]);

	servos.center();
	setInterval(function() {
		playServo(vert1, 500);
	}, 1000)
})

function playServo(x, y) {
	if (x == undefined) {
		return;
	}

	x.to(90);
	setTimeout (function() {
		console.log("MOVE TO");
		x.to(120);
	}, y/2);
	setTimeout (function() {
		console.log("MOVE BACK");
		x.to(90);
	}, y);
}