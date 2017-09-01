/*global SVG_FRONT, SVG_BACK, SVG_SIDE, SVG_LIE_A, SVG_LIE_B, SVG_SWIM,
	SVG_TOWEL, SVG_WAVE, SVG_PARASOL, SVG_BALL, SVG_WALLY, SVG_WATER,
	audio*/
(function () {
"use strict";

var dom = {},
	svg = [SVG_FRONT, SVG_BACK, SVG_SIDE, SVG_SIDE, SVG_LIE_A, SVG_LIE_B, SVG_SWIM, SVG_SWIM,
		SVG_TOWEL, SVG_WAVE, SVG_PARASOL, SVG_BALL, SVG_WALLY, SVG_WATER],

	//SEX_MALE = 0,
	//SEX_FEMALE = 1,

	TYPE_FRONT = 0,
	TYPE_BACK = 1,
	TYPE_LEFT = 2,
	TYPE_RIGHT = 3,
	//TYPE_LIE_A = 4,
	//TYPE_LIE_B = 5,
	TYPE_SWIM_LEFT = 6,
	TYPE_SWIM_RIGHT = 7,

	VARIANT_0 = 0,
	//VARIANT_1 = 1,
	//VARIANT_2 = 2,

	//SKIN_LIGHT = 0,
	//SKIN_DARK = 1,

	HAIR_NONE = 0,
	//HAIR_SHORT_BLOND = 1,
	//HAIR_SHORT_DARK = 2,
	//HAIR_LONG_BLOND = 3,
	//HAIR_LONG_DARK = 4,

	SHIRT_NONE = 0,
	//SHIRT_RED = 1,
	//SHIRT_BLUE = 2,
	//SHIRT_GREEN = 3,
	//SHIRT_YELLOW = 4,

	//TROUSERS_RED = 0,
	//TROUSERS_BLUE = 1,
	//TROUSERS_GREEN = 2,
	//TROUSERS_YELLOW = 3,

	OBJECT_TOWEL = 0,
	OBJECT_WAVE = 1,
	OBJECT_PARASOL = 2,
	//OBJECT_BALL = 3,
	OBJECT_WALLY = 4,
	OBJECT_WATER = 5;

function pad (n) {
	return n < 10 ? '0' + n : n;
}

function formatTime (t) {
	return Math.floor(t / 60) + ':' + pad(t % 60);
}

function rand (n) {
	return Math.floor(n * Math.random());
}

function randNormal (m, s) {
	//Box-Muller
	return Math.cos(2 * Math.PI * Math.random()) * Math.sqrt(-2 * Math.log(Math.random())) * s + m;
}

function randomOrder (array) {
	var sort = array.map(function (el) {
		return {el: el, s: Math.random()};
	});
	sort.sort(function (a, b) {
		return a.s - b.s;
	});
	return sort.map(function (el) {
		return el.el;
	});
}

function personsForRound (n) {
	return 84 / (1 + Math.exp(-0.3 * n) * 20); //there is place for 84 persons, use a logistic function
}

function objectsForRound (n) {
	return Math.round(1.2 * personsForRound(n / 2)); //there is place for 108 objects, Math.round(1.2 * 84) === 101
}

function getPersistent (name) {
	try {
		//localStorage has to share the namespace with much other stuff, so try to get a unique key
		return Number(localStorage['schnark-13k17-' + name]) || 0;
	} catch (e) {
		return 0;
	}
}

function setPersistent (name, val) {
	try {
		localStorage['schnark-13k17-' + name] = val;
	} catch (e) {
	}
}

function getText (type, data) {
	var texts = [
		'I’ve lost my $0! $1 has $3 hair, wears $4 T-shirt and $5 shorts. Please help me find $2!',
		'No, that’s not $2. My $0 has $3 hair, wears $4 T-shirt and $5 shorts.',
		'Thank you for helping me find my $0!'
	], textsFill = [
		['Dad', 'Mom'],
		['He', 'She'],
		['him', 'her'],
		['no', 'short blond', 'short dark', 'long blond', 'long dark'],
		['no', 'a red', 'a blue', 'a green', 'a yellow'],
		['red', 'blue', 'green', 'yellow']
	];

	return texts[type].replace(/\$(\d)/g, function (all, n) {
		return textsFill[n][data[Math.max(n - 1, 1)]];
	});
}

function getPositions () {
	//position of the bottom left corner, meassured from top left
	var grid = 50, stand, lie, swim, parasol;
	function prep (array, dx, dy) {
		var ret = [], i, pos;
		for (i = 0; i < array.length; i++) {
			pos = array[i];
			ret.push({x: pos.x * grid + dx + 5, y: pos.y * grid + dy});
			ret.push({x: pos.x * grid + dx + 5, y: pos.y * grid + 4 * grid + dy});
			ret.push({x: pos.x * grid + dx + 5, y: pos.y * grid + 8 * grid + dy});
		}
		return ret;
	}

	stand = [
		{x: 0, y: 2.5}, {x: 1, y: 3}, {x: 2, y: 5}, {x: 2.5, y: 3.5}, {x: 3, y: 4.5}, {x: 5, y: 2.5},
		{x: 6, y: 5}, {x: 6.5, y: 3.5}, {x: 7, y: 4.5}, {x: 8, y: 3}, {x: 8, y: 4.5}, {x: 9, y: 3},
		{x: 9, y: 5}, {x: 10, y: 2.5}, {x: 10, y: 3.5}, {x: 10.5, y: 5}
	];
	lie = [
		{x: 0, y: 4}, {x: 0, y: 5}, {x: 3, y: 2}, {x: 3.5, y: 3}, {x: 4, y: 4}, {x: 4, y: 5}, {x: 7, y: 1.5}
	];
	swim = [
		{x: 11, y: 2}, {x: 12, y: 3}, {x: 12, y: 4}, {x: 13, y: 1}, {x: 14, y: 2}
	];
	parasol = [ //like lie, but a few removed, because they often hide people
		{x: 0, y: 4}, {x: 0, y: 5}, {x: 3.5, y: 3}, {x: 7, y: 1.5}
	];
	return [
		randomOrder(prep(stand, 0, 0)),
		randomOrder(prep(lie, 0, 0)),
		randomOrder(prep(swim, 0, 0)),
		randomOrder(prep(lie, 0, 10)),
		randomOrder(prep(swim, -2, 2)),
		randomOrder(prep(parasol, -grid - 2, -10)),
		randomOrder(prep(stand, 15, 10).concat(prep(swim, -3, 3))),
		randomOrder(prep(stand, 15, 11))
	];
}

function sortSprites (sprites) {
	//for 2d view, and for old Firefox, where 100+ 3d items won't respect z-axis
	sprites.sort(function (a, b) {
		if (a.flat !== b.flat) {
			return a.flat ? -1 : 1; //flat objects first
		}
		return a.y - b.y;
	});
	return sprites.map(function (a) {
		return a.div;
	});
}

function createSprite (type, cls, x, y, transform) {
	var div = document.createElement('div');
	div.innerHTML = '<div style="transform:' + transform + ';">' + svg[type] + '</div>';
	div.className = cls;
	div.style.left = x + 'px';
	div.style.bottom = (650 - y) + 'px'; //650px is the total height
	return {div: div, flat: cls.indexOf('flat') > -1, y: y};
}

function createHuman (type, sex, hair, shirt, trousers, variant, skin, answer, x, y) {
	var m, size, width, mirror, sx, sy, cls, transform;
	if (answer === 'question') {
		m = 1.1; //average size of small child
	} else {
		if (sex) { //1 === FEMALE
			//average size of woman/girl
			m = (answer === 'correct' || rand(3) === 0) ? 1.7 : 1.6;
		} else {
			//average size of man/boy
			m = (answer === 'correct' || hair === HAIR_NONE || rand(3) === 0) ? 1.8 : 1.55;
		}
	}
	size = randNormal(m, 0.13) / 1.7;
	width = randNormal(sex ? 1 : 1.05, 0.02) * size; //men are a bit wider
	if (type === TYPE_FRONT || type === TYPE_BACK) {
		mirror = rand(2);
	} else if (type === TYPE_LEFT || type === TYPE_SWIM_LEFT) {
		mirror = 1;
	}
	if (type <= TYPE_RIGHT) {
		sx = (mirror ? '-' : '') + width;
		sy = size;
	} else {
		sx = (mirror ? '-' : '') + size;
		sy = width;
	}
	cls = ['human', 'sex-' + sex, 'hair-' + hair, 'shirt-' + shirt,
		'trousers-' + trousers, 'variant-' + variant, 'skin-' + skin, answer];
	transform = 'scaleY(' + sy + ') ' + 'scaleX(' + sx + ') ' +
		(answer === 'question' ? '' : 'rotateY(' + (rand(20) - 10) + 'deg)');
	return createSprite(type, cls.join(' '), x, y, transform);
}

function createObject (type, variant, x, y) {
	var cls, transform = 'none';

	cls = ['object', 'variant-' + variant];
	if (type === OBJECT_TOWEL || type === OBJECT_WATER) {
		cls.push('flat');
	}
	if (type === OBJECT_WAVE || type === OBJECT_WATER) {
		cls.push('moving');
	}
	if (type === OBJECT_WALLY) {
		cls.push('special');
	}

	if (type === OBJECT_WATER) {
		transform = 'translateZ(10px)';
	} else if (type === OBJECT_PARASOL) {
		transform = 'rotateX(' + (rand(10) - 5) + 'deg) rotateZ(' + (rand(10) - 5) + 'deg)';
	}
	return createSprite(type + 8, cls.join(' '), x, y, transform);
}

function randomHuman () {
	var sex, type, hair, shirt, trousers, variant, skin;
	sex = rand(2);
	type = rand(8);
	if (sex) { //1 === FEMALE
		hair = rand(4) + 1; //not NONE
	} else {
		hair = rand(3); //not LONG
	}
	if (type === TYPE_SWIM_LEFT || type === TYPE_SWIM_RIGHT) {
		shirt = SHIRT_NONE;
	} else {
		shirt = rand(5);
	}
	trousers = rand(4);
	variant = rand(3);
	skin = rand(2);
	return [type, sex, hair, shirt, trousers, variant, skin];
}

function randomObject (wally) {
	return [wally ? OBJECT_WALLY : rand(4), rand(3)];
}

function createHumans (n) {
	var positions = getPositions(),
		posType = [0, 0, 0, 0, 1, 1, 2, 2],
		humans = [],
		human, pos, i;
	for (i = 0; i < n; i++) {
		do {
			human = randomHuman();
		} while (
			//looks like the person we search for
			(i !== 0 && human[2] === humans[0][2] && human[3] === humans[0][3] && human[4] === humans[0][4]) ||
			//no position left
			positions[posType[human[0]]].length === 0
		);
		if (i === 0) {
			human[7] = 'correct';
		} else {
			human[7] = 'wrong';
		}
		pos = positions[posType[human[0]]].pop();
		human[8] = pos.x;
		human[9] = pos.y;
		humans.push(human);
	}
	return humans;
}

function createObjects (n, round) {
	var positions = getPositions(),
		posType = [3, 4, 5, 6, 7],
		objects = [],
		object, pos, i;
	for (i = 0; i < n; i++) {
		do {
			object = randomObject(
				round > 5 &&
				i === 0 &&
				(
					(round === 6 && getPersistent('special') === 0) || //show for the first time
					rand(10) === 0
				)
			);
		} while (
			positions[posType[object[0]]].length === 0 //no position left
		);
		pos = positions[posType[object[0]]].pop();
		object[2] = pos.x;
		object[3] = pos.y;
		objects.push(object);
	}
	return objects;
}

function createRound (n) {
	var humans = createHumans(personsForRound(n)),
		objects = createObjects(objectsForRound(n), n),
		sex, i, sprites = [];
	dom.question.innerHTML = getText(0, humans[0]);
	dom.wrong.innerHTML = getText(1, humans[0]);
	dom.correct.innerHTML = getText(2, humans[0]);
	dom.output.className = '';
	dom.child.innerHTML = '';
	sex = rand(2);
	dom.child.appendChild(
		createHuman(TYPE_FRONT, sex, rand(sex ? 4 : 2) + 1, rand(4) + 1, rand(4), VARIANT_0, rand(2), 'question', 0, 0).div
	);
	objects.push([OBJECT_WATER, 0, 500, 650]); //500px is the start of the ocean, 650px the height
	dom.playground.innerHTML = '';
	for (i = 0; i < humans.length; i++) {
		sprites.push(createHuman.apply(null, humans[i]));
	}
	for (i = 0; i < objects.length; i++) {
		sprites.push(createObject.apply(null, objects[i]));
	}
	sprites = sortSprites(sprites);
	for (i = 0; i < sprites.length; i++) {
		dom.playground.appendChild(sprites[i]);
	}
}

function getResult (points, special) {
	var texts = [], total = 0, lc = [
		'',
		//jscs:disable maximumLineLength
		'<p>I promised you something for 10 extra points. What about this: My favourite author is Lewis Carroll, and I hope you enjoy his texts, too. So I searched his complete works for the word “lost”, and found over 100 occurences! I’ll give you my 5 most favourite ones. Here is the first:</p><p>“And you do Addition?” the White Queen asked. “What’s one and one and one and one and one and one and one and one and one and one?” “I don’t know,” said Alice. “I lost count.” “She ca’n’t do Addition,” the Red Queen interrupted. (<cite>Through the Looking-Glass, and What Alice Found There</cite>)</p>',
		'<p>It’s time for the second quote:</p><p>“Put oor ear <i>welly</i> low down,” said Bruno, “and I’ll tell oo a secret! It’s the Frogs’ Birthday-Treat—and we’ve lost the Baby!” “<i>What</i> Baby?” I said, quite bewildered by this complicated piece of news. “The <i>Queen’s</i> Baby, a course!” said Bruno. “We put it in a flower,” Sylvie, who had just joined us, explained with her eyes full of tears. “Only we ca’n’t remember <i>which</i>!” (<cite>Sylvie and Bruno</cite>)</p>',
		'<p>It’s time for the third quote:</p><p>Alice explained, as well as she could, that she had lost her way. “I don’t know what you mean by <i>your</i> way,” said the Queen: “all the ways about here belong to <i>me</i>.” (<cite>Through the Looking-Glass, and What Alice Found There</cite>)</p>',
		'<p>It’s time for the fourth quote:</p><p>The Beaver had counted with scrupulous care,<br>Attending to every word:<br>But it fairly lost heart, and outgrabe in despair,<br>When the third repetition occurred.<br>(<cite>The Hunting of the Snark</cite>)</p>',
		'<p>And here is the last quote:</p><p>“Have you got that last step written down? Unless I’ve lost count, that makes a thousand and one. There are several millions more to come.” (<cite>What the Tortoise Said to Achilles</cite>)</p><p>Thanks for playing, and I hope you enjoyed it!</p>'
	];
	/* Five extra quotes for those of you who look at the source:
		'<p>“Say that 70 per cent. have lost an eye—75 per cent. an ear—80 per cent. an arm—85 per cent. a leg—that’ll do it beautifully. Now, my dear, what percentage, <i>at least</i>, must have lost all four?” (<cite>A Tangled Tale</cite>)</p>',
		'<p>“Ah, my Hero,” said I,<br>“Let me be thy Leander!”<br>But I lost her reply—<br>Something ending with “gander”—<br>For the omnibus rattled so loud that no mortal could quite understand her.<br>(<cite>Atalanta in Camden-Town</cite>)</p>',
		'<p>She’s all my fancy painted him<br>(I make no idle boast);<br>If he or you had lost a limb,<br>Which would have suffered most?<br>(<cite>She’s all my Fancy Painted Him</cite>)</p>',
		'<p>To restore the character of Ch. Ch., a tower must be built;<br>To build a tower, ten thousand pounds must be raised;<br><i>Ergo</i>, No time must be lost.<br>(<cite>The New Belfry of Christ Church, Oxford</cite>)</p>',
		'<p>“Well, a ‘<i>rath</i>’ is a sort of green pig: but ‘<i>mome</i>’ I’m not certain about. I think it’s short for ‘from home’—meaning that they’d lost their way, you know.” (<cite>Through the Looking-Glass, and What Alice Found There</cite>)</p>'
	*/
	//jscs:enable maximumLineLength
	if (!points) {
		return 'You didn’t find any lost parents. That’s sad.';
	}
	texts.push('You found ' + points + ' lost parent' + (points > 1 ? 's' : '') + '!');
	if (points > getPersistent('highscore')) {
		texts.push('That’s a new highscore!');
		setPersistent('highscore', points);
	}
	if (special) {
		total = getPersistent('special') + special;
		setPersistent('special', total);
		texts.push('And you got ' + special + ' extra point' + (special > 1 ? 's' : '') +
			(total > special ? ', which makes ' + total + ' so far' : '') + '!');
	}
	return '<p>' + texts.join(' ') + '</p>' + (lc[Math.min(Math.round(Math.sqrt((total + 1) / 5)) - 1, lc.length - 1)] || '');
}

function playGame (t) {
	var points = 0, special = 0, wrong = 0, skip = 0, end, start, interval;

	function onFind () {
		points++;
		audio('thanks');
		setTimeout(function () {
			if (end) {
				return;
			}
			wrong = 0;
			createRound(points);
		}, 1000);
	}

	function onSpecial () {
		special++;
		audio('pling');
	}

	function onWrong () {
		wrong++;
		audio('plong');
		if (wrong === 3) {
			onSkip();
		}
	}

	function onSkip () {
		skip++;
		dom.skipping.style.display = 'block';
		setTimeout(function () {
			dom.skipping.style.display = 'none';
			if (end) {
				return;
			}
			wrong = 0;
			createRound(points);
		}, 1000 * skip);
	}

	function onEnd () {
		end = true;
		audio('oceanOff');
		audio('plongPling');
		dom.text.innerHTML = getResult(points, special);
		dom.start.innerHTML = 'Try again!';
		dom.game.style.display = 'none';
		dom.intro.style.display = 'block';
	}

	//use onclick, because it's shorter and we want to override the previous listener
	dom.playground.onclick = function (e) {
		var el = e.target;
		while (!(el.classList.contains('human') || el.classList.contains('special')) && el.parentElement) {
			el = el.parentElement;
		}
		if (el.classList.contains('correct')) {
			dom.output.className = 'correct';
			onFind();
		} else if (el.classList.contains('wrong')) {
			dom.output.className = 'wrong';
			onWrong();
		} else if (el.classList.contains('special')) {
			el.parentNode.removeChild(el);
			onSpecial();
		}
	};
	dom.skip.onclick = onSkip;
	start = Date.now();
	dom.time.innerHTML = formatTime(t * 60);
	interval = setInterval(function () {
		var remaining = Math.round((start - Date.now() + t * 60000) / 1000);
		if (remaining <= 0) {
			clearInterval(interval);
			onEnd();
		} else {
			dom.time.innerHTML = formatTime(remaining);
		}
	}, 500);
	createRound(0); //Infinity for test of full beach
	audio('oceanOn');
	setTimeout(function () {
		//Come on, Firefox! If you display the stuff correctly right from the beginning,
		//I wouldn't have to force you to redraw it!
		var body = document.body, dummy;
		body.style.display = 'none';
		dummy = body.innerText;
		body.style.display = '';
	}, 0);
}

function getDom (ids) {
	var i, id;
	for (i = 0; i < ids.length; i++) {
		id = ids[i];
		dom[id] = document.getElementById(id);
	}
}

function mute () {
	dom.mute.style.display = 'none';
	dom.unmute.style.display = '';
	audio('mute');
	setPersistent('mute', 1);
}

function unmute () {
	dom.unmute.style.display = 'none';
	dom.mute.style.display = '';
	audio('unmute');
	setPersistent('mute', 0);
}

function init () {
	getDom([
		'intro', 'text', 'start', 'game', 'skip', 'time', 'mute', 'unmute',
		'playground', 'output', 'question', 'wrong', 'correct', 'child', 'skipping'
	]);
	dom.start.addEventListener('click', function () {
		dom.intro.style.display = 'none';
		dom.game.style.display = 'block';
		playGame(3); //time in minutes
	});
	dom.mute.addEventListener('click', mute);
	dom.unmute.addEventListener('click', unmute);
	if (getPersistent('mute')) {
		mute();
	} else {
		unmute();
	}
}

init();

})();