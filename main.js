'use strict'
var tmi = require("tmi.js");
var fs = require("fs");
var five = require('johnny-five');
var pixel = require('node-pixel');
var board = new five.Board({repl: false});
var strip = null;
var i = 0;

board.on("ready", function() {
	strip = new pixel.Strip({
		board: this,
		controller: "FIRMATA",
		strips: [ {pin: 6, length: 150}]
	});
	strip.on("ready", function() {
		client.on("chat", function(channel, user, message, self) {
			if (i == 149) {
				i = 0;
				strip.color("black");
				strip.show();
			} 
			var p = strip.pixel(i);
			var startChar = message.charCodeAt(0);
			var color = parseInt(startChar.map(33,126,0,16777215));
			console.log(color.toString(16));

			p.color("#" + color.toString(16));

			// var kappaArray = message.match(/Kappa/i) || []; // Great name I R8 8/8 M8
			// var lulArray = message.match(/lul/i) || [];
			// if (lulArray.length > 0) {
			// 	p.color("blue");
			// } else if (kappaArray.length >0) {
			// 	p.color("green");
			// } else {
			// 	p.color("red");
			// }
			// Update strip and go to next buffer pixel;
		 	//Loop back;
		 	strip.show();
		 	i++;
		})	
	});
})

//Copied this from StackOverflow cause I'm lazy.
Number.prototype.map = function (in_min, in_max, out_min, out_max) {
  return (this - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
}

var options = require("./config.json");
var client = new tmi.client(options);

client.connect();