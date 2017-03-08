const Fs = require('fs');
const Path = require('path');

exports.install = function(options) {
	var url = '/';
	if (options && options.url)
		url = U.path(options.url.replace('*', ''));
	F.route(url + '*', directorylisting);
};

function directorylisting() {
	var self = this;
	var dir = F.path.public(self.url.substring(1));
	Fs.readdir(dir, function(err, items) {

		var directories = [];
		var files = [];

		self.url !== '/' && directories.push('<a href=".." class="directory-back">..</a>');

		if (err)
			return render(self, directories, files);

		items.wait(function(item, next) {
			var filename = Path.join(dir, item);
			Fs.stat(filename, function(err, info) {
				if (info.isFile())
					files.push('<a href="{1}" class="file">{0}<span>{2}</span></a>'.format(item, self.url + item, info.size.filesize()));
				else
					directories.push('<a href="{1}/" class="directory">{0}</a>'.format(item, self.url + item));
				next();
			});
		}, () => render(self, directories, files));
	});
}

function render(controller, directories, files) {
	controller.content('<!DOCTYPE html><html><head><title>Directory listing: {0}</title><meta charset="utf-8" /><style>body{font-family:Arial;font-size:16px;padding:10px 30px 30px}a{display:block}.directory:last-child{margin-bottom:10px}.directory{padding:2px 10px;background-color:#F8F8F8;margin-bottom:2px;text-decoration:none;color:black;font-weight:bold;font-size:18px}.directory-back{text-decoration:none;font-size:50px;margin:0 0 10px 5px;color:gray}.file{color:gray;text-decoration:none;font-size:14px;padding:3px 10px;border-bottom:1px solid #F0F0F0;}.file span{float:right;font-size:12px;margin:2px 0 0 0;color:#A0A0A0}.file:hover{background-color:#F8F8F8}</style></head><body><div class="directories">{1}</div><div class="files">{2}</div></body></html>'.format(controller.url, directories.join(''), files.join('')), 'text/html');
}