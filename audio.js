/*global audio: true*/
/*global speechSynthesis, SpeechSynthesisUtterance*/
audio =
(function () {
"use strict";

//extract from here ...
function createOcean (ctx) {
	//based on https://github.com/zacharydenton/noise.js
	var bufferSize = 4096,
		brownNoise = (function () {
			var lastOut = 0.0,
				node = ctx.createScriptProcessor(bufferSize, 1, 1);
			node.onaudioprocess = function (e) {
				var output = e.outputBuffer.getChannelData(0), i, white;
				for (i = 0; i < bufferSize; i++) {
					white = Math.random() * 2 - 1;
					output[i] = (lastOut + (0.02 * white)) / 1.02;
					lastOut = output[i];
					output[i] *= 3.5;
				}
			};
			return node;
		})(),
		brownGain = ctx.createGain(),
		lfo = ctx.createOscillator(),
		lfoGain = ctx.createGain();

	brownGain.gain.value = 0.1;
	brownNoise.connect(brownGain);
	lfo.frequency.value = 1 / 7.5;
	lfoGain.gain.value = 0.05;

	lfo.start();
	lfo.connect(lfoGain);
	lfoGain.connect(brownGain.gain);
	return brownGain;
}

function initAudioContext () {
	var AudioContext = window.AudioContext || window.webkitAudioContext,
		ctx, output, ocean, playGain;

	ctx = new AudioContext();
	output = ctx.createGain();
	output.connect(ctx.destination);
	output.gain.value = 1;

	ocean = createOcean(ctx);

	playGain = ctx.createGain();
	playGain.connect(output);

	function mute () {
		output.gain.value = 0;
	}

	function unmute () {
		output.gain.value = 1;
	}

	function oceanOn () {
		ocean.connect(output);
	}

	function oceanOff () {
		ocean.disconnect();
	}

	//based on https://github.com/foumart/JS.13kGames/blob/master/lib/SoundFX.js
	function playSound (freq, incr, delay, times, vol) {
		var oscillator = ctx.createOscillator(),
			modulationGain = ctx.createGain(),
			i = 0, interval;

		oscillator.frequency.value = freq;
		oscillator.type = 'square';

		modulationGain = ctx.createGain();
		modulationGain.gain.value = 0;

		oscillator.connect(modulationGain);
		modulationGain.connect(output);
		oscillator.start();

		interval = setInterval(function () {
			oscillator.frequency.value = freq + incr * i;
			modulationGain.gain.value = (1 - (i / times)) * vol;
			i++;
			if (i > times) {
				clearInterval(interval);
				setTimeout(function () {
					oscillator.stop();
				}, delay + times);
			}
		}, delay);
	}

	return {
		mute: mute,
		unmute: unmute,
		oceanOn: oceanOn,
		oceanOff: oceanOff,
		pling: function () {
			playSound(510, 0, 15, 20, 0.1);
			setTimeout(function () {
				playSound(2600, 1, 10, 50, 0.2);
			}, 80);
		},
		plong: function () {
			playSound(920, -80, 20, 15, 0.5);
		},
		plongPling: function () {
			playSound(920, -80, 20, 15, 0.5);
			setTimeout(function () {
				playSound(510, 0, 15, 20, 0.1);
			}, 300);
			setTimeout(function () {
				playSound(2600, 1, 10, 50, 0.2);
			}, 380);
		}
	};
}

function initSpeechSynthesis () {
	var muted, sS = speechSynthesis, SSU = SpeechSynthesisUtterance;
	return {
		mute: function () {
			muted = true;
		},
		unmute: function () {
			muted = false;
		},
		thanks: function () {
			if (muted) {
				return;
			}
			var utterance = new SSU('thank you');
			utterance.lang = 'en';
			utterance.pitch = 1.4 + 0.2 * Math.random(); //higher than usual pitch for a child
			sS.speak(utterance);
		}
	};
}

var audio0, audio1;

try {
	audio0 = initAudioContext();
} catch (e) {
	audio0 = {};
}

try {
	audio1 = initSpeechSynthesis();
} catch (e) {
	audio1 = {};
}

function audio (method) {
	try {
		if (audio0[method]) {
			audio0[method]();
		}
		if (audio1[method]) {
			audio1[method]();
		}
	} catch (e) {
		//this shouldn't happen, but audio is a bit weird
	}
}
//... to here

return audio;
})();