// MIT License
// Copyright Peter Širka <petersirka@gmail.com>

var fs = require('fs');

function FileCache() {
	this.list = {};
	this.length = 0;
}

FileCache.prototype.init = function() {
	framework.on('service', function(counter) {
		if (counter % 5 === 0)
			framework.module('filecache').clear();
	});
}

FileCache.prototype.has = function(id) {
	var obj = this.list[id];
	if (typeof(obj) === 'undefined')
		return false;
	return obj.expire < new Date();
};

FileCache.prototype.add = function(file, expire, id, callback) {

	var self = this;
	var type = typeof(id);

	if (type === 'function') {
		var tmp = callback;
		callback = id;
		id = tmp;
		type = typeof(id);
	}

	if (type === 'undefined')
		id = utils.GUID(20);
	else if (typeof(self.list[id]) === 'undefined')
		self.length++;

	var path = framework.path.temp(id + '.filecache');
	self.list[id] = { expire: expire, contentType: file.contentType, filename: file.filename, length: file.length, width: file.width, height: file.height, path: path };

	if (!callback) {
		file.copy(path);
		return id;
	}

	file.copy(path, function() {
		callback(id, self.list[id]);
	});

	return id;
};

FileCache.prototype.info = function(id) {
	var obj = this.list[id] || null;
	if (obj === null || obj.expire < new Date())
		return null;
	return obj;
};

FileCache.prototype.read = function(id, callback, remove) {

	var self = this;

	if (typeof(self.list[id]) === 'undefined') {
		callback(new Error('File not found.'));
		return;
	}

	var obj = self.list[id];

	if (obj.expire < new Date()) {
		self.remove(id);
		callback(new Error('File not found.'));
		return;
	}

	var stream = fs.createReadStream(framework.path.temp(id + '.filecache'));

	if (remove) {
		stream.on('close', function() {
			self.remove(id);
		});
	}

	callback(null, obj, stream);
	return self;
};

FileCache.prototype.copy = function(id, path, callback, remove) {

	var self = this;

	if (typeof(self.list[id]) === 'undefined') {
		if (callback)
			callback(new Error('File not found.'));
		return;
	}

	var obj = self.list[id];

	if (obj.expire < new Date()) {
		self.remove(id);
		if (callback)
			callback(new Error('File not found.'));
		return;
	}

	var stream = fs.createReadStream(framework.path.temp(id + '.filecache'));
	stream.pipe(fs.createWriteStream(path));

	if (remove) {
		stream.on('close', function() {
			self.remove(id);
		});
	}

	if (callback)
		callback(null, path);

	return self;
};

FileCache.prototype.fileserver = function(name, id, callback, headers, remove) {

	var self = this;

	if (!(id instanceof Array))
		id = [id];

	if (typeof(remove) === 'undefined')
		remove = true;

	var arr = [];
	var length = id.length;

	for (var i = 0; i < length; i++) {

		if (typeof(id[i]) === 'undefined' || id[i] === null)
			continue;

		var key = id[i].toString();
		if (key.length === 0)
			continue;

		var file = self.list[key];

		if (typeof(file) === 'undefined')
			continue;

		arr.push({ name: id[i], contentType: file.contentType, filename: file.filename, path: framework.path.temp(id[i] + '.filecache') });
	}

	if (arr.length === 0) {
		callback(new Error('Collection doesn\'t contain files.'), {});
		return false;
	}

	framework.module('fileserver').upload(name, arr, function(err, rows) {

		if (remove)
			self.remove(id);

		callback(err, rows || {});

	}, headers);

	return true;
};

FileCache.prototype.remove = function(id) {

	var self = this;

	if (!(id instanceof Array))
		id = [id];

	var arr = [];
	var length = id.length;

	for (var i = 0; i < length; i++) {

		var key = id[i];
		var file = self.list[key];

		if (typeof(file) === 'undefined')
			continue;

		delete self.list[key];
		self.length--;
		arr.push(framework.path.temp(key + '.filecache'));
	}

	if (arr.length === 0)
		return self;

	arr.wait(function(path, next) {
		fs.unlink(path, function() {
			next();
		});
	});

	return self;
};

FileCache.prototype.clear = function() {

	var self = this;
	var arr = Object.keys(self.list);
	var length = arr.length;
	var tmp = [];
	var now = new Date();

	for (var i = 0; i < length; i++) {
		var obj = self.list[arr[i]];

		if (obj.expire >= now)
			continue;

		delete self.list[arr[i]];
		tmp.push(framework.path.temp(arr[i] + '.filecache'));
		self.length--;
	}

	if (tmp.length > 0)
		framework.unlink(tmp);

	return self;
};

FileCache.prototype.usage = function() {
	return { count: this.length };
};

var filecache = new FileCache();

module.exports = filecache;
module.exports.install = function() {
	filecache.init();
};