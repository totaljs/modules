var COOKIE = '__flash';
var flash = {};

exports.version = '2.00';
exports.id = 'flash';

exports.usage = function() {
	return flash;
};

F.middleware('flash', function(req, res, resume, options, controller) {

	var id = req.cookie(COOKIE);

	if (!id) {
		id = U.GUID(10);
		res.cookie(COOKIE, id); // session cookie
	}

	if (!flash[id])
		flash[id] = { params: {} };

	var expire = 5;

	if (options && options.expire)
		expire = options.expire || 5;

	flash[id].duration = expire;
	flash[id].expire = Date.now() + ((1000 * 60) * expire); // 5 minutes
	req.$flash = id;
	resume();
});

require('http').IncomingMessage.prototype.flash = function(name, value) {

	var item = flash[this.$flash];
	var params = item.params;
	var now = Date.now();

	if (name === undefined && value === undefined) {
		if (item.expire < now)
			return new Array(0);
		return params;
	}

	if (value === undefined) {
		if (item.expire < now)
			return undefined;
		return params[name];
	}

	item.expire = now + ((1000 * 60) * item.duration);

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
	var now = Date.now();
	for (var m in flash) {
		if (flash[m].expire < now)
			delete flash[m];
	}
});