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
var servo1, servo2;
var channelList = new Set();
var horz1, horz2, horz3, horz4, vert1, vert2;
var intervalObject = {};

//Flags
var monitorFlag;

// midiHelper.setInstrument("acoustic_grand_piano", 1);
// midiHelper.setInstrument("violin", 2);

// Wait for physical Arduino board to connect
board.on("ready", function() {
	mainClient.say(options.channels[0], "Server started. Please chat away!");
	vert2 = new five.Servo({pin: 10});
	vert1 = new five.Servo({pin: 11});
	horz4 = new five.Servo({pin: 9});
	horz3 = new five.Servo({pin: 6});
	horz2 = new	five.Servo({pin: 5});
	horz1 = new	five.Servo({pin: 3});

	mainClient.on("chat", function(channel, user, message, self) {
		if (user.username == 'twitchplaysdrums'){
			// Ignore all self messages to avoid recursion.
			// Could use this to add admin only commands - but be careful of recursion. 
			// Will be banned for 2 hours if not. Trust me, I know.
			return;
		} else if (message.match(/^!/gi)) {
			// Argument vector
			var argv = message.split(" ");
			var command = argv[0].substring(1);
			console.log("COMMAND: " + command);

			switch(command) {
				case "help":
				var helpStr_1 = "List of available commands: \n\n" +
				"!startMonitor [channel_name]: Change the monitoring channel to channel_name. Defaults to twitchplaysdrums. \n\n" +
				"!stopMonitor  [channel_name]: Stop monitoring channel_name. Defaults to twitchplaysdrums. \n\n" +
				"!listMonitor : List all channels currently being monitored. \n\n";
				var helpStr_2 = 
				"!addInterval [interval_name] [servo_index] [interval_time]: Bind a servo at servo_index at interval_time, and names it interval_time (ms). \n\n" +
				"!clearInterval [interval_name]: Unbind servo from interval with interval_name. \n\n" +
				"!listInterval : List all intervals currently being ran.";

				mainClient.say(options.channels[0], helpStr_1);
				mainClient.say(options.channels[0], helpStr_2);
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
				var intervalName  = argv[1];
				var intervalIndex = parseInt(argv[2]);
				var intervalDelay = parseInt(argv[3]);

				if (intervalName in intervalObject) {
					console.log("Nope exists");
					mainClient.say(options.channels[0], "Sorry, this interval name is already taken. Please choose another name");
					break;
				};
				console.log("Created interval " + intervalName + ", at servo " + intervalIndex + ", at " + intervalDelay + " ms");
				// Create an interval, throws all data into the global object intervalObject;
				intervalObject[intervalName] = setInterval(function() {
					playServoX(intervalIndex, 500);
				}, intervalDelay);
				break;

				case "clearInterval":
				// If it exists, clear it, delete from tracker object, and announce it
				if (argv[1] in intervalObject) {
					clearInterval(intervalObject[argv[1]]);
					delete intervalObject[argv[1]];
					mainClient.say(options.channels[0], "Cleared interval " + argv[1]);
				} else {
					mainClient.say(options.channels[0], "Could not find interval named " + argv[1] + " to delete");
				}
				break;

				case "listInterval":
				mainClient.say(options.channels[0], Object.keys(intervalObject).join(", "));
				break;

				default:
				mainClient.say(options.channels[0], "This is not a valid command. Please try again xoxo");
				break;
			}
		} else if (monitorFlag) {
			var emote = parseEmote(message);
			if (emote) {
				// Percussion value, converted to Unicode number, then split in half;
				var percussion = parseInt(emote.charCodeAt(0));
				if (percussion > 78) { //Half of [65-90];
					playServoX(4, 500);
				} else {
					playServoX(5, 500);
				}
			}

			// [48-122] is the range of Unicode characters for Latin letters (uppercase and lowercase) and numbers.
			var note = parseInt(message.charCodeAt(0).map(48,122,0,3));
			switch(note) {
				case 0:
				playServoX(0, 400);
				break;

				case 1:
				playServoX(1, 400);
				break;

				case 2:
				playServoX(2, 400);
				break;

				default:
				playServoX(3, 400);
				break;
			}
		}
	});	
})

//Copied this from StackOverflow cause I'm lazy.
Number.prototype.map = function (in_min, in_max, out_min, out_max) {
	return (this - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
}


// Middle-man function for controlling servo. We are not actually using this in the main loop.
// Takes in servo Object, time in milliseconds
// (Optional) takes in an angle (defaults to 30), if movement is reversed or not (defaults to false), and offset (defaults to 0);
function playServo(servo, time, angle, reversed, offset) {
	reversed = reversed || false;
	angle = angle || 30;
	offset = offset || 0;

	// Edge case when playServo is invoked before Arduino is connected
	if (servo == undefined) {
		return;
	}

	if (reversed) {
		angle = -angle;
	} 

	console.log("Servo moves to " + parseInt(90+offset+angle) + " and back to " + parseInt(90+offset));

	servo.to(90+offset);
	setTimeout (function() {
		servo.to(90+offset+angle);
	}, time/2);
	setTimeout (function() {
		servo.to(90+offset);
	}, time);
}


// Wrapper function for playServo() since each servo have different configurations - this could be better but screw it.
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
		playServo(horz2, time, 50);
		break;

		case 2:
		playServo(horz3, time, 30);
		break;

		case 3:
		playServo(horz4, time, 90, false, -15);
		break;

		case 4:
		playServo(vert1, time, 40);
		break;

		case 5:
		playServo(vert2, time, 30, false, 35);
		break;
	}
}

function parseEmote(text) {
	var parseFlag = false;
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