// MIT License
// Copyright Peter Širka <petersirka@gmail.com>
// Version 1.01

var counter = 0;
var ip = {};
var ban = {};
var ban_length = 0;
var interval = 0;

exports.install = function() {

	framework.onRequest = function(req, res) {

		if (ban_length > 0 && ban[req.ip]) {
			req.connection.destroy();
			return true;
		}

		var count = (ip[req.ip] || 0) + 1;
		ip[req.ip] = count;

		if (count === 1)
			counter++;

		if (count < exports.options.maximum)
			return false;

		ban[req.ip] = exports.options.minutes + 1;
		ban_length++;

		return true;
	};

	setInterval(function() {

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

exports.usage = function() {
	return 'Bans'.padRight(20) + ': ' + ban_length;
};

exports.options = { maximum: 1000, minutes: 5 };