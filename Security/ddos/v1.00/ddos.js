/**
 * @module DDOS
 * @version v1.0
 * @author Peter Širka
 */

var counter = 0;
var ip = {};
var ban = {};
var ban_length = 0;
var interval = 0;
var intervalService;

exports.name = 'ddos';
exports.version = 'v1.01';
exports.options = null;

exports.install = function(framework, options) {

	exports.options = Utils.extend({ maximum: 1000, minutes: 5 }, options);

	framework.middleware('ddos', function(req, res, next, options, controller) {

		if (req.isStaticFile) {
			next();
			return;
		}

		if (ban_length > 0 && ban[req.ip]) {
			res.success = true;
			framework.stats.response.destroy++;
			framework._request_stats(false, req.isStaticFile);
			req.connection.destroy();
			next();
			return;
		}

		var count = (ip[req.ip] || 0) + 1;
		ip[req.ip] = count;

		if (count === 1)
			counter++;

		if (count < exports.options.maximum) {
			next();
			return;
		}

		ban[req.ip] = exports.options.minutes + 1;
		ban_length++;

		next();
	});

	framework.use('ddos');

	intervalService = setInterval(function() {

		interval++;

		var keys;
		var length;
		var count;

		if (ban_length > 0 && interval % 60 === 0) {
			keys = Object.keys(ban);
			length = keys.length;
			count = 0;
			for (var i = 0; i < length; i++) {
				var key = keys[i];
				if (ban[key]-- > 0)
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

			if (count > 0)
				continue;

			counter--;
			delete ip[key];

		}

		if (counter < 0)
			counter = 0;

	}, 1000);
};

exports.uninstall = function(framework, options) {
	framework.uninstall('middleware', 'ddos');
	clearInterval(intervalService);
};

exports.usage = function() {
	return { bans: ban_length };
};

/**
 * Reset bans
 */
exports.reset = function() {
	counter = 0;
	ip = {};
	ban = {};
	ban_length = 0;
	return this;
};