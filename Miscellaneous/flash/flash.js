var COOKIE = '__flash';
var flash = {};

exports.version = '3.0.0';
exports.id = 'flash';
exports.expire = '5 minutes';

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

	var expire = exports.expire;
	if (options && options.expire)
		expire = options.expire;

	flash[id].expire = new Date().add(expire).getTime();
	req.$flash = id;
	resume();
});

require('http').IncomingMessage.prototype.flash = function(name, value) {

	var item = flash[this.$flash];
	var dt = new Date();
	var now = dt.getTime();

	if (name === undefined && value === undefined) {
		if (item.expire < now)
			return new Array(0);
		return item.params;
	}

	if (value === undefined) {
		if (item.expire < now)
			return undefined;
		return item.params[name];
	}

	if (item.expire < now)
		item.params = {};

	item.expire = dt.add(exports.expire).getTime();

	if (value instanceof Array) {
		if (!item.params[name]) {
			item.params[name] = value;
			return item.params;
		}

		item.params[name].push.apply(item.params[name], value);
		return item.params;
	}

	if (item.params[name] instanceof Array)
		item.params[name].push(value);
	else
		item.params[name] = [value];

	return item.params;
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