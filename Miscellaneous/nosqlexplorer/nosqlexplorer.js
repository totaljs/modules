const Fs = require('fs');
const EXT = /\.nosql$/;
var URL = '';

exports.install = function(options) {
	URL = F.config['nosqlexporer-url'];

	if (options && options.url)
		URL = options.url;

	if (!URL)
		URL = '/$nosqlexporer/'

	F.route(URL, nosql);
	F.accept('nosql', 'text/plain');
};

exports.databases = function(callback) {
	Fs.readdir(F.path.databases(), function(err, files) {
		var filenames = [];
		files.wait(function(item, next) {

			if (!item.endsWith('.nosql'))
				return next();

			Fs.stat(F.path.databases(item), function(err, info) {
				info.isFile() && filenames.push({ name: item, size: info.size.filesize(), url: URL + '?name=' + encodeURIComponent(item.replace(EXT, '')) });
				next();
			});

		}, () => callback(null, filenames));
	});
};

function nosql() {
	var self = this;
	var name = self.query.name;

	if (name) {
		name = F.path.databases(self.query.name);

		if (!name.endsWith('.nosql'))
			name += '.nosql';

		F.path.exists(name, function(e) {
			if (e)
				self.file('~' + name);
			else
				self.throw404();
		});

		return;
	}

	exports.databases(function(err, files) {
		var links = [];

		files.forEach(function(file) {
			links.push('<a href="{1}" class="file">{0}<span>{2}</span></a>'.format(file.name, 'https://nosql.totaljs.com?url=' + encodeURIComponent(self.hostname(file.url)), file.size));
		});

		self.content('<!DOCTYPE html><html><head><title>NoSQL explorer</title><meta charset="utf-8" /><style>body{font-family:Arial;font-size:16px;padding:10px 30px 30px}a{display:block}.file{color:gray;text-decoration:none;font-size:14px;padding:3px 10px;border-bottom:1px solid #F0F0F0;}.file span{float:right;font-size:12px;margin:2px 0 0 0;color:#A0A0A0}.file:hover{background-color:#F8F8F8}</style></head><body><div class="files">{0}</div></body></html>'.format(links.join('')), 'text/html');
	});
}