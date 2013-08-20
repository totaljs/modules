// Copyright Peter Širka, Web Site Design s.r.o. (www.petersirka.sk)
// Version 1.01

var events = require('events');
var SUGAR = 'A12B';
var USERAGENT = 15;

function Session() {

	this.options = { cookie: '__session', secret: 'Njas1984' };

	/*
		Read session
		@id {String}
		fnCallback {Function} :: param - is value from DB
	*/
	this.onRead = null;

	/*
		Write session
		@id {String}
		@obj {Object}
	*/
	this.onWrite = null;
}

Session.prototype = new events.EventEmitter;

Session.prototype._read = function(res, req, next, controller) {

	var self = this;
	var id = req.cookie(self.options.cookie) || '';

	if (id.length === 0) {
		self._create(res, req, next, controller);
		return self;
	}

	var obj = self.framework.decode(id, self.options.secret);
	if (obj === null) {
		self._create(res, req, next, controller);
		return self;
	}

	if ('session_' + obj.signature !== self._signature(obj.id, req)) {
		self._create(res, req, next, controller);
		return self;
	}

	req._sessionId = obj.id;
	req._session = self;

	self.onRead(obj.id, function(session) {
		self.emit('read', req._sessionId, session);
		req.session = session || {};
		controller.session = req.session;
		next();
	});

	return self;
};

Session.prototype._signature = function(id, req) {
	return id + '|' + req.ip + '|' + req.headers['user-agent'].substring(0, USERAGENT).replace(/\s/g, '');
};

Session.prototype._create = function(res, req, next) {

	var self = this;
	var id = utils.GUID(10);
	var obj = { id: 'ssid_' + id, signature: self._signature(id, req) };
	var json = self.framework.encode(obj, self.options.secret);

	req._sessionId = obj.id;
	req._session = self;
	req.session = {};

	res.cookie(self.options.cookie, json);

	next();

	return self;
};

Session.prototype._write = function(id, obj) {
	var self = this;

	self.emit('write', id, obj);

	if (self.onWrite !== null)
		self.onWrite(id, obj);

	return self;
};

module.exports = new Session();

module.exports.install = function(framework) {

	var self = this;

	SUGAR = (framework.config.name + framework.config.version + SUGAR).replace(/\s/g, '');

	self.framework = framework;

	self.framework.on('request-end', function(req, res) {
		var self = this;
		self.module('session')._write(req._sessionId, req.session);
	});

	self.framework.partial(function(next) {
		var self = this;
		self.module('session')._read(self.res, self.req, next, self);
	});
};