var instruments = require("./data/instruments.json");

module.exports = function(output) {
	var module = {};
	//Play a note by sending output to MIDI
	module.playNote = function ( note, velocity, length, channel ) {
		output.sendMessage([144+channel-1, note, velocity]);

		setTimeout( function() { 
			output.sendMessage([144+channel-1, note, 0]); 
        output.sendMessage([128+channel-1, note, 64]); // also send MIDI note off
    }, length );
	}

	module.setInstrument = function (instrument, channel) {
		output.sendMessage([192+channel-1, instruments[instrument]-1]);
	}

	// Turn on note
	module.noteOn = function (note, velocity, channel) {
		output.sendMessage([144+channel-1, note, velocity]);
	}

	// Turn off note
	module.noteOff = function (note, channel) {
		output.sendMessage([144+channel-1, note, 0]);
		output.sendMessage([128+channel-1, note, 64]);
	}

	module.allNotesOff = function () {
		output.sendMessage([176, 0b01111011, 0b00000000]);
	}

	return module;
}