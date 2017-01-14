const Fs = require('fs');
var cache;
var filename;

exports.version = 'v2.0.0';

exports.install = function() {
	cache = U.copy(F.stats.request);
	filename = F.path.databases('reqstats.json');
	F.on('service', delegate_service);
};

exports.uninstall = function() {
	F.removeListener(delegate_service);
	delegate_service(5);
};

function delegate_service(interval) {

	if (interval % 5 !== 0)
		return;

	Fs.readFile(filename, function(err, data) {

		var stats;
		var key = F.datetime.format('yyyy-MM');

		if (err) {
			stats = {};
		} else {
			stats = data.toString('utf8').parseJSON();
			if (!stats)
				stats = {};
		}

		stats[key] = diff(F.stats.request, cache, stats, key);
		Fs.writeFile(filename, JSON.stringify(stats), NOOP);
	});
}

exports.stats = function(callback) {
	Fs.readFile(filename, function(err, data) {
		var stats;
		if (data)
			stats = data.toString('utf8').parseJSON();
		if (!stats)
			stats = {};
		callback(null, stats);
	});
};

function diff(current, cache, file, key) {
	var keys = Object.keys(current);
	var store = file[key];

	if (!store)
		store ={};

	for (var i = 0, length = keys.length; i < length; i++) {
		var key = keys[i];
		var diff = current[key] - cache[key];
		cache[key] = current[key];
		if (diff < 0)
			continue;
		if (!store[key])
			store[key] = 0;
		store[key] += diff;
	}
	return store;
}