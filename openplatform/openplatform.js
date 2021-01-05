const Fs = require('fs');

// Constants
const SYNCMETA = '10 minutes';
const EXPIRE = '10 minutes';
const BLOCKEDTIMEOUT = '15 minutes';
const SESSIONINTERVAL = 7; // in minutes
const AUTOSYNCINTERVAL = 2; // in minutes
const LIMIT = 100; // max. items per page
const LIMITREVISIONS = 7;
const ERR_SERVICES_TOKEN = 'OpenPlatform token is invalid.';

// Variables
var OP = global.OP = {};
var autosyncitems = [];
var autosyncrunning = 0;
var autosyncpending = [];

OP.metafile = {};
OP.metafile.url = '/openplatform.json';
OP.metafile.filename = PATH.root('openplatform.json');

// Registers a file route
ON('ready', function() {
	FILE(OP.metafile.url, function(req, res) {
		res.file(OP.metafile.filename);
	});
	Fs.readFile(OP.metafile.filename, function(err, data) {
		if (data) {
			OP.meta = data.toString('utf8').parseJSON(true);
			if (OP.meta)
				OP.meta.save = () => Fs.writeFile(OP.metafile.filename, JSON.stringify(OP.meta, null, '\t'), NOOP);
		}
		EMIT('openplatform_ready', OP.meta);
	});
});

// Applies localization
LOCALIZE(req => req.query.language);

OP.version = 1.021;
OP.meta = null;

OP.init = function(meta, next) {
	next(null);
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

OP.services.route = function(url, callback) {
	ROUTE('POST ' + url, function() {
		OP.services.check(this, callback);
	});
};

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
	meta.directoryid = +arr[1];
	meta.verifytoken = arr[2];
	meta.userid = arr[3];
	meta.servicetoken = arr[4];

	if (meta.verifytoken || meta.directoryid)
		meta.openplatformid = (meta.openplatformid + '-' + (meta.verifytoken || '0') + '-' + (meta.directoryid || '0')).crc32(true) + '';

	var id = meta.openplatformid;
	var key = 'services' + id;
	var platform = OP.platforms[key];

	if (platform && platform.dtexpire < NOW) {
		platform.openplatformid = id;
		platform.directoryid = meta.directoryid;
		platform.verifytoken = meta.verifytoken;
		platform.servicetoken = meta.servicetoken;
		meta = platform;
		platform = null;
	}

	if (platform) {
		if (platform.id == id && platform.servicetoken === meta.servicetoken)
			callback.call(controller, null, meta, controller);
		else {
			delete OP.platforms[key];
			controller.invalid('error-openplatform-token', ERR_SERVICES_TOKEN);
		}
	} else {
		meta.id = id;
		OP.services.init(meta, function(err, is) {
			if (is) {
				meta.dtexpire = NOW.add(SYNCMETA);
				OP.platforms[key] = meta;
				callback.call(controller, err, meta, controller);
			} else
				controller.invalid('error-openplatform-token', ERR_SERVICES_TOKEN);
		});
	}
};

// Users
OP.users.auth = function(options, callback) {

	// options.url {String}
	// options.rev {String}
	// options.expire {String}

	// Meta aren't loaded, we need to wait
	if (!OP.meta) {
		setTimeout(OP.users.auth, 500, options, callback);
		return;
	}

	if (OP.meta.openplatform && OP.meta.openplatform.length) {
		var is = false;
		for (var i = 0; i < OP.meta.openplatform.length; i++) {
			if (options.url.substring(0, OP.meta.openplatform[i].length) === OP.meta.openplatform[i]) {
				is = true;
				break;
			}
		}
		if (!is) {
			callback('error-openplatform-hostname');
			return;
		}
	}

	var key = 'session' + options.url.hash(true);
	var user = OP.sessions[key];

	if (user && (!options.rev || user.profile.rev === options.rev)) {
		callback(null, user);
		return;
	}

	if (user && options.rev && user.profile.rev && user.profile.rev !== options.rev) {

		if (user.profile.revcount)
			user.profile.revcount++;
		else
			user.profile.revcount = 1;

		// A simple protection for chaning count of revisions
		if (user.profile.revcount > LIMITREVISIONS) {
			callback(null, user);
			return;
		}
	}

	var iscloud = options.url.substring(0, 25) === 'https://openplatform.app/';

	RESTBuilder.GET(options.url).callback(function(err, response) {

		err && OP.options.debug && OP.error('users.auth', err);

		var meta = response;
		if (meta instanceof Array) {
			err = meta[0] ? meta[0].error : response;
			OP.options.debug && OP.error('users.auth', err);
			callback(err);
			return;
		}

		if (!iscloud && meta.url !== OP.meta.url) {
			callback('URL addresses do not match between OpenPlatform and application');
			return;
		}

		if (meta && meta.id) {

			// meta.id === this "appid" in OpenPlatform
			var blocked = OP.blocked[meta.openplatformid];
			if (blocked) {
				callback(blocked.err, null, null, null, meta);
				return;
			}

			var profile = iscloud ? meta : meta.profile;
			var raw = meta;
			var rawid = meta.openplatformid;

			if (!iscloud && (meta.verifytoken || profile.directoryid))
				meta.openplatformid = (meta.openplatformid + '-' + (meta.verifytoken || '0') + '-' + (profile.directoryid || '0')).crc32(true);

			var id = meta.openplatformid + '';
			var platform = OP.platforms[id] || {};
			var init = false;

			profile.rev = options.rev;
			profile.openplatformid = id;
			profile.sessionid = key;
			profile.expire = NOW.add(options.expire || EXPIRE);

			if (!platform.id) {
				platform.id = id;
				platform.cloud = iscloud;
				platform.directoryid = profile.directoryid;
				platform.directory = profile.directory;
				platform.openplatformid = meta.openplatformid;

				if (iscloud) {
					platform.name = meta.group.name;
					platform.email = meta.group.email;
					platform.users = meta.group.users;
					platform.settings = EMPTYOBJECT;
					platform.url = 'https://openplatform.app';
				} else {
					platform.name = meta.name;
					platform.email = meta.email;
					platform.url = meta.openplatform;
					platform.urlmeta = meta.meta;
					platform.users = meta.users;
					platform.apps = meta.apps;
					platform.services = meta.services;
					platform.servicetoken = meta.servicetoken;
					platform.settings = meta.settings || EMPTYOBJECT;
				}

				platform.sn = meta.sn;
				platform.dtsync = NOW;
				platform.isloading = true;
				platform.pending = [];
				platform.cache = {};

				platform.sync_users = function(options, processor, done) {

					if (!platform.users) {
						done && done();
						return;
					}

					options.url = platform.users;
					OP.users.sync(options, processor, done);
				};

				OP.platforms[id] = platform;
				init = true;
			}

			if (err) {
				callback(err, null, null, null, raw);
				return;
			}

			profile.filter = [profile.id];

			if (iscloud) {
				profile.roles = [profile.role];
				profile.groups = [];
				profile.filter.push('@' + profile.role);
			} else {
				if (profile.roles) {
					for (var i = 0; i < profile.roles.length; i++)
						profile.filter.push('@' + profile.roles[i]);
				} else
					profile.roles = [];

				if (profile.groups) {
					for (var i = 0; i < profile.groups.length; i++)
						profile.filter.push('#' + profile.groups[i]);
				} else
					profile.groups = [];

				profile.services = meta.services;
				profile.apps = meta.apps;
				profile.users = meta.users;
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
					if (iscloud) {
						platform.name = meta.group.name;
						platform.email = meta.group.email;
						platform.users = meta.group.users;
					} else {
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
					}
				}

				if (!iscloud && (options.url.substring(0, meta.openplatform.length) !== meta.openplatform || rawid !== meta.openplatform.crc32(true))) {
					err = 'Invalid OpenPlatform meta data.';
					platform.isloading = false;
					OP.blocked[platform.id] = { expire: NOW.add(BLOCKEDTIMEOUT), err: err, url: OP.meta.url };
					platform.pending.length && initpending(platform, err);
					callback(err, null, null, null, raw);
					return;
				}

				platform.dtsync = NOW;

				// Init new OpenPlatform
				OP.init(platform, function(err) {

					if (err) {
						platform.isloading = false;
						OP.blocked[platform.id] = { expire: NOW.add(BLOCKEDTIMEOUT), err: err, url: OP.meta.url };
						callback(err, null, null, null, raw);
						platform.pending.length && initpending(platform, err);
						return;
					}

					if (!iscloud && OP.options.meta && meta.meta) {
						RESTBuilder.GET(meta.meta).exec(function(err, response) {
							OP.sessions[key] = user;
							platform.isloading = false;
							err && OP.options.debug && OP.error('users.auth', err);
							platform.meta = response ? response : EMPTYOBJECT;
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

	if (!options.url) {
		done();
		return;
	}

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

				if (!response.items.length) {
					done && done(null, counter);
					return;
				}

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
		callback(err, response);
	} : null;

	RESTBuilder.POST(url, msg).exec(cb);
};

OP.users.badge = function(url, callback) {
	var cb = callback ? function(err, response) {
		callback(err, response.parseJSON(true));
	} : null;
	RESTBuilder.GET(url).exec(cb);
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
	self.colorscheme = profile.colorscheme;
	self.dateformat = profile.dateformat || profile.df;

	if (profile.nf) {
		switch (profile.nf) {
			case '. ':
				self.numberformat = 1;
				break;
			case ', ':
				self.numberformat = 2;
				break;
			case ',.':
				self.numberformat = 3;
				break;
			case '.,':
				self.numberformat = 4;
				break;
		}
	} else
		self.numberformat = profile.numberformat;

	self.datefdow = profile.language ? (firstdate[profile.language] || 0) : 0;
	self.email = profile.email;
	self.filter = profile.filter;
	self.language = profile.language;
	self.name = profile.name;
	self.photo = profile.photo;
	self.roles = profile.roles;
	self.sa = profile.sa;
	self.status = profile.status;
	self.statusid = profile.statusid;
	self.timeformat = profile.timeformat || profile.tf;
	self.dtlogged = NOW;
	self.customer = profile.customer;

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

OPU.dbms = function(builder) {
	return builder.userid(this.id).where('openplatformid', this.openplatformid);
};

OPU.badge = function(callback) {
	OP.users.badge(this.profile.badge, callback);
};

OPU.logout = function() {
	return OP.users.logout(this);
};

OPU.service = function(app, service, data, callback) {
	RESTBuilder.POST(this.profile.services + '&app=' + app + '&service=' + service, data).callback(callback);
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

function makeurl() {
	var url = OP.meta.url;
	if (url[url.length - 1] !== '/')
		url += '/';
	return QUERIFY(url, this.query);
}

OP.auth = function(callback) {
	AUTH(function($) {
		var op = $.query.openplatform || $.headers.authorization;

		if (!op || op.length < 20) {
			$.invalid();
			return;
		}

		if (op.substring(0, 7) === 'base64 ') {
			// decode
			try {

				var cache = global.TEMP ? global.TEMP[op] : undefined;
				var tmp;

				if (cache === null) {
					$.invalid();
					return;
				}

				if (!global.TEMP || !cache) {
					tmp = Buffer.from(op.substring(7), 'base64').toString('utf8').split(',');
					if (!tmp[0] || tmp[0].length < 20) {
						$.invalid();
						return;
					}
					global.TEMP[op] = tmp;
				} else
					tmp = cache;

				var qd = $.req._querydata;
				qd.openplatform = op = tmp[0];
				qd.rev = tmp[1];
				qd.language = tmp[2];

			} catch (e) {
				$.invalid();
				return;
			}
		}

		var opt = {};
		opt.url = op;
		opt.rev = $.query.rev;
		opt.req = $.req;

		OP.users.auth(opt, function(err, user, type, cached, raw) {

			// type 0 : from session
			// type 1 : profile downloaded from OP without OP meta data
			// type 2 : profile downloaded from OP with meta data
			// cached : means that meta data of OP has been downloaded before this call

			if (err)
				$.req.operror = err;

			$.req.opmeta = raw;

			if (user) {
				$.req.opurl = makeurl;
				user.language && ($.req.$language = user.language);
				callback($, user, type, cached, raw);
			} else
				$.invalid();
		});
	});

};

var BLACKLIST = { id: 1, dtcreated: 1, repo: 1 };

OP.users.sync_all = function(interval, modified, fields, filter, processor, callback) {

	if (typeof(filter) === 'function') {
		callback = processor;
		processor = filter;
		filter = {};
	}

	var props = typeof(fields) === 'string' ? fields.split(',') : fields;
	var opt = {};

	opt.filter = function(builder) {
		builder.where('openplatformid', this.platform.id);
		builder.in('id', this.id);
		return builder;
	};

	var process = function(users, next, platform) {

		if (!users || !users.length) {
			next && next();
			return;
		}

		opt.next = next;
		opt.users = users;
		opt.platform = platform;

		var id = [];
		for (let i = 0; i < users.length; i++) {
			let user = users[i];
			if (user) {
				user.checksum = '';
				for (let j = 0; j < props.length; j++) {

					var field = props[j];
					if (BLACKLIST[field])
						continue;

					var val = user[field];
					if (val)
						user.checksum += (val instanceof Array ? val.join(',') : val instanceof Date ? val.getTime() : val) + ';';
					else
						user.checksum += '0;';
				}
				user.checksum = user.checksum.hash(true) + '';
				id.push(user.id);
			}
		}

		opt.id = id;
		processor(opt);
	};

	var initfilter = CLONE(filter);
	initfilter.fields = fields;

	filter.modified = modified;
	filter.fields = fields;

	OP.users.autosync(interval, initfilter, filter, process, callback);
	return process;
};

OP.users.sync_rem = function(interval, modified, processor, callback) {

	var opt = {};

	opt.filter = function(builder) {
		builder.where('openplatformid', this.platform.id);
		builder.in('id', this.id);
		return builder;
	};

	var process = function(users, next, platform) {

		if (!users || !users.length) {
			next && next();
			return;
		}

		opt.users = users;
		opt.id = id;
		opt.next = next;
		opt.platform = platform;

		var id = [];
		for (let i = 0; i < users.length; i++)
			id.push(users[i].id);

		processor(opt);
	};

	OP.users.autosync(interval, { removed: true }, { modified: modified, removed: true }, process, callback);
	return process;
};