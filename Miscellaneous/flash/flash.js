var COOKIE = '__flash';
var flash = {};

exports.version = 'v3.0.0';
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

	var expire = exports.expire;
	if (options && options.expire)
		expire = options.expire;

	if (!flash[id])
		flash[id] = { params: {}, expire: F.datetime.add(expire).getTime() };

	req.$flash = id;
	resume();
});

require('http').IncomingMessage.prototype.flash = function(name, value) {

	var item = flash[this.$flash];
	var dt = F.datetime;
	var now = dt.getTime();

	if (name === undefined && value === undefined)
		return item.expire < now ? [] : item.params;

	if (value === undefined)
		return item.expire < now ? undefined : item.params[name];

	if (item.expire < now)
		item.params = {};

	item.expire = dt.add(exports.expire).getTime();

	if (value instanceof Array) {
		if (item.params[name])
			item.params[name].push.apply(item.params[name], value);
		else
			item.params[name] = value;
		return item.params;
	}

	if (item.params[name] instanceof Array)
		item.params[name].push(value);
	else
		item.params[name] = [value];

	return item.params;
};

exports.install = function() {
	F.on('service', delegate_service);
};

exports.uninstall = function() {
	F.removeListener(delegate_service);
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
function delegate_service(counter) {
	var now = F.datetime.now();
	for (var m in flash) {
		if (flash[m].expire < now)
			delete flash[m];
	}
}