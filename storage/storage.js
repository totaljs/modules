function Storage() {
	this.framework = null;
	this.repository = {};
	this.repositoryTimeout = null;
};

Storage.prototype.onStorageLoad = function() {
	var self = this;
	fs.readFile(self.framework.path.root('storage'), function(err, data) {
		if (err)
			return;
		try
		{
			self.repository = JSON.parse(data);
		} catch(err) {};
	});
};

Storage.prototype.onStorageSave = function() {
	var self = this;
	fs.writeFile(self.framework.path.root('storage'), JSON.stringify(self.repository), utils.noop);
};

Storage.prototype.set = function(name, value) {
	var self = this;
	self.repository[name] = value;
	self._save();
	return self;
};

Storage.prototype.get = function(name, def) {
	return this.temporary[name] || def;
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
	self.onStorageLoad();
	return self;
};

Storage.prototype._save = function() {
	var self = this;
	clearTimeout(self.repositoryTimeout);
	self.repositoryTimeout = setTimeout(function() {
		self.onStorageSave();
		if (typeof(process.send) === FUNCTION) {
			setTimeout(function() {
				process.send('storage');
			}, 1000);
		}
	}, 500);	
};

framework.helpers.storage = function(name, def) {
	return this.framework.module('framework').get(name, def) || '';
};

module.exports = new Storage();

module.exports.install = function(framework) {
	this.framework = framework;
	this.refresh();
}