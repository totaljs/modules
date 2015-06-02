// MIT License
// Copyright Peter Širka <petersirka@gmail.com>

var db = {};

exports.name = 'protection';
exports.version = 'v1.01';
exports.options = { max: 5, timeout: 3 };

exports.install = function() {
	framework.on('service', service);
};

exports.uninstall = function() {
	framework.removeListener('service', service);
};

exports.usage = function() {
	return db;
};

function service(interval) {

	if (interval % exports.options.timeout !== 0)
		return;

	var arr = Object.keys(db);
	for (var i = 0, length = arr.length; i < length; i++) {
		var key = arr[i];
		db[key]--;
		if (db[key] <= 0)
			delete db[key];
	}
}

/**
 * Can continue?
 * @param {String} name
 * @param {Number} max Maximum count. (optional)
 * @return {Boolean} Can continue or no?
 */
exports.can = function(name, max) {

	if (db[name] === undefined)
		db[name] = 1;
	else
		db[name]++;

	if (max === undefined)
		max = exports.options.max;

	return db[name] < max;
};

/**
 * Reset state
 */
exports.reset = function(name) {

	var self = this;

	if (name === undefined) {
		db = {};
		return self;
	}

	delete db[name];
	return self;
};