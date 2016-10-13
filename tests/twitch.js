var emotes = require('../data/emotes.json');

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

console.log(parseEmote("PogChamp ASDFdslkfjasdf dlakds dank memes"));
console.log(parseEmote("asdf lkdsaf jasd"));