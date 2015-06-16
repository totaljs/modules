var COOKIE = '__flash';
var flash = {};

exports.version = '1.00';
exports.id = 'flash';

exports.usage = function() {
	return flash;
};

F.middleware('flash', function(req, res, resume) {
	var id = req.cookie(COOKIE);

	if (!id) {
		id = U.GUID(10);
		res.cookie(COOKIE, id); // session cookie
	}

	if (!flash[id])
		flash[id] = { params: {} };

	flash[id].expire = Date.now() + ((1000 * 60) * 5); // 5 minutes
	req.$flash = id;
	resume();
});

require('http').IncomingMessage.prototype.flash = function(name, value) {
	var params = flash[this.$flash].params;
	if (name === undefined && value === undefined)
		return params;
	if (value === undefined)
		return params[name];

	if (value instanceof Array) {

		if (!params[name]) {
			params[name] = value;
			return params;
		}

		params[name].push.apply(params[name], value);
		return params;
	}

	if (params[name] instanceof Array)
		params[name].push(value);
	else
		params[name] = [value];
	return params;
};

// Extend controller
F.eval(function() {
	Controller.prototype.flash = function(name, value) {
		return this.req.flash(name, value);
	};
});

F.helpers.flash = function(name) {
	return this.req.flash(name);
};

// Cleaner
F.on('service', function(counter) {
	if (counter % 5 !== 0)
		return;
	var now = Date.now();
	for (var m in flash) {
		if (flash[m].expire < now)
			delete flash[m];
	}
});
