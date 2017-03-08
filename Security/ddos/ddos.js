// MIT License
// Copyright Peter Širka <petersirka@gmail.com>

var counter = 0;
var ip = {};
var ban = {};
var ban_length = 0;
var interval = 0;
var service = 0;
var whitelist = ['127.0.0.1'];

exports.name = 'ddos';
exports.version = 'v2.0.0';
exports.options = null;

exports.install = function(options) {
	exports.options = U.extend({ maximum: 1000, minutes: 5 }, options);
	F.middleware('ddos', function(req, res, next, options) {

		if (req.isStaticFile || whitelist.indexOf(req.ip) > -1) {
			next();
			return;
		}

		if (ban_length && ban[req.ip]) {
			res.success = true;
			F.stats.response.destroy++;
			F._request_stats(false, req.isStaticFile);
			req.connection.destroy();
			next = null;
			return false;
		}

		var count = (ip[req.ip] || 0) + 1;
		ip[req.ip] = count;

		if (count === 1)
			counter++;

		if (count > exports.options.maximum) {
			ban[req.ip] = exports.options.minutes + 1;
			ban_length++;
		}

		next();
	});

	F.use('ddos');

	service = setInterval(function() {

		interval++;

		var keys;
		var length;
		var count;

		if (ban_length && interval % 60 === 0) {
			keys = Object.keys(ban);
			length = keys.length;
			count = 0;
			for (var i = 0; i < length; i++) {
				var key = keys[i];
				if (ban[key]--)
					continue;
				ban_length--;
				delete ban[key];
			}
			if (ban_length < 0)
				ban_length = 0;
		}

		if (counter <= 0)
			return;

		keys = Object.keys(ip);
		length = keys.length;
		counter = length;

		for (var i = 0; i < length; i++) {
			var key = keys[i];
			var count = ip[key]--;
			if (count) {
				counter--;
				delete ip[key];
			}
		}

		if (counter < 0)
			counter = 0;

	}, 1000);
};

exports.uninstall = function() {
	F.uninstall('middleware', 'ddos');
	clearInterval(service);
};

exports.usage = function() {
	return { bans: ban_length };
};

exports.reset = function() {
	counter = 0;
	ip = {};
	ban = {};
	ban_length = 0;
	return this;
};