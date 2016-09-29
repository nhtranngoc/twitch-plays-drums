# Twitch Plays Drum

## Authors: Nam, Benjamin, ~~Karsten~~, Grapes and James

A Twitch bot that monitor Twitch chat and use it to play musical instruments

## Dependencies

- Node.JS >=6.0
- johnny-five
- node-pixel
- node-midi
- tmi.js

## What it currently does

Not much. It currently monitors one (or several) Twitch chat channels (which can be set in `config.json`), and send a MIDI message corresponds to a note to a virtual MIDI port. You WILL need a synthesizer for this. Read Instructions for more details. 

~~and set LEDs color based on the first letter of each chat message. This ensures that all memes/copy pastas would be assigned the same color.~~

~~Colors are piped out to a 150-pixels WS2812b Addressable RGB LED strip (aka Adafruit NeoPixel). Pixels are incremented on every chat message, and reset back to black upon reaching the last pixel. Rinse and repeat.~~

## What it doesn't do

- Perform any kind of data analytics: Data is "saved" in a 150-pixel buffer, and colors are set by the first character's Unicode number. No data analysis is performed from the chat stream. That'd be a good direction, which we could look into.

- Makes a sound: LED is for demonstration purposes only, and the code will need tinkering to work with other actuators, such as solenoids, motors, or servo. Refer to the Johnny-five documentation for that.

- ~~Send any MIDI messages of any kind ~~

## Instructions

- Make sure you have a synthesizer installed. I have no idea how to do this in MacOS or Windows, so you're on your own lol. 

- If you're using Linux, I'm using Timidity as a synthesizer. Just install and run `timidity -iA` to create a virtual MIDI output with ALSA and you're all set.

//Load node-pixel firmware to Arduino board.
- Clone GitHub repo. 
- `npm install`
- `npm install johnny-five node-pixel` // Since we probably will not be using `node-pixel` in the future
- Create/edit config.json to use your own account and Oauth password
- Makes sure johnny-five pin configurations are correct.
- Run with `node main.js`