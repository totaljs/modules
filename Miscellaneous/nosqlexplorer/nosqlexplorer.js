exports.id = 'nosqlexporer';

exports.install = function(options) {
	var url = F.config['nosqlexporer-url'];

	if (options && options.url)
		url = options.url;

	F.route(url || '/$nosqlexporer/', nosql);
};

F.accept('nosql', 'text/plain');

function nosql() {
	var self = this;
	var name = F.path.databases(self.query.name);

	if (!name.endsWith('.nosql'))
		name += '.nosql';

	F.path.exists(name, function(e) {
		if (e)
			self.file('~' + name);
		else
			self.throw404();
	});
}