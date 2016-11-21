// MIT License
// Copyright Peter Širka <petersirka@gmail.com>

var stylus = require('stylus');
var fs = require('fs');

exports.install = function() {

	F.file(stylus_compiler);
	F.accept('.styl','text/css');

	F.helpers.stylus = function(name, tag) {
		var self = this;
		var url = F._routeStatic(name, F.config['static-url-css']);
		return (tag || true) ? '<link type="text/css" rel="stylesheet" href="' + url + '" />' : url;
	};

	F.onCompileStyle = function (filename, content) {
		// if already compiled
		if (filename && filename.indexOf( '.' + CONFIG('directory-temp')  ) !== -1 ) {
			return content;

		try {
			var css = stylus(content).set('compress', RELEASE).render();
			return css;
		} catch (err) {
			F.error(err);
			return content;
		}
	};
};

function stylus_compiler(req, res, isValidation) {

	if (isValidation) return req.url.indexOf('.css') !== -1 || req.url.indexOf('.styl') !== -1;

	var self = this;
	var filename = self.path.temp(req.url.replace(/\//g, '-').substring(1));

	if (F.isProcessed(filename)) {
		self.responseFile(req, res, filename);
		return;
	}

	fs.readFile(self.path.public(req.url), function(err, data) {

		if (err) {
			self.response404(req, res);
			return;
		}

		// senkron
		try {
			// only compress when RELEASE mode
			var css = stylus(data.toString('utf8')).set('compress', RELEASE).render();
		} catch (err) {
			self.response500(req, res, err);
			return;
		}

		fs.writeFileSync(filename, css);
		self.responseFile(req, res, filename);
	});
}
