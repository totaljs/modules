// MIT License
// Copyright Peter Širka <petersirka@gmail.com>

var sass = require('node-sass');
var fs = require('fs');

exports.install = function() {

	F.file('/*.*', scss_compiler, ['.scss']); // Monitor all folders for changes.

	F.config['static-accepts']['.scss'] = true;

	F.onCompileCSS = function (filename, content) {
		var r = sass.renderSync({ data: content, outputStyle: 'compressed' });
        	return r.css.toString();
	};

	F.helpers.scss = function(name, tag) {
		var self = this;
		var url = F._routeStatic(name, self.config['static-url-style']);
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

		var r = sass.renderSync({ data: data.toString(), outputStyle: 'compressed' });

		// write compiled content into the temporary file
		fs.writeFileSync(filename, r.css);

		// this function affect framework.isProcessed() function
		self.responseFile(req, res, filename);
	});
}
