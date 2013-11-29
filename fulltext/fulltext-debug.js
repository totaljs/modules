var fs = require('fs');

var definition = (function() {

	framework.fulltext = function(name) {
		var key = 'fulltext-' + name;

		if (framework.databases[key])
			return framework.databases[key];

		var dir_db = framework.path.databases();
		var dir_doc = framework.path.databases(key);

		if (!fs.existsSync(dir_db))
			fs.mkdirSync(dir_db);

		if (!fs.existsSync(dir_doc))
			fs.mkdirSync(dir_doc);

		framework.databases[key] = require('fulltext').load(name, dir_db, dir_doc);
		return framework.databases[key];
	};

	Controller.prototype.fulltext = function(name) {
		return this.framework.fulltext(name);
	};

});

setTimeout(function() {
	framework.eval(definition);
}, 100);