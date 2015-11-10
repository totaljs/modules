var Fs = require('fs');
var cache;
var filename;

exports.install = function() {
	cache = U.copy(F.stats.request);
	filename = F.path.databases('reqstats.json');

	F.on('service', function(interval) {

		if (interval % 5 !== 0)
			return;

		Fs.readFile(filename, function(err, data) {
			var stats;

			if (err) {
				stats = {};
			} else {
				stats = data.toString('utf8').parseJSON();
				if (!stats)
					stats = {};
			}

			diff(F.stats.request, cache, stats);
			Fs.writeFile(filename, JSON.stringify(stats), NOOP);
		});
	});
};

function diff(current, cache, file) {
	var keys = Object.keys(current);
	for (var i = 0, length = keys.length; i < length; i++) {
		var key = keys[i];
		var diff = current[key] - cache[key];
		cache[key] = current[key];
		if (diff < 0)
			continue;
		if (!file[key])
			file[key] = 0;
		file[key] += diff;
	}
	return file;
}