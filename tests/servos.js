var five = require('johnny-five');
var board = new five.Board({repl: false});

board.on("ready", function() {
	var vert2 = new five.Servo({pin: 10});
	var vert1 = new five.Servo({pin: 11});
	var horz4 = new five.Servo({pin: 9});
	var horz3 = new five.Servo({pin: 6});
	var horz2 = new	five.Servo({pin: 5});
	var horz1 = new	five.Servo({pin: 3});

	// var servos = new five.Servos([horz1, horz2, horz3, horz4, vert1, vert2]);
	var servos = new five.Servos([horz1, horz2, horz3, horz4, vert1, vert2]);

	servos.center();
	setInterval(function() {
		playServo(horz2, 500, 40);
		// playServoX(1, 500);
	}, 1500);

	setInterval(function() {
		playServo(horz1, 500, 30);
	}, 1000);

	setInterval(function() {
		playServo(horz3, 500, 30);
	}, 1000);

	setInterval(function() {
		playServo(horz4, 500, 90, false, -15);
	}, 1000);

	setInterval(function() {
		playServo(vert1, 500, 40);
	}, 1000);

	setInterval(function() {
		playServo(vert1, 500, 40);
	}, 1500);

	setInterval(function() {
		playServo(vert2, 500, 30, false, 35);
	}, 2000)

	setInterval(function() {
		playServo(vert2, 500, 30, false, 35);
	}, 2500);
})

function playServo(servo, time, angle, reversed, offset) {
	reversed = reversed || false;
	angle = angle || 30;
	offset = offset || 0;
	if (servo == undefined) {
		return;
	}
	if (reversed) {
		angle = -angle;
	} 

	servo.to(90+offset);
	setTimeout (function() {
		console.log("MOVE TO");
		servo.to(90+offset+angle);
	}, time/2);
	setTimeout (function() {
		console.log("MOVE BACK");
		servo.to(90+offset);
	}, time);
}