// MIT License
// Copyright Peter Širka <petersirka@gmail.com>

var definition = (function() {
	F.filestorage = function(name) {
		var key = 'filestorage-' + name;
		if (F.databases[key])
			return F.databases[key];
		F.databases[key] = require('filestorage').create(F.path.root('filestorage/' + name + '/'));
		return F.databases[key];
	};

	Controller.prototype.filestorage = function(name) {
		return F.filestorage(name);
	};
});

setTimeout(function() {
	F.eval(definition);
}, 100);