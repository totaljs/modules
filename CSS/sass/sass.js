// MIT License
// Copyright Peter Širka <petersirka@gmail.com>

var sass = require('node-sass');
var fs = require('fs');

exports.install = function() {

	F.file('SCSS', scss_compiler);

	var accept = F.config['static-accepts'];

	if (accept.indexOf('.scss') === -1)
		accept.push('.scss');

	F.onCompileCSS = function (filename, content) {
		return sass.renderSync({ data: content, outputStyle: 'compressed' });
	};

	F.helpers.scss = function(name, tag) {
		var self = this;
		var url = self.F._routeStatic(name, self.config['static-url-css']);
		return (tag || true) ? '<link type="text/css" rel="stylesheet" href="' + url + '" />' : url;
	};
};

function scss_compiler(req, res, isValidation) {

	if (isValidation)
		return req.url.indexOf('.scss') !== -1 || req.url.indexOf('.sass') !== -1;

	// this === framework
	var self = this;

	// create temporary filename
	// we'll compile file
	var filename = self.path.temp(req.url.replace(/\//g, '-').substring(1));

	// Cache for RELEASE MODE ONLY
	if (F.isProcessed(filename)) {
		self.responseFile(req, res, filename);
		return;
	}

	fs.readFile(self.path.public(req.url), function(err, data) {

		if (err) {
			self.response404(req, res);
			return;
		}

		var css = sass.renderSync({ data: data.toString(), outputStyle: 'compressed' });

		// write compiled content into the temporary file
		fs.writeFileSync(filename, css);

		// this function affect framework.isProcessed() function
		self.responseFile(req, res, filename);
	});
}