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

//Flags
var monitorFlag;

// midiHelper.setInstrument("acoustic_grand_piano", 1);
// midiHelper.setInstrument("violin", 2);

board.on("ready", function() {
	var vert2 = new five.Servo({pin: 11});
	var vert1 = new five.Servo({pin: 10});
	var horz4 = new five.Servo({pin: 9});
	var horz3 = new five.Servo({pin: 6});
	var horz2 = new	five.Servo({pin: 5});
	var horz1 = new	five.Servo({pin: 3});

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
				if (argv[1] == "twitchplaysdrums" || !argv[1]) {
					mainClient.say(options.channels[0], "Started monitoring.");
					monitorFlag = true;
					break;
				} else {
					mainClient.join(argv[1])
					.then(function(data) {
						console.log("Joined channel " + argv[1]);
						mainClient.say(options.channels[0], "Successfully joined channel " + argv[1]);
						monitorFlag = true;
					})
					.catch(function(err) {
						console.log(err);
						mainClient.say(options.channels[0], "Cannot join channel " + argv[1] + ". Channel may not exist or is not currently available.");
					});
					break;
				}

				case "stopMonitor":
				if (argv[1] == "twitchplaysdrums" || !argv[1]) {
					// mainClient.say(options.channels[0], "I'm sorry Dave, I'm afraid I can't do that.");
					mainClient.say(options.channels[0], "Stopped monitoring.");
					monitorFlag = false;
					break;
				} else {
					mainClient.part(argv[1])
					.then(function(data) {
						console.log("Left channel " + argv[1]);
						mainClient.say(options.channels[0], "Successfully disconnected from channel " + argv[1]);
						monitorFlag = false;
					})
					.catch(function(err) {
						console.log(err);
						mainClient.say(options.channels[0], "Problem leaving channel " + argv[1] + ". Please check your channel and try again.");
					})
				}
				break;
			}
		} else if (monitorFlag) {
			chatCount++;
			var emote = parseEmote(message);
			if (emote) {
				// Percussion value from 0 to 127;
				var percussion = parseInt(emote.charCodeAt(0).map(33,126,0,127));
				console.log(percussion);
				if (percussion < 63) {
					playServo(vert1, 500);
				} else {
					playServo(vert2, 500);
				}
			}
		}
	});	

	// monitorClient.on("chat", function(channel, user, message, self) {
	// 	chatCount++;
	// 	var emote = parseEmote(message, emotes);
	// 	if (emote) {
	// 		var percussion = parseInt(emote.charCodeAt(0).map(33,126,0,127));
	// 		midiHelper.playNote(percussion, 127, getLength(emote, bpm), 2);
	// 		console.log(emote);
	// 		// if (emote == "4Head") {
	// 			// playServo(servo1, 50);
	// 		// }
	// 	}
	// 	// Convert note to MIDI note message.
	// 	var note = parseInt(message.charCodeAt(0).map(33,126,0,127));
	// 	// console.log(note);
	// 	// Play note with max volume (127), lasts x ms, and on channel 1. 
	// 	midiHelper.playNote(note, 127, getLength(message, bpm), 1);
	// 	// playServo(servo2, 50);
	// });

})

// Beats count over x seconds
var duration = 5;
var beats = setInterval(function() {
	bpm = chatCount*60/duration;
	console.log("BEATS PER MINUTES: " + bpm);
	chatCount = 0;
}, duration*1000);

//Copied this from StackOverflow cause I'm lazy.
Number.prototype.map = function (in_min, in_max, out_min, out_max) {
	return (this - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
}

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
function getLength(text, bpm) {
	// console.log(parseInt(text.length/10*(15/bpm)*1000));
	return parseInt(text.length/10*(15/bpm)*1000);
}

module.switchChannel = function (clientObj, newChannel) {
	// disconnectFrom();
	clientObj.disconnect();
	var newOptions = options;
	newOptions.channels = [newChannel];
	var clientObj = new tmi.client(newOptions);
	// connectTo();
	clientObj.connect();
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