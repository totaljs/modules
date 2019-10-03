const Fs = require('fs');

// Constants
const FLAGS = ['get'];
const FLAGSNOTIFY = ['post', 'json'];
const SYNCMETA = '10 minutes';
const EXPIRE = '10 minutes';
const BLOCKEDTIMEOUT = '15 minutes';
const SESSIONINTERVAL = 7; // in minutes
const AUTOSYNCINTERVAL = 2; // in minutes
const LIMIT = 100; // max. items per page
const ERR_SERVICES_TOKEN = 'OpenPlatform token is invalid.';

// Variables
var OP = global.OP = {};
var autosyncitems = [];
var autosyncrunning = 0;
var autosyncpending = [];

// Registers a file route
FILE('/openplatform.json', function(req, res) {
	res.file(PATH.root('openplatform.json'));
});

OP.version = 1.006;
OP.meta = null;

Fs.readFile(PATH.root('openplatform.json'), function(err, data) {
	if (data) {
		OP.meta = data.toString('utf8').parseJSON(true);
		if (OP.meta)
			OP.meta.save = () => Fs.writeFile(PATH.root('openplatform.json'), JSON.stringify(OP.meta, null, '\t'), NOOP);
	}
});

OP.init = function(meta, next) {
	next(null, meta);
};

OP.options = {};
OP.options.meta = true;
OP.options.debug = false;

OP.users = {};
// OP.users.auth(options, callback);
// OP.users.autosync(interval, init_options, options, process, after, before);
// OP.users.badge(url, callback);
// OP.users.logout(user);
// OP.users.notify(url, msg, callback);
// OP.users.sync(options, process, done);

// Internal repository (temporary in-memory databases)
OP.sessions = {};
OP.platforms = {};
OP.blocked = {};
OP.services = {};

// Internal error handling
OP.error = function(method, err) {
	console.log('Error: OP.' + method, err);
};

OP.users.autosync = function(interval, init, options, process, done, before) {
	autosyncitems.push({ id: 'autosync' + GUID(10), interval: interval, init: init, options: options, process: process, done: done, before: before });
};

function initpending(platform, err) {
	for (var i = 0; i < platform.pending.length; i++) {
		var tmp = platform.pending[i];
		if (err) {
			tmp.callback(err);
		} else {
			OP.sessions[tmp.key] = tmp.user;
			tmp.callback(null, tmp.user);
		}
	}
	platform.pending.length = 0;
}

OP.services.init = function(meta, next) {
	// meta.id
	// meta.openplatformid
	// meta.directoryid
	// meta.userid
	// meta.verifytoken
	// meta.servicetoken
	// next(null, true);
	next(null, false);
};

OP.services.check = function(controller, callback) {

	var arr = (controller.headers['x-openplatform'] || '').split('-');

	if (!arr[0] && !arr[3]) {
		controller.invalid('error-openplatform-token', ERR_SERVICES_TOKEN);
		return;
	}

	var meta = {};
	meta.openplatformid = arr[0];
	meta.directoryid = arr[1];
	meta.verifytoken = arr[2];
	meta.userid = arr[3];
	meta.servicetoken = arr[4];

	if (meta.verifytoken || meta.directoryid)
		meta.id = (meta.openplatformid + '-' + (meta.verifytoken || '0') + '-' + (meta.directoryid || '0')).crc32(true);

	var id = meta.id + '';
	var platform = OP.platforms[id];
	if (platform == null) {
		OP.services.init(meta, function(err, is) {
			if (is)
				callback(err, meta);
			else
				controller.invalid('error-openplatform-token', ERR_SERVICES_TOKEN);
		});
	} else if (platform.id == id && platform.servicetoken === meta.servicetoken)
		callback(null, meta);
	else
		controller.invalid('error-openplatform-token', ERR_SERVICES_TOKEN);

};

// Users
OP.auth = OP.users.auth = function(options, callback) {

	// options.url {String}
	// options.expire {String}

	var key = 'session' + options.url.hash();
	var user = OP.sessions[key];

	if (user) {
		callback(null, user);
		return;
	}

	REQUEST(options.url, FLAGS, function(err, response) {

		err && OP.options.debug && OP.error('users.auth', err);

		var meta = response.parseJSON(true);
		if (meta instanceof Array) {
			err = meta[0] ? meta[0].error : response;
			OP.options.debug && OP.error('users.auth', err);
			callback(err);
			return;
		}

		if (meta && meta.id) {

			// meta.id === this "appid" in OpenPlatform
			var blocked = OP.blocked[meta.openplatformid];
			if (blocked) {
				callback(blocked.err);
				return;
			}

			var profile = meta.profile;
			var raw = meta;
			var rawid = meta.openplatformid;

			if (meta.verifytoken || profile.directoryid)
				meta.openplatformid = (meta.openplatformid + '-' + (meta.verifytoken || '0') + '-' + (profile.directoryid || '0')).crc32(true);

			var id = meta.openplatformid + '';
			var platform = OP.platforms[id] || {};
			var init = false;

			profile.openplatformid = id;
			profile.sessionid = key;
			profile.expire = NOW.add(options.expire || EXPIRE);

			if (!platform.id) {
				platform.id = id;
				platform.directoryid = profile.directoryid;
				platform.directory = profile.directory;
				platform.openplatformid = meta.openplatformid;
				platform.name = meta.name;
				platform.email = meta.email;
				platform.url = meta.openplatform;
				platform.urlmeta = meta.meta;
				platform.users = meta.users;
				platform.apps = meta.apps;
				platform.services = meta.services;
				platform.servicetoken = meta.servicetoken;
				platform.sn = meta.sn;
				platform.settings = meta.settings || EMPTYOBJECT;
				platform.dtsync = NOW;
				platform.isloading = true;
				platform.pending = [];
				platform.cache = {};
				OP.platforms[id] = platform;
				init = true;
			}

			if (err) {
				callback(err);
				return;
			}

			profile.filter = [profile.id];

			if (profile.roles) {
				for (var i = 0; i < profile.roles.length; i++)
					profile.filter.push('@' + profile.roles[i]);
			}

			if (profile.groups) {
				for (var i = 0; i < profile.groups.length; i++)
					profile.filter.push('#' + profile.groups[i]);
			}

			var user = new OpenPlatformUser(profile, platform);

			if (!init && platform.isloading) {
				// Waits for loading OP
				platform.pending.push({ callback: callback, user: user, key: key });
				return;
			}

			var is = !init;
			var syncmeta = is ? platform.dtsync.add(options.sync || SYNCMETA) < NOW : true;
			if (syncmeta) {

				// Update platform meta data
				if (!init) {
					platform.name = meta.name;
					platform.email = meta.email;
					platform.url = meta.openplatform;
					platform.urlmeta = meta.meta;
					platform.users = meta.users;
					platform.apps = meta.apps;
					platform.services = meta.services;
					platform.sn = meta.sn;
					platform.settings = meta.settings || EMPTYOBJECT;
				}

				if (options.url.substring(0, meta.openplatform.length) !== meta.openplatform || rawid !== meta.openplatform.crc32(true)) {
					err = 'Invalid OpenPlatform meta data.';
					platform.isloading = false;
					OP.blocked[platform.id] = { expire: NOW.add(BLOCKEDTIMEOUT), err: err };
					platform.pending.length && initpending(platform, err);
					callback(err);
					return;
				}

				platform.dtsync = NOW;

				// Init new OpenPlatform
				OP.init(platform, function(err) {

					if (err) {
						platform.isloading = false;
						OP.blocked[platform.id] = { expire: NOW.add(BLOCKEDTIMEOUT), err: err };
						callback(err);
						platform.pending.length && initpending(platform, err);
						return;
					}

					if (OP.options.meta && meta.meta) {
						REQUEST(meta.meta, FLAGS, function(err, response) {
							OP.sessions[key] = user;
							platform.isloading = false;
							err && OP.options.debug && OP.error('users.auth', err);
							platform.meta = response ? response.parseJSON(true) : EMPTYOBJECT;
							callback(null, user, 2, is, raw);
							autosyncitems.length && autosyncforce(platform);
							platform.pending.length && initpending(platform);
						});
					} else {
						OP.sessions[key] = user;
						platform.isloading = false;
						platform.meta = EMPTYOBJECT;
						callback(null, user, 2, is, raw);
						autosyncitems.length && autosyncforce(platform);
						platform.pending.length && initpending(platform);
					}
				});
			} else {
				OP.sessions[key] = user;
				platform.isloading = false;
				callback(null, user, 1, is, raw);
				platform.pending.length && initpending(platform);
			}

		} else
			callback(err);
	});
};

OP.users.logout = function(user) {
	var profile = user.profile;
	var session = OP.sessions[profile.sessionid];
	if (session) {
		delete OP.sessions[profile.sessionid];
		return true;
	}
};

OP.users.sync = function(options, process, done) {

	// options.url
	// options.fields

	var counter = 0;
	var paginate = function(page) {

		RESTBuilder.make(function(builder) {

			var filter = { page: page, limit: options.limit || LIMIT };

			if (options.removed)
				filter.removed = true;

			if (options.modified)
				filter.modified = options.modified;

			if (options.fields)
				filter.fields = options.fields instanceof Array ? options.fields.join(',') : options.fields;

			if (options.id)
				filter.id = options.id instanceof Array ? options.id.join(',') : options.id;

			if (options.appid)
				filter.appid = options.appid;

			if (options.role)
				filter.role = options.role;

			if (options.group)
				filter.group = options.group;

			if (options.q)
				filter.q = options.q;

			if (options.ou)
				filter.ou = options.ou;

			if (options.locality)
				filter.locality = options.locality;

			if (options.company)
				filter.company = options.company;

			if (options.directory)
				filter.directory = options.directory;

			if (options.statusid)
				filter.statusid = options.statusid;

			if (options.customer)
				filter.customer = 'true';

			if (options.all)
				filter.all = 'true';

			if (options.reference)
				filter.reference = options.reference;

			if (options.online)
				filter.online = 'true';

			if (options.logged)
				filter.logged = options.logged;

			builder.url(options.url);
			builder.get(filter);

			builder.exec(function(err, response, output) {

				err && OP.options.debug && OP.error('users.sync', err);

				// Error
				if (err) {
					OP.options.debug && OP.error('users.sync', err);
					done(err, counter);
					return;
				}

				if (response instanceof Array || !response.items) {
					err = response[0] ? response[0].error : output.response;
					OP.options.debug && OP.error('users.sync', err);
					done(err, counter);
					return;
				}

				counter += response.items.length;
				process(response.items, function() {
					page++;
					if (page > response.pages)
						done && done(null, counter);
					else
						paginate(page);
				}, options.platform, (page / response.pages) * 100, page - 1);
			});
		});
	};

	paginate(1);
};

OP.users.notify = function(url, msg, callback) {

	// msg.type
	// msg.body
	// msg.data

	if (msg.type == null)
		msg.type = 1;

	var cb = callback ? function(err, response) {
		callback(err, response.parseJSON(true));
	} : null;

	REQUEST(url, FLAGSNOTIFY, msg, cb);
};

OP.users.badge = function(url, callback) {
	var cb = callback ? function(err, response) {
		callback(err, response.parseJSON(true));
	} : null;
	REQUEST(url, FLAGS, cb);
};

ON('service', function(counter) {

	var keys;

	if (counter % SESSIONINTERVAL === 0) {
		// Clears all expired sessions
		keys = Object.keys(OP.sessions);
		for (let i = 0; i < keys.length; i++) {
			let key = keys[i];
			if (OP.sessions[key].expire < NOW)
				delete OP.sessions[key];
		}

		// Clears blocked platforms
		keys = Object.keys(OP.blocked);
		for (let i = 0; i < keys.length; i++) {
			let key = keys[i];
			if (OP.blocked[key].expire < NOW)
				delete OP.blocked[key];
		}
	}

	if (counter % AUTOSYNCINTERVAL === 0) {
		keys = Object.keys(OP.platforms);
		for (let i = 0; i < keys.length; i++)
			autosyncforce(OP.platforms[keys[i]]);
	}

});

var firstdate = { sk: 1, cs: 1, hr: 1, bg: 1, bs: 1, az: 1, sq: 1, de: 1, hu: 1, pl: 1, uk: 1, tr: 1, tk: 1, tt: 1, sv: 1, es: 1, sl: 1, sr: 1, ru: 1, ro: 1, pt: 1, no: 1, nb: 1, nn: 1, mk: 1, lb: 1, lv: 1, la: 1, it: 1, el: 1, ka: 1, fr: 1, da: 1 };

function OpenPlatformUser(profile, platform) {

	var self = this;

	// Basic public data
	self.id = profile.id;
	self.openplatformid = platform.id;
	self.darkmode = profile.darkmode;
	self.dateformat = profile.dateformat;
	self.datefdow = firstdate[profile.language] || 0;
	self.email = profile.email;
	self.filter = profile.filter;
	self.language = profile.language;
	self.name = profile.name;
	self.photo = profile.photo;
	self.roles = profile.roles;
	self.sa = profile.sa;
	self.status = profile.status;
	self.statusid = profile.statusid;
	self.timeformat = profile.timeformat;
	self.dtlogged = NOW;

	// Internal
	self.profile = profile;
	self.platform = platform;
}

const OPU = OpenPlatformUser.prototype;

OPU.permit = function(type, arr) {

	var self = this;
	if (!arr.length)
		return type;

	type = type.split('');
	for (var i = 0; i < self.filter.length; i++) {
		for (var j = 0; j < type.length; j++) {
			if (arr.indexOf(type[j] + self.filter[i]) !== -1)
				return type[j];
		}
	}
};

OPU.permissions = function(type, arr) {
	var self = this;
	if (!arr || !arr.length)
		return type;
	type = type.split('');
	var permissions = {};
	for (var i = 0; i < self.filter.length; i++) {
		for (var j = 0; j < type.length; j++) {
			if (arr.indexOf(type[j] + self.filter[i]) !== -1)
				permissions[type[j]] = 1;
		}
	}
	return Object.keys(permissions).join('');
};

OPU.copy = function() {
	var obj = {};
	for (var i = 0; i < arguments.length; i++) {
		var key = arguments[i];
		obj[key] = this[key];
	}
	return obj;
};

const OPUBLACKLIST = { profile: 1, platform: 1 };

OPU.json = function() {
	var obj = {};
	var keys = Object.keys(this);
	for (var i = 0; i < keys.length; i++) {
		var key = keys[i];
		if (!OPUBLACKLIST[key])
			obj[key] = this[key];
	}
	return obj;
};

OPU.notify = function(type, message, data, callback) {

	if (typeof(data) === 'function') {
		callback = data;
		data = undefined;
	}

	var msg = {};
	msg.type = type;
	msg.message = message;

	if (data)
		msg.data = data;

	var profile = this.profile;
	profile.notifications && OP.users.notify(profile.notify, msg, callback);
};

OPU.badge = function(callback) {
	OP.users.badge(this.profile.badge, callback);
};

OPU.logout = function() {
	return OP.users.logout(this);
};

OPU.service = function(app, service, data, callback) {
	RESTBuilder.POST(this.platform.services + '&app=' + app + '&service=' + service, data).callback(callback);
};

OPU.cl = function() {
	return this.platform.meta;
};

// Prototypes
OP.OpenPlatformUser = OpenPlatformUser;

// Very important internal method for auto-sync
function autosyncforce(platform) {

	if (autosyncrunning > 3) {
		autosyncpending.push(platform);
		return;
	}

	autosyncrunning++;

	autosyncitems.wait(function(sync, next) {

		var dt = platform.cache[sync.id];

		// Can we synchronize?
		if (dt && dt.add(sync.interval) > NOW) {
			next();
			return;
		}

		// Synchronize users
		platform.cache[sync.id] = NOW;

		// Is initial options nullable?
		if ((dt == null && !sync.init) || (sync.before && sync.before(platform) === false)) {
			sync.dtsync = NOW;
			next();
			return;
		}

		sync.running++;

		var opt = CLONE(dt == null ? sync.init : sync.options);
		opt.url = platform.users;
		opt.platform = platform;

		OP.users.sync(opt, sync.process, function(err, count) {
			sync.done && sync.done(err, count, platform);
			sync.dtsync = NOW;
			sync.running--;
			next();
		});

	}, function() {

		// DONE
		autosyncrunning--;

		// Is some pending sync?
		var pending = autosyncpending.shift();
		pending && autosyncforce(pending);
	});
}