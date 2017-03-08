// MIT License
// Copyright Peter Širka <petersirka@gmail.com>

var Fs = require('fs');

function Storage() {
	this.repository = {};
	this.repositoryTimeout = null;
}

Storage.prototype.onLoad = function() {
	var self = this;
	Fs.readFile(framework.path.databases('storage.json'), function(err, data) {
		if (err)
			return;
		try
		{
			self.repository = JSON.parse(data);
		} catch(err) {}
	});
};

Storage.prototype.onSave = function() {
	var self = this;
	Fs.writeFile(framework.path.databases('storage.json'), JSON.stringify(self.repository), NOOP);
};

Storage.prototype.set = function(name, value) {
	var self = this;
	self.repository[name] = typeof(value) !== 'function' ? value : value(self.repository[name]);
	self._save();
	return self;
};

Storage.prototype.get = function(name, def) {
	return this.repository[name] || def;
};

Storage.prototype.remove = function(name) {
	var self = this;
	delete self.repository[name];
	self._save();
	return self;
};

Storage.prototype.clear = function() {
	var self = this;
	self.repository = {};
	self._save();
	return self;
};

Storage.prototype.refresh = function() {
	var self = this;
	clearTimeout(self.repositoryTimeout);
	self.onLoad();
	return self;
};

Storage.prototype._save = function() {
	var self = this;
	clearTimeout(self.repositoryTimeout);
	self.repositoryTimeout = setTimeout(function() {
		self.onSave();
		if (typeof(process.send) === 'function') {
			setTimeout(function() {
				process.send('storage');
			}, 1000);
		}
	}, 500);
};

F.helpers.storage = function(name, def) {
	return F.module('storage').get(name, def) || '';
};

module.exports = new Storage();
module.exports.install = function() {
	this.refresh();
};