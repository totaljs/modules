// MIT License
// Copyright Peter Širka <petersirka@gmail.com>

const Events = require('events');
const USERAGENT = 11;
const VERSION = 'v2.0.0';
const EMPTY_SESSION = {};
const EMPTY_USAGE = {};

var SUGAR = 'XY1';
var stats_read = 0;
var stats_write = 0;

function Session() {
	this.options = null;
	this.onRead = function(id, fnCallback) {
		fnCallback(F.cache.read(id));
	};

	this.onWrite = function(id, value) {
		var self = this;
		F.cache.add(id, value, self.options.timeout);
		return self;
	};
}

Session.prototype = new Events.EventEmitter;
Session.prototype._read = function(req, res, next) {

	var self = this;
	var id = req.cookie(self.options.cookie) || '';

	if (!id.length) {
		self._create(res, req, next);
		return self;
	}

	var obj = F.decrypt(id, self.options.secret);
	if (!obj) {
		self._create(res, req, next);
		return self;
	}

	if ('ssid_' + obj.sign !== self._signature(obj.id, req)) {
		self._create(res, req, next);
		return self;
	}

	req._sessionId = obj.id;
	req._session = self;

	stats_read++;

	self.onRead(obj.id, function(session) {
		self.emit('read', req._sessionId, session);
		req.session = session || {};
		next();
	});

	return self;
};

Session.prototype._signature = function(id, req) {
	return id + '|' + req.ip.replace(/\./g, '') + '|' + (req.headers['user-agent'] || '').substring(0, USERAGENT).replace(/\s|\./g, '');
};

Session.prototype._create = function(res, req, next) {

	var self = this;
	var id = U.GUID(10);
	var obj = { id: 'ssid_' + id, sign: self._signature(id, req) };
	var json = F.encrypt(obj, self.options.secret);

	req._sessionId = obj.id;
	req._session = self;
	req.session = {};
	res && res.statusCode && res.cookie(self.options.cookie, json);

	next();
	return self;
};

Session.prototype._write = function(id, obj) {
	var self = this;
	stats_write++;
	self.emit('write', id, obj);
	self.onWrite && self.onWrite(id, obj);
	return self;
};

var session = new Session();

exports.name = 'session';
exports.version = VERSION;
exports.instance = session;

exports.usage = function() {
	EMPTY_USAGE.read = stats_read;
	EMPTY_USAGE.write = stats_write;
	return EMPTY_USAGE;
};

exports.install = function(options) {

	SUGAR = (F.config.name + F.config.version + SUGAR).replace(/\s/g, '');
	session.options = U.extend({ cookie: '__ssid', secret: 'N84', timeout: '5 minutes' }, options, true);

	F.middleware('session', function(req, res, next) {
		if (res.statusCode)
			res.once('finish', () => session._write(req._sessionId, req.session));
		else
			res.socket.on('close', () => session._write(req._sessionId, req.session));
		session._read(req, res, next);
	});
};

exports.uninstall = function() {
	F.uninstall('middleware', 'session');
	session = null;
};