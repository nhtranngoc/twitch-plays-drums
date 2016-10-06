'use strict'
var tmi = require("tmi.js");
var midi = require('midi');
var emotes = require("./emotes.json");
var instruments = require("./instruments.json");
var five = require('johnny-five');
var board = new five.Board({repl: false});
var options = require("./config.json");

// Set up a new output.
// Change this to whatever MIDI synthesizer you use. YMMV
var output = new midi.output();
output.openPort(1);

var client = new tmi.client(options);
client.connect();

var chatCount = 0;
var bpm = 60;

setInstrument("acoustic_grand_piano", 1);
setInstrument("tinkle_bell", 2);	

// board.on("ready", function() {
	client.on("chat", function(channel, user, message, self) {
		chatCount++;
		var emote = parseEmote(message, emotes);
		if (emote) {
			var percussion = parseInt(emote.charCodeAt(0).map(33,126,0,127));
			playNote(percussion, 100, getLength(emote, bpm), 2);
		}
		// Convert note to MIDI note message.
		var note = parseInt(message.charCodeAt(0).map(33,126,0,127));
		// console.log(note);
		// Play note with max volume (127), lasts x ms, and on channel 1. 
		playNote(note, 127, getLength(message, bpm), 1);
	});	
// })

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
	output.sendMessage([176, 0b01111011, 0b00000000]);
}

//Play a note by sending output to MIDI
function playNote( note, velocity, length, channel ) {
	output.sendMessage([144+channel-1, note, velocity]);
	setTimeout( function() { 
		output.sendMessage([144+channel-1, note, 0]); 
        output.sendMessage([128+channel-1, note, 64]); // also send MIDI note off
    }, length );
}

function setInstrument (instrument, channel) {
	output.sendMessage([192+channel-1, instruments[instrument]-1]);
}

function parseEmote(text, emotes) {
	var splitText = text.split('');
	for (var i in emotes.emotes) {
		var re = new RegExp(i,"gi");
		if (text.match(re)) {
			// console.log("Matched: " + i);
			return i;
		}
		else return false;
	}
}

// Returns note length based on chat message length and beats per minute
function getLength(text, bpm) {
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