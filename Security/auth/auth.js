// MIT License
// Copyright Peter Širka <petersirka@gmail.com>
// Version 2.00

var events = require('events');
var SUGAR = 'AtH101s84';
var USERAGENT = 20;

// expireCookie in days
// expireSession in minutes

function Users() {
	this.options = { cookie: '__user', secret: 'a4e13bCbb9', expireSession: 10, expireCookie: 10, autoLogin: true };
	this.online = 0;
	this.users = {};
}

Users.prototype = new events.EventEmitter;
Users.prototype.onAuthorize = null;

Users.prototype.usage = function() {
	return { online: this.online };
};

Users.prototype.authorize = function(req, res, flags, callback) {

	var self = this;
	var options = self.options;
	var cookie = req.cookie(options.cookie) || '';

	if (cookie === '' || cookie.length < 10) {
		callback(false);
		return;
	}

	var value = framework.decrypt(cookie, options.secret, false);
	if (!value) {
		callback(false);
		return;
	}

	var arr = value.split('|');

	if (arr[1] !== SUGAR || arr[3] !== req.ip || arr[2] !== req.headers['user-agent'].substring(0, USERAGENT).replace(/\s/g, '')) {
		callback(false);
		return;
	}

	var id = arr[0];
	var user = self.users[id];

	if (user) {
		user.expire = new Date().add('m', self.options.expireSession);
		req.user = user.user;
		callback(true);
		return;
	}

	self.onAuthorize(id, function(user) {

		if (!user || !options.autoLogin) {
			res.cookie(options.cookie, '', new Date().add('d', -1));
			callback(false);
			return;
		}

		req.user = user;
		self.users[id] = { user: user, expire: new Date().add('m', self.options.expireSession) };
		self.emit('login', id, user);
		self.refresh();
		callback(true);

	}, flags);

};

Users.prototype.login = function(controller, id, user, expire) {

	id = id.toString();

	var self = this;

	if (typeof(expire) !== 'number')
		expire = null;

	if (user) {
		self.users[id] = { user: user, expire: utils.isDate(expire) ? expire : new Date().add('m', expire || self.options.expireSession).getTime() };
		self.refresh();
		self.emit('login', id, user);
	}

	self._writeOK(id, controller.req, controller.res);

	return self;
};

Users.prototype.logoff = function(controller, id) {

	id = id.toString();

	var self = this;
	var user = self.users[id];

	delete self.users[id];
	self._writeNO(controller.res);

	self.refresh();
	self.emit('logoff', id, user || null);

	return self;
};

Users.prototype.change = function(id, newUser, expire) {

	id = id.toString();

	var self = this;
	var old = self.users[id] || null;

	if (old === null)
		return self;

	self.users[id].user = newUser;
	self.emit('change', id, newUser, old);

	return self;
};

Users.prototype.update = function(id, fn) {

	id = id.toString();

	var self = this;
	var old = self.users[id] || null;

	if (old === null)
		return null;

	var tmp = fn(old);

	if (tmp)
		self.users[id] = tmp;

	self.emit('update', id, old);

	return self;
};

Users.prototype.setExpires = function(id, expire) {
	id = id.toString();

	var self = this;
	var old = self.users[id] || null;

	if (old === null)
		return self;

	self.users[id].expire = utils.isDate(expire) ? expire : new Date().add('m', expire || self.options.expireSession).getTime();
	return self;
};

Users.prototype.refresh = function() {
	var self = this;
	var keys = Object.keys(self.users);

	self.online = keys.length;
	self.emit('online', self.online);

	return self;
};

Users.prototype.recycle = function() {

	var self = this;
	var keys = Object.keys(self.users);
	var length = keys.length;

	if (length === 0)
		return self;

	var expire = new Date();
	var users = self.users;

	for (var i = 0; i < length; i++) {
		var key = keys[i];
		var user = users[key];
		if (user.expire < expire) {
			self.emit('expire', key, user.user);
			delete users[key];
		}
	}

	self.refresh();
	return self;
};

Users.prototype._writeOK = function(id, req, res) {
	var self = this;
	var value = id + '|' + SUGAR + '|' + req.headers['user-agent'].substring(0, USERAGENT).replace(/\s/g, '') + '|' + req.ip + '|';
	res.cookie(self.options.cookie, framework.encrypt(value, self.options.secret), new Date().add('d', self.options.expireCookie));
	return this;
};

Users.prototype._writeNO = function(res) {
	var self = this;
	res.cookie(self.options.cookie, '', new Date().add('y', -1));
	return self;
};

var users = new Users();
module.exports = users;
module.exports.name = module.exports.id = 'auth';
module.exports.version = '2.00';

function service(counter) {
	// Each 3 minutes
	if (counter % 3 === 0)
		users.recycle();
}

function authorization(req, res, flags, callback) {
	if (users.onAuthorize !== null)
		users.authorize(req, res, flags, callback);
	else
		callback(false);
}

module.exports.install = function() {

	// Backward compatibility
	var options = framework.version >= 1900 ? arguments[0] : arguments[1];

	SUGAR = (framework.config.name + framework.config.version + SUGAR).replace(/\s/g, '');

	if (framework.version >= 1940)
		framework.onAuthorize = authorization;
	else
		framework.onAuthorization = authorization;

	framework.on('service', service);

	if (options)
		users.options = Utils.copy(options);

	this.emit('auth', users);
};

module.exports.uninstall = function() {
	if (framework.onAuthorize === authorization)
		framework.onAuthorize = null;
	framework.removeListener('service', service);
};