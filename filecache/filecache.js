// MIT License
// Copyright Peter Širka <petersirka@gmail.com>

const ERRNOTFOUND = 'File not found.';
const Fs = require('fs');

function FileCache() {
	this.list = {};
	this.length = 0;
}

var FCP = FileCache.prototype;

FCP.init = function() {
	ON('service', function(counter) {
		if (counter % 5 === 0)
			MODULE('filecache').clear();
	});
};

FCP.has = function(id) {
	var obj = this.list[id];
	return obj ? obj.expire < NOW : false;
};

FCP.add = function(file, expire, id, callback) {

	var self = this;
	var type = typeof(id);

	if (type === 'function') {
		var tmp = callback;
		callback = id;
		id = tmp;
		type = typeof(id);
	}

	if (!id)
		id = GUID(20);
	else if (!self.list[id])
		self.length++;

	var path = PATH.temp(id + '.filecache');
	self.list[id] = { expire: expire, type: file.type, filename: file.filename, length: file.length, width: file.width, height: file.height, path: path };

	if (callback)
		file.copy(path, () => callback(id, self.list[id]));
	else
		file.copy(path);

	return id;
};

FCP.info = function(id) {
	var obj = this.list[id];
	return obj == null || obj.expire < NOW ? null : obj;
};

FCP.read = function(id, callback, remove) {

	var self = this;

	if (!self.list[id]) {
		callback(ERRNOTFOUND);
		return;
	}

	var obj = self.list[id];

	if (obj.expire < new Date()) {
		self.remove(id);
		callback(ERRNOTFOUND);
		return;
	}

	var stream = Fs.createReadStream(PATH.temp(id + '.filecache'));
	remove && stream.on('close', () => self.remove(id));
	callback(null, obj, stream);
	return self;
};

FCP.copy = function(id, path, callback, remove) {

	var self = this;

	if (!self.list[id]) {
		callback && callback(ERRNOTFOUND);
		return;
	}

	var obj = self.list[id];
	if (obj.expire < NOW) {
		self.remove(id);
		callback && callback(ERRNOTFOUND);
		return;
	}

	var stream = Fs.createReadStream(PATH.temp(id + '.filecache'));
	stream.pipe(Fs.createWriteStream(path));
	remove && stream.on('close', () => self.remove(id));
	callback && callback(null, path);
	return self;
};

FCP.remove = function(id) {

	var self = this;

	if (!(id instanceof Array))
		id = [id];

	var arr = [];
	var length = id.length;

	for (var i = 0; i < length; i++) {

		var key = id[i];
		var file = self.list[key];

		if (!file)
			continue;

		delete self.list[key];
		self.length--;
		arr.push(PATH.temp(key + '.filecache'));
	}

	if (arr.length === 0)
		return self;

	arr.wait((path, next) => Fs.unlink(path, next));
	return self;
};

FCP.clear = function() {

	var self = this;
	var arr = Object.keys(self.list);
	var length = arr.length;
	var tmp = [];
	var now = NOW;

	for (var i = 0; i < length; i++) {
		var obj = self.list[arr[i]];

		if (obj.expire >= now)
			continue;

		delete self.list[arr[i]];
		tmp.push(PATH.temp(arr[i] + '.filecache'));
		self.length--;
	}

	if (tmp.length > 0)
		framework.unlink(tmp);

	return self;
};

FCP.usage = function() {
	return { count: this.length };
};

var filecache = new FileCache();
module.exports = filecache;
module.exports.install = () => filecache.init();