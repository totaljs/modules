var COOKIE = '__flash';
var flash = {};

exports.version = 'v3.0.0';
exports.id = 'flash';
exports.expire = '5 minutes';

exports.usage = function() {
	return flash;
};

const Flash = function(name, value) {

	var item = flash[this.$flash];
	var dt = NOW;
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

MIDDLEWARE('flash', function(req, res, resume, options) {

	var id = req.cookie(COOKIE);

	if (!id) {
		id = GUID(10);
		res.cookie(COOKIE, id); // a session cookie
	}

	req.flash = Flash;

	var expire = exports.expire;
	if (options && options.expire)
		expire = options.expire;

	!flash[id] && (flash[id] = { params: {}, expire: NOW.add(expire).getTime() });
	req.$flash = id;
	resume();
});

exports.install = function() {
	ON('service', service);
};

exports.uninstall = function() {
	OFF('service', service);
};

// Extends controller
Controller.prototype.flash = function(name, value) {
	return this.req.flash(name, value);
};

DEF.helpers.flash = function(name) {
	return this.req.flash(name);
};

// Cleaner
function service() {
	var now = Date.now();
	for (var m in flash)
		flash[m].expire < now && (delete flash[m]);
}