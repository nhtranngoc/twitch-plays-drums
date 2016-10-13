'use strict'
var tmi = require("tmi.js");
// var midi = require('midi');

var emotes = require("./data/emotes.json");

var five = require('johnny-five');
var board = new five.Board({repl: false});

// Set up a new output.
// Change this to whatever MIDI synthesizer you use. YMMV
// var output = new midi.output();
// output.openPort(1);
// var midiHelper = require("./midiHelper")(output);

// Default channel
var options = require("./data/config.json");
options.channels = ["#twitchplaysdrums"];
var mainClient = new tmi.client(options);
mainClient.connect();

//Misc
var chatCount = 0;
var bpm = 60;
var servo1, servo2;
var channelList = new Set();
var horz1, horz2, horz3, horz4, vert1, vert2;
var intervalObject = {};

//Flags
var monitorFlag;

// midiHelper.setInstrument("acoustic_grand_piano", 1);
// midiHelper.setInstrument("violin", 2);

board.on("ready", function() {
	vert2 = new five.Servo({pin: 11});
	vert1 = new five.Servo({pin: 10});
	horz4 = new five.Servo({pin: 9});
	horz3 = new five.Servo({pin: 6});
	horz2 = new	five.Servo({pin: 5});
	horz1 = new	five.Servo({pin: 3});

	// var servos = new five.Servos([horz1, horz2, horz3, horz4, vert1, vert2]);
	var servos = new five.Servos([horz1, horz2, horz4, vert1, vert2]);

	mainClient.on("chat", function(channel, user, message, self) {
		if (user.username == 'twitchplaysdrums'){
			// Ignore all self messages to avoid recursion.
			return;
		} else if (message.match(/^!/gi)) {
			// Argument vector
			var argv = message.split(" ");
			var command = argv[0].substring(1);
			console.log("COMMAND: " + command);

			switch(command) {
				case "help":
				var helpStr = "List of available commands: \n\n" +
				"!startMonitor [channel_name]: Change the monitoring channel to channel_name. Defaults to twitchplaysdrums";
				mainClient.say(options.channels[0], helpStr);
				break;

				case "startMonitor":
				if (argv[1] == "twitchplaysdrums" || argv[1] == null) {
					mainClient.say(options.channels[0], "Started monitoring.");
					monitorFlag = true;
					channelList.add("twitchplaysdrums");
					break;
				} else {
					mainClient.join(argv[1])
					.then(function(data) {
						console.log("Joined channel " + argv[1]);
						mainClient.say(options.channels[0], "Successfully joined channel " + argv[1]);
						monitorFlag = true;
						channelList.add(argv[1]);
					})
					.catch(function(err) {
						console.log(err);
						mainClient.say(options.channels[0], "Cannot join channel " + argv[1] + ". Channel may not exist or is not currently available.");
					});
					break;
				}

				case "stopMonitor":
				if (argv[1] == "twitchplaysdrums" || argv[1] == null) {
					// mainClient.say(options.channels[0], "I'm sorry Dave, I'm afraid I can't do that.");
					mainClient.say(options.channels[0], "Stopped monitoring.");
					channelList.delete("twitchplaysdrums");
					monitorFlag = false;
					break;
				} else {
					mainClient.part(argv[1])
					.then(function(data) {
						console.log("Left channel " + argv[1]);
						mainClient.say(options.channels[0], "Successfully disconnected from channel " + argv[1]);
						monitorFlag = false;
						channelList.delete(argv[1]);
					})
					.catch(function(err) {
						console.log(err);
						mainClient.say(options.channels[0], "Problem leaving channel " + argv[1] + ". Please check your channel and try again.");
					})
				}
				break;

				case "listMonitor":
				mainClient.say(options.channels[0], [...channelList].join(", "));
				break;

				// Servo [0 to 5], repeat every x milliseconds
				case "addInterval":
				var intervalName  = argv[1]
				var intervalIndex = argv[2];
				var intervalDelay = argv[3];
				break;
			}
		} else if (monitorFlag) {
			chatCount++;
			var emote = parseEmote(message);
			if (emote) {
				// Percussion value from 0 to 127;
				var percussion = parseInt(emote.charCodeAt(0).map(48,122,0,1));
				if (percussion) {
					playServoX(4, 500);
				} else {
					playServoX(5, 500);
				}
			}

			var note = parseInt(message.charCodeAt(0).map(48,122,0,3));
			switch(note) {
				case 0:
				playServoX(0, 300);
				break;

				case 1:
				playServoX(1, 300);
				break;

				case 2:
				playServoX(2, 300);
				break;

				default:
				playServoX(3, 300);
				break;
			}
		}
	});	
})

// Beats count over x seconds
// var duration = 5;
// var beats = setInterval(function() {
// 	bpm = chatCount*60/duration;
// 	console.log("BEATS PER MINUTES: " + bpm);
// 	chatCount = 0;
// }, duration*1000);

//Copied this from StackOverflow cause I'm lazy.
Number.prototype.map = function (in_min, in_max, out_min, out_max) {
	return (this - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
}

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

// Messy code currently written at 3:17 AM. I honestly do not care at this point.
function playServoX(index, time) {
	if (horz1 == undefined ||
		horz2 == undefined ||
		horz3 == undefined ||
		horz4 == undefined ||
		vert1 == undefined ||
		vert2 == undefined) {
		return;
	}
	switch(index) {
		case 0:
		playServo(horz1, time, 30);
		break;

		case 1:
		playServo(horz2, time, 40);
		break;

		case 2:
		playServo(horz3, 500, 30);
		break;

		case 3:
		playServo(horz4, 500, 90, false, -15);
		break;

		case 4:
		playServo(vert1, 500, 40);
		break;

		case 5:
		playServo(vert2, 500, 30, false, 35);
		break;
	}
}


function parseEmote(text) {
	var parseFlag = false;
	var splitText = text.split('');
	for (var i in emotes.emotes) {
		var re = new RegExp(i,"gi");
		if (text.match(re)) {
			console.log("Matched: " + i);
			parseFlag = i;
			return parseFlag; // Return upon matching first one
		}
	}
	return parseFlag;
}

// Returns note length based on chat message length and beats per minute
function getLength(text) {
	// console.log(parseInt(text.length/10*(15/bpm)*1000));
	return parseInt(text.length/10*(15/bpm)*1000);
}

// function exitHandler() {
// 	console.log("Exiting...");
// 	allNotesOff();
// 	output.closePort();
// 	process.exit();
// }

// // catches close event
// process.on('exit', exitHandler);

// //catches ctrl+c event
// process.on('SIGINT', exitHandler);