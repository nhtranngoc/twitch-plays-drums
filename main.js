'use strict'
var tmi = require("tmi.js");
var midi = require('midi');

// Set up a new output.
// Change this to whatever MIDI synthesizer you use. YMMV
var output = new midi.output();
output.openPort(1);

// var five = require('johnny-five');
// var pixel = require('node-pixel');
// var board = new five.Board({repl: false});
// var strip = null;
// var i = 0;

var options = require("./config.json");
var client = new tmi.client(options);
var lastNote = 0x00;
client.connect();

// board.on("ready", function() {
// 	strip = new pixel.Strip({
// 		board: this,
// 		controller: "FIRMATA",
// 		strips: [ {pin: 6, length: 150}]
// 	});
// 	strip.on("ready", function() {
		// var led = new five.Led(13);
		setInstrument(54, 1);
		client.on("chat", function(channel, user, message, self) {
		// 	if (i >= 149) {
		// 	i = 0;
		// 	strip.color("black");
		// 	strip.show();
		// }
		// 	var p = strip.pixel(i);
			// Get the Unicode number for the first character of the message
			var startChar = message.charCodeAt(0);
			// Convert Unicode number to hex 
			var color = parseInt(startChar.map(33,126,0,16777215));
			console.log(color.toString(16));

			// Convert note to MIDI note message.
			var note = parseInt(startChar.map(33,126,0,127));
			console.log(note);
			// Play note with max volume (127), lasts 250ms, and on channel 1. 
			// playNote(note, 127, 250, 1);

			noteOff(lastNote, 1);
			noteOn(note, 127, 1);
			lastNote = note;

			// p.color("#" + color.toString(16));
			// Update strip and go to next buffer pixel;
		  	// Loop back;
		 	// strip.show();
		 	// i++;
		});	
// 	});
// })

//Copied this from StackOverflow cause I'm lazy.
Number.prototype.map = function (in_min, in_max, out_min, out_max) {
  return (this - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
}

// Turn on note
function noteOn(note, velocity, channel) {
	output.sendMessage([144+channel-1, note, velocity]);
}

// Turn off note
function noteOff(note, channel) {
	output.sendMessage([144+channel-1, note, 0]);
	output.sendMessage([128+channel-1, note, 64]);
}

function allNotesOff() {
	// var i;
	// for (i=0;i++;i<16) {
		// output.sendMessage([176+i-1, 0b01111011, 0b00000000]);
	// }
	output.sendMessage([176, 0b01111011, 0b00000000]);
}

//Play a note by sending output to MIDI
function playNote( note, velocity, length, channel ) {
        output.sendMessage([144+channel-1, note, velocity]);
        setTimeout( function() { 
                output.sendMessage([144+channel-1, note, 0]); 
                output.sendMessage([128+channel-1, note, 64]); // also send MIDI note off
            }, 
        length );
}

function setInstrument (id, channel) {
	output.sendMessage([192+channel-1, id]);
}

// New message come in, calculate delay between lastbpm and thisbpm, extrapolate to bpm
// var buffer = [];
// function calculateBPM (lastBPM) {

// }

function exitHandler() {
	console.log("Exiting...");
	allNotesOff();
	output.closePort();
	process.exit();
}

// catches close event
process.on('exit', exitHandler);

//catches ctrl+c event
process.on('SIGINT', exitHandler);