// MIT License
// Copyright Peter Širka <petersirka@gmail.com>

var less = require('less');
var fs = require('fs');

exports.install = function() {
	// THE PROBLEM:
	// LESS CSS does not support synchronous compiler
	// We must create a file route
	F.file('LESS CSS', less_compiler);

	var accept = F.config['static-accepts'];

	if (accept.indexOf('.less') === -1)
		accept.push('.less');

	F.helpers.less = function(name, tag) {
		var self = this;
		var url = self.F._routeStatic(name, self.config['static-url-css']);
		return (tag || true) ? '<link type="text/css" rel="stylesheet" href="' + url + '" />' : url;
	};

};

function less_compiler(req, res, isValidation) {

	if (isValidation)
		return req.url.indexOf('.css') !== -1 || req.url.indexOf('.less') !== -1;

	// this === framework
	var self = this;

	// create temporary filename
	// we'll compile file
	var filename = self.path.temp(req.url.replace(/\//g, '-').substring(1));

	// Cache for RELEASE MODE ONLY
	if (framework.isProcessed(filename)) {
		self.responseFile(req, res, filename);
		return;
	}

	fs.readFile(self.path.public(req.url), function(err, data) {

		if (err) {
			self.response404(req, res);
			return;
		}

		less.render(data.toString('utf8'), function(err, css) {

			if (err) {
				self.response500(req, res, err);
				return;
			}

			// write compiled content into the temporary file
			fs.writeFileSync(filename, css);

			// this function affect framework.isProcessed() function
			self.responseFile(req, res, filename);
		});

	});
}