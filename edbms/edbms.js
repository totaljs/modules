var DB = {};
var pending = 0;

function EDBMS(url, eb) {

	var t = this;
	t.$remap = true;
	// t.$raw = false;
	t.$errors = eb ? eb : new ErrorBuilder();
	t.$commands = [];

	// t.$timeout;
	// t.$output;
	// t.$outputlast;
	// t.output;
	// t.$callback;

	t.url = DB[url || 'default'] || '';
	t.response = {};
	t.tmp = '';

	t.$request = function() {
		t.$timeout = null;
		t.$exec();
	};
}

EDBMS.clear = function() {
	DB = {};
};

EDBMS.use = function() {
	// Total.js framework
	if (global.F) {
		global.F.database = function(err) {
			if (typeof(err) === 'function') {
				var db = new EDBMS();
				err.call(db, db);
			} else
				return new EDBMS(err);
		};
	}
	return EDBMS;
};

EDBMS.url = function(name, url) {

	if (url == null) {
		url = name;
		name = 'default';
	}

	if (url[url.length - 1] === '/')
		url = url.substring(0, url.length - 1);

	DB[name] = url;
	return EDBMS;
};

EDBMS.index = function(name, indexname, callback) {

	if (indexname == null || typeof(indexname) === 'function') {
		callback = indexname;
		indexname = name;
		name = 'default';
	}

	pending++;

	var url = DB[name];
	RESTBuilder.HEAD(url + '/' + indexname).exec(function(err, response) {

		pending--;

		if (err)
			throw err;

		if (!response) {
			pending++;
			callback(function(model, callback) {
				pending--;
				// console.log(model);
				RESTBuilder.PUT(url + '/' + indexname, model).exec(callback || ERROR('Create index "' + url + '/' + indexname + '"'));
			});
		}
	});
};

const ED = EDBMS.prototype;
const TMP = {};

TMP.replace = function(text) {
	return JSON.stringify(TMP.value[text.substring(1)]);
};

ED.callback = function(fn) {
	this.$callback = fn;
	return this;
};

ED.must = function(err, reverse) {
	var self = this;
	self.$commands.push({ type: 'must', value: err || 'unhandled exception', reverse: reverse });
	return self;
};

ED.insert = function(index, type, data) {

	if (!index || !type || !data)
		throw new Error('Missing required arguments.');

	var self = this;
	var name = index + '/' + type;
	return self.exec(name, data);
};

ED.update = function(index, type, id, data) {

	if (!index || !type || !id || !data)
		throw new Error('Missing required arguments.');

	var self = this;
	var name = 'PUT {0}/{1}/{2}'.format(index, type, id);
	return self.exec(name, data);
};

ED.modify = function(index, id, data) {

	if (!index || !id || !data)
		throw new Error('Missing required arguments.');

	var self = this;
	var name = '{0}/_update/{1}'.format(index, id);
	var model = {};
	model.doc = data;
	return self.exec(name, model);
};

ED.read = function(index, type, id) {

	if (!index || !type || !id)
		throw new Error('Missing required arguments.');

	var self = this;
	var name = 'GET {0}/{1}/{2}'.format(index, type, id);
	return self.exec(name, null, null, true);
};

ED.list = function(index) {

	if (!index)
		throw new Error('Missing required arguments.');

	var self = this;
	var name = index + '/_search';
	return self.exec(name);
};

ED.delete = function(index, type, id) {

	if (!index || (type && !id))
		throw new Error('Missing required arguments.');

	var self = this;
	var name;

	if (id == null)
		name = '{0}/_delete_by_query'.format(index);
	else
		name = 'DELETE {0}/{1}/{2}'.format(index, type, id);

	return self.exec(name);
};

ED.refresh = function(index) {

	if (!index)
		throw new Error('Missing required arguments.');

	var self = this;
	self.$raw = true;
	var name = index + '/_refresh';
	return self.exec(name);
};

ED.count = function(index) {

	if (!index)
		throw new Error('Missing required arguments.');

	var self = this;
	self.$raw = true;
	var name = index + '/_count';
	return self.exec(name);
};

ED.exec = function(name, index, data, read) {

	if (typeof(index) === 'object') {
		data = index;
		index = null;
	}

	if (index == null)
		index = name;

	var self = this;
	var builder = new ElasticQuery();
	var beg = index.indexOf(' ');

	if (beg !== -1) {
		var method = index.substring(0, beg);
		builder.options.method = method;
		index = index.substring(beg + 1).trim();
	}

	if (data)
		builder.options.body = data;

	if (read)
		builder.options.one = true;

	builder.$commandindex = self.$commands.push({ name: name, index: index, builder: builder }) - 1;
	self.$timeout && clearImmediate(self.$timeout);
	self.$timeout = setImmediate(self.$request);
	return builder;
};

ED.output = function(val) {
	this.$output = val;
	return this;
};

ED.$validate = function(cmd) {
	var type = typeof(cmd.value);
	var stop = false;
	switch (type) {
		case 'function':
			var val = cmd.value(self.output, self.$output);
			if (typeof(val) === 'string') {
				stop = true;
				self.$errors.push(val);
			}
			break;
		case 'string':
			if (self.output instanceof Array) {
				if (cmd.reverse) {
					if (self.output.length) {
						self.$errors.push(cmd.value);
						stop = true;
					}
				} else {
					if (!self.output.length) {
						self.$errors.push(cmd.value);
						stop = true;
					}
				}
			} else {
				if (cmd.reverse) {
					if (self.output) {
						self.$errors.push(cmd.value);
						stop = true;
					}
				} else {
					if (!self.output) {
						self.$errors.push(cmd.value);
						stop = true;
					}
				}
			}
			break;
	}

	if (stop) {
		self.$commands = [];
		self.$callback && self.$callback(self.$errors.length ? self.error : null, self.output);
	} else {
		self.$timeout && clearImmediate(self.$timeout);
		self.$timeout = setImmediate(self.$request);
	}
};

ED.$exec = function() {

	var self = this;

	// Pending for indexes...
	if (pending > 0) {
		setTimeout(self.$request, 500);
		return self;
	}

	var cmd = self.$commands.shift();

	if (cmd == null) {
		// end
		// callback
		self.$callback && self.$callback(self.$errors.length ? self.error : null, self.output);
		return self;
	}

	var c = cmd.index[0];

	if (c === '/')
		cmd.index = cmd.index.substring(1);
	else if (c === '[') {
		var beg = cmd.index.indexOf(']');
		cmd.index = DB[cmd.index.substring(1, beg)] + cmd.index.substring(beg + 1);
		self.url = '';
	}

	var builder = cmd.builder;

	if (builder.options.refresh)
		cmd.index += '?refresh';

	var rb = RESTBuilder.url((self.url ? (self.url + '/') : '') + cmd.index);

	if (builder.options.method !== 'GET') {
		var q = builder.create();
		rb.json(q);
	}

	rb.$method = builder.options.method;
	rb.$keepalive = true;
	rb.exec(function(err, response) {

		if (self.$raw) {
			self.output = self.response[cmd.name] = response;
			builder.options.data && builder.options.data(err, self.response[cmd.name]);
			builder.options.callback && builder.options.callback(err, self.response[cmd.name]);
			self.$timeout && clearImmediate(self.$timeout);
			self.$timeout = setImmediate(self.$request);
			return;
		}

		if (builder.options.one) {
			if (!response.found)
				self.output = self.response[cmd.name] = null;
			else {
				var source = response._source;
				source.id = response._id;
				self.output = self.response[cmd.name] = source;
			}

			builder.options.data && builder.options.data(err, self.response[cmd.name]);
			builder.options.callback && builder.options.callback(err, self.response[cmd.name]);
			self.$timeout && clearImmediate(self.$timeout);
			self.$timeout = setImmediate(self.$request);
		}

		if (response.deleted > -1) {
			self.output = self.response[cmd.name] = { status: response.deleted === 0 ? 'noop' : 'deleted', total: response.deleted };
			builder.options.data && builder.options.data(err, self.response[cmd.name]);
			builder.options.callback && builder.options.callback(err, self.response[cmd.name]);
			self.$timeout && clearImmediate(self.$timeout);
			self.$timeout = setImmediate(self.$request);
		}

		if (response.error) {
			var err = response.error.type ? (response.error.type + ': ' + response.error.reason) : response.error;
			self.$errors.push(err);
			builder.options.fail && builder.options.fail(err);
			builder.options.callback && builder.options.callback(err);
			self.$timeout && clearImmediate(self.$timeout);
			self.$timeout = setImmediate(self.$request);
			return;
		}

		if (response.result) {
			self.output = self.response[cmd.name] = { id: response._id, status: response.result };
			builder.options.data && builder.options.data(err, self.response[cmd.name]);
			builder.options.callback && builder.options.callback(err, self.response[cmd.name]);
			self.$timeout && clearImmediate(self.$timeout);
			self.$timeout = setImmediate(self.$request);
			return;
		}

		response = response.hits;

		if (!response) {
			self.$timeout && clearImmediate(self.$timeout);
			self.$timeout = setImmediate(self.$request);
			return;
		}

		var item;
		var opt = builder.options;
		if (opt.first) {
			if (response.total.value) {
				item = response.hits[0];
				if (self.$remap) {
					item._source.id = item._id;
					item = item._source;
				}
				self.output = self.response[cmd.name] = item;
			} else
				self.output = self.response[cmd.name] = null;
		} else {
			var output = {};
			output.score = response.max_score;
			output.count = response.total.value;
			output.pages = output.count && opt.take ? Math.ceil(output.count / opt.take) : 0;
			output.page = opt.skip ? (Math.ceil(opt.skip / opt.take) + 1) : 1;
			output.items = response.hits;
			if (self.$remap) {
				for (var i = 0; i < output.items.length; i++) {
					item = output.items[i];
					item._source.id = item._id;
					output.items[i] = item._source;
				}
			}
			self.output = self.response[cmd.name] = output;
		}

		builder.options.data && builder.options.data(err, self.response[cmd.name]);
		builder.options.callback && builder.options.callback(err, self.response[cmd.name]);
		self.$timeout && clearImmediate(self.$timeout);
		self.$timeout = setImmediate(self.$request);
	});
};

function ElasticQuery() {
	this.mapper = {};
	this.items = [];
	this.options = { method: 'post' };
	this.tmp = '';
}

const EP = ElasticQuery.prototype;

EP.fields = function(fields) {

	var self = this;

	if (!self.options.fields)
		self.options.fields = [];

	var arr = arguments;

	if (arr.length === 1 && fields.indexOf(',') !== -1)
		arr = fields.split(',');

	for (var i = 0; i < arr.length; i++)
		self.options.fields.push((arr[i][0] === ' ' ? arr[i].trim() : arr[i]));

	return self;
};

EP.scope = function(path) {
	var self = this;
	self.$scope = path || '';
	return self;
};

EP.push = function(path, value) {

	var self = this;

	if (self.$scope)
		path = self.$scope + (path ? '.' : '') + path;

	if (value === undefined)
		value = NOOP;

	if (self.mapper[path])
		self.mapper[path].push(value);
	else
		self.mapper[path] = [value];

	return self;
};

EP.sort = function(name, type) {
	var self = this;
	var opt = self.options;
	var item;

	if (type) {
		item = {};
		item[name] = type;
	} else
		item = name;

	if (opt.sort)
		opt.sort.push(item);
	else
		opt.sort = [item];

	return self;
};

EP.skip = function(value) {
	var self = this;
	self.options.skip = value;
	return self;
};

EP.take = function(value) {
	var self = this;
	self.options.take = value;
	return self;
};

EP.page = function(page, limit) {
	var self = this;
	if (limit)
		self.options.take = limit;
	self.options.skip = page * self.options.take;
	return self;
};

EP.paginate = function(page, limit, maxlimit) {

	var self = this;
	var limit2 = +(limit || 0);
	var page2 = (+(page || 0)) - 1;

	if (page2 < 0)
		page2 = 0;

	if (maxlimit && limit2 > maxlimit)
		limit2 = maxlimit;

	if (!limit2)
		limit2 = maxlimit;

	self.options.skip = page2 * limit2;
	self.options.take = limit2;
	return self;
};

EP.first = function() {
	var self = this;
	self.options.first = true;
	self.options.take = 1;
	return self;
};

EP.one = function() {
	this.options.one = true;
	return this;
};

EP.create = function() {
	var self = this;
	var opt = self.options;

	if (opt.body)
		return opt.body;

	var obj = {};
	var keys = Object.keys(self.mapper);
	var tmp;

	if (opt.sort)
		obj.sort = opt.sort;

	opt.take && (obj.size = opt.take);
	opt.skip && (obj.from = opt.skip);
	opt.fields && opt.fields.length && (obj._source = opt.fields);

	for (var i = 0; i < keys.length; i++) {

		var key = keys[i];
		var cur, arr, p, isarr, isend;

		arr = key.split('.');
		cur = obj;

		for (var j = 0; j < arr.length; j++) {

			p = arr[j];
			isarr = p[p.length - 1] === ']';
			isend = j === arr.length - 1;

			if (isarr)
				p = p.substring(0, p.length - 2);

			if (cur instanceof Array) {
				// must be ended
				if (!isend)
					throw new Error('Not allowed path for "' + key + '".');

			} else if (cur[p] === undefined)
				cur[p] = isarr ? [] : {};

			if (!isend)
				cur = cur[p];
		}

		var items = self.mapper[key];
		for (var j = 0; j < items.length; j++) {
			var item = items[j];
			if (item != NOOP) {
				if (cur[p] instanceof Array) {
					cur[p].push(item);
				} else {
					if (cur instanceof Array) {
						tmp = {};
						tmp[p] = item;
						cur.push(tmp);
					} else
						cur[p] = item;
				}
			}
		}
	}

	if (self.$extend) {
		for (var i = 0 ; i < self.$extend.length; i++)
			self.$extend[i](obj);
	}

	var body = JSON.stringify(obj);

	if (opt.debug)
		console.log('--->', body);

	return body;
};

EP.extend = function(fn) {
	var self = this;
	if (self.$extend)
		self.$extend.push(fn);
	else
		self.$extend = [fn];
	return self;
};

EP.debug = function() {
	this.options.debug = true;
	return this;
};

EP.refresh = function() {
	this.options.refresh = true;
	return this;
};

EP.callback = function(callback) {
	this.options.callback = callback;
	return this;
};

EP.data = function(callback) {
	this.options.data = callback;
	return this;
};

EP.fail = function(callback) {
	this.options.fail = callback;
	return this;
};

exports.EDBMS = EDBMS;
exports.url = EDBMS.url;
exports.clear = EDBMS.clear;
exports.use = EDBMS.use;
exports.index = EDBMS.index;

global.EDB = function(name, err) {
	if (name && typeof(name) === 'object') {
		err = name;
		name = null;
	}
	return new EDBMS(name, err);
};