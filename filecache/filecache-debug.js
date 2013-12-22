var fs = require('fs');

function FileCache() {
	this.list = {};
	this.length = 0;
}

FileCache.prototype.init = function(framework) {
	framework.on('service', function(counter) {
		if (counter % 5 === 0)
			framework.module('filecache').clear();
	});
}

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

	self.list[id] = { expire: expire, contentType: file.contentType, filename: file.filename };

	if (!callback) {
		file.copy(framework.path.temp(id + '.filecache'));
		return id;
	}

	file.copy(framework.path.temp(id + '.filecache'), function() {
		callback(id);
	});

	return id;
};

FileCache.prototype.read = function(id, callback) {

	var self = this;

	if (typeof(self.list[id]) === 'undefined') {
		callback(new Error('File not found.'));
		return;
	}

	var obj = self.list[id];

	if (obj.expire.getTime() < new Date().getTime()) {
		self.remove(id);
		callback(new Error('File not found.'));
		return;
	}

	callback(null, obj, fs.createReadStream(framework.path.temp(id + '.filecache')));
	return self;
};

FileCache.prototype.remove = function(id) {

	var self = this;

	if (typeof(self.list[id]) === 'undefined')
		return;

	delete self.list[id];
	self.length--;

	fs.unlink(framework.path.temp(id + '.filecache'));
	return self;
};

FileCache.prototype.clear = function() {

	var self = this;
	var arr = Object.keys(self.list);
	var length = arr.length;
	var tmp = [];
	var now = new Date().getTime();

	for (var i = 0; i < length; i++) {
		var obj = self.list[arr[i]];

		if (obj.expire.getTime() >= now)
			continue;

		delete self.list[arr[i]];
		tmp.push(framework.path.temp(arr[i] + '.filecache'));
		self.length--;
	}

	return self;
};

var filecache = new FileCache();

module.exports = filecache;
module.exports.install = function(framework) {
	filecache.init(framework);
};