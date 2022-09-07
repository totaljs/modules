// query.fields  = 'id,COUNT(dtcreated)';
// query.filter  = '[name=Test] AND [attr14_name~%Total%] OR ([attr12=123456] OR [attr7_name=Reject])';
// query.where   = 'name=%25Test%25&attr14_name=%25Total%25';
// query.filter  = '[name=Test] AND [attr14_name~%Total%]';
// query.group   = 'id';
// query.sort    = 'attr14_name ASC';
// query.command = 'find';
// query.typeid  = 'type3434';
// query.expand  = '1';

function TotalDB(cmd) {
	var t = this;
	t.options = {};
	t.command = cmd;
}

var TDB = TotalDB.prototype;

TDB.endpoint = function(url) {
	this.options.url = url;
	return this;
};

TDB.where = function(value) {
	var t = this;
	if (typeof(value) === 'object') {
		var builder = [];
		for (var key in value)
			builder.push(key + '=' + encodeURIComponent(value[key]));
		t.options.where = encodeURIComponent(builder.join('&'));
	} else {

		var output = [];
		var keys = value.split('&');

		for (var key of keys) {
			var index = key.indexOf('=');
			if (index !== -1)
				output.push(key.substring(0, index) + '=' + encodeURIComponent(key.substring(index + 1)));
		}

		t.options.where = encodeURIComponent(output.join('&'));
	}

	return t;
};

TDB.filter = function(value) {

	var t = this;

	if (value instanceof Array) {
		var builder = [];
		for (var m of value)
			builder.push((/=|<|>|~/).test(m) ? ('[' + m + ']') : m);
		t.options.filter = encodeURIComponent(builder.join(' '));
	} else
		t.options.filter = encodeURIComponent(value);

	return t;
};

TDB.fields = function(value) {
	this.options.fields = encodeURIComponent(value);
	return this;
};

TDB.sort = function(value) {
	this.options.sort = encodeURIComponent(value);
	return this;
};

TDB.paginate = function(page, limit) {
	var t = this;
	t.options.page = page;
	t.options.limit = limit;
	return t;
};

TDB.expand = function() {
	this.options.expand = 1;
	return this;
};

TDB.group = function(value) {
	this.options.group = encodeURIComponent(value);
	return this;
};

TDB.exec = TDB.callback = function(url, callback) {

	if (typeof(url) !== 'string') {
		callback = url;
		url = this.options.url || '';
	}

	var dburl = TEMP[url];
	if (!dburl) {
		if (url.indexOf('/api/') === -1) {
			var index = url.indexOf('/', 10);
			TEMP[url] = dburl = url.substring(0, index) + '/api/' + url.substring(index + 1);
		}
	}

	var t = this;
	var filter = [];

	if (t.options.fields)
		filter.push('fields=' + t.options.fields);

	if (t.options.sort)
		filter.push('sort=' + t.options.sort);

	if (t.options.where)
		filter.push('where=' + t.options.where);
	else if (t.options.filter)
		filter.push('filter=' + t.options.filter);

	if (t.options.group)
		filter.push('group=' + t.options.group);

	if (t.options.expand)
		filter.push('expand=1');

	if (t.options.page)
		filter.push('page=' + t.options.page);

	if (t.options.limit)
		filter.push('limit=' + t.options.limit);

	var api = t.options.command + (filter.length ? ('?' + filter.join('&')) : '');
	var opt = {};

	opt.keepalive = true;
	opt.url = dburl;
	opt.xhr = true;
	opt.method = 'POST';
	opt.type = 'json';
	opt.dnscache = true;
	opt.body = JSON.stringify({ schema: api, data: t.options.data });

	if (!callback || typeof(callback) !== 'function') {
		return new Promise(function(resolve, reject) {
			opt.callback = function(err, response) {
				var data = null;
				if (response.status === 200)
					data = response.body.parseJSON(true);
				else if (!err && response.status !== 200)
					err = response.body.parseJSON(true);
				if (err) {
					if (callback && callback.invalid)
						callback.invalid(err);
					else
						reject(err);
				} else
					resolve(data);
			};
			REQUEST(opt);
		});
	} else {
		opt.callback = function(err, response) {
			var data = null;
			if (response.status === 200)
				data = response.body.parseJSON(true);
			else if (!err && response.status !== 200)
				err = response.body.parseJSON(true);
			callback(err, data);
		};
		REQUEST(opt);
	}
};

TDB.promise = function(url) {
	return this.callback(url);
};

exports.list = function(type) {
	var t = new TotalDB();
	t.options.command = 'list/' + type;
	return t;
};

exports.find = function(type) {
	var t = new TotalDB();
	t.options.command = 'find/' + type;
	return t;
};

exports.first = function(type) {
	var t = new TotalDB();
	t.options.command = 'first/' + type;
	return t;
};

exports.read = function(type, id) {
	var t = new TotalDB();
	t.options.command = 'read/' + type + '/' + id;
	return t;
};

exports.check = function(type) {
	var t = new TotalDB();
	t.options.command = 'check/' + type;
	return t;
};

exports.insert = exports.update = function(type, id, data) {
	var t = new TotalDB();
	t.options.command = 'save/' + type;
	var model = {};

	if (data == null) {
		model.data = id;
	} else {
		model.id = id;
		model.data = data;
	}

	t.options.data = model;
	return t;
};

exports.remove = function(type, id) {
	var t = new TotalDB();
	t.options.command = 'remove/' + type + '/' + id;
	return t;
};

global.TDB = exports;