var emotes = require('../data/emotes.json');
var bpm = 60;

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
	var millis = 60000/bpm;

}

function messageConv(string) {
	// return parseInt(string.charCodeAt(0).map(48,122,0,3));
	return parseInt(string.charCodeAt(0));
}

function emoteConv(string) {
	return parseInt(string.charCodeAt(0).map(52,90,0,1));
	// return parseInt(string.charCodeAt(0));
}

//Copied this from StackOverflow cause I'm lazy.
Number.prototype.map = function (in_min, in_max, out_min, out_max) {
	return (this - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
}

var abc = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
var emo = "4ABCDEFGHIJKLMNOPQRSTUVWXYZ";

for (var i=0;i<emo.length;i++){
	console.log(emo[i] + ": " + emoteConv(emo[i]));
}

// console.log(parseEmote("PogChamp ASDFdslkfjasdf dlakds dank memes"));
// console.log(getLength("PogChamp ASDFdslkfjasdf dlakds dank memes"));
// console.log(parseEmote("asdf lkdsaf jasd"));
// console.log(getLength("asdf lkdsaf jasd"));