'use strict'
var tmi = require("tmi.js");
var fs = require("fs");

var options = require("./config.json");
var client = new tmi.client(options);

client.connect();

client.on("chat", function(channel, user, message, self) {
	console.log(message);
})