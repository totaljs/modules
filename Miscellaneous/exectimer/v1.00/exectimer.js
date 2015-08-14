// Copyright 2015 (c) Andrea Sessa <andrea.sessa@gmail.com>
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

// timers container
var timers = {};

exports.version = '1.00';
exports.id = 'execTimer';

exports.usage = function() {
	return timers;
}

function getUniqueID() {
	var id = U.random();
	return (timers[id]) ? getUniqueID() : id;
}

function getDiff(diff) {
	return diff[0] * 1e9 + diff[1];
}

// execTimer constructor
function execTimer() {
	var id = getUniqueID();
	timers[id] = new Timer(id);
	return timers[id];
}

/**
 * Timer constructor
 */
function Timer(id) {
	this.id = id;
	this.ticks = [];
	return this;
}

/**
 * Starts a new tick.
 */
Timer.prototype.start = function() {
	this.hrstart = process.hrtime();
}

/**
 * Ends tick.
 */
Timer.prototype.stop = function() {
	this.hrend = process.hrtime(this.hrstart);
	this.ticks.push(this.hrend);
}

/**
 * Get the diff of the last tick.
 * @returns Long nanoseconds
 */
Timer.prototype.diff = function (parse) {
	var number = this.hrend[0] * 1e9 + this.hrend[1];
	return parse ? this.parse(number) : number;
};

/**
 * Get the number of ticks.
 * @returns {Number}
 */
Timer.prototype.count = function() {
	return this.ticks.length;
};

/**
 * Return the average duration of all ticks.
 * @returns {number}
 */
Timer.prototype.avg = function(parse) {
	if (this.ticks.length == 0) return 0;

	var avg = this.duration() / this.ticks.length;
	return parse ? this.parse(avg) : avg;
};

/**
 * Return the shortest tick.
 * @returns {number}
 */
Timer.prototype.min = function(parse) {
	if (this.ticks.length == 0) return 0;

	var min = getDiff(this.ticks[0]);
	this.ticks.forEach(function (tick) {
		if (getDiff(tick) < min) {
			min = getDiff(tick);
		}
	});

	return parse ? this.parse(min) : min;
};

/**
 * Return the longest tick.
 * @returns {number}
 */
Timer.prototype.max = function(parse) {
	if (this.ticks.length == 0) return 0;

	var max = 0;
	this.ticks.forEach(function (tick) {
		if (getDiff(tick) > max) {
			max = getDiff(tick);
		}
	});

	return parse ? this.parse(max) : max;
};

/**
 * Return the duration of all ticks.
 * @returns {number}
 */
Timer.prototype.duration = function() {
	var duration = 0;
	for (var i = 0, c = this.ticks.length; i < c; i++) {
		duration += getDiff(this.ticks[i]);
	}
	return duration;
};

/**
 * Get a human readable number in ns, us, ms, s.
 * @param num
 * @returns {string}
 */
Timer.prototype.parse = function (n) {
	if (n < 1e3) {
		return n + 'ns';
	} else if (n >= 1e3 && n < 1e6) {
		return n / 1e3 + 'us';
	} else if (n >= 1e6 && n < 1e9) {
		return n / 1e6 + 'ms';
	} else if (n >= 1e9) {
		return n / 1e9 + 's';
	}
}

/**
 * Get the ID of the timer
 */
Timer.prototype.getID = function() {
	return this.id;
}

/**
 * Get all raw ticks
 */
Timer.prototype.getTicks = function() {
	return this.ticks;
}

/**
 * Module install
 */
exports.install = function() {
	F.execTimer = execTimer;
};

/**
 * Module uninstall
 */
module.exports.uninstall = function() {
	delete F.execTimer;
};