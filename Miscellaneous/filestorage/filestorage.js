// MIT License
// Copyright Peter Širka <petersirka@gmail.com>

var definition = (function() {
	framework.filestorage = function(name) {
		var key = 'filestorage-' + name;
		if (framework.databases[key])
			return framework.databases[key];
		framework.databases[key] = require('filestorage').create(framework.path.root('filestorage/' + name + '/'));
		return framework.databases[key];
	};

	Controller.prototype.filestorage = function(name) {
		return this.framework.filestorage(name);
	};
});

setTimeout(function() {
	framework.eval(definition);
}, 100);