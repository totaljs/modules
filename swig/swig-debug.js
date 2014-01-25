// MIT License
// Copyright Peter Širka <petersirka@gmail.com>
// Version 1.01

global.swig = require('swig');

var definition = (function() {

	swig.setDefaults({ cache: !framework.config.debug });

	Controller.prototype.view = function(name, model, headers, isPartial) {

		var self = this;
		var first = name[0];
		var skip = name[0] === '~';

		if (!self.isLayout && !skip)
			name = self._currentView + name;

		if (skip)
			name = name.substring(1);

		if (typeof(isPartial) === UNDEFINED && typeof(headers) === BOOLEAN) {
			isPartial = headers;
			headers = null;
		}

		var output = swig.renderFile(directory + self.path.views(name + '.html').substring(1), model);

		if (isPartial)
			return output;

		if (!self.isConnected)
			return self;

		self.subscribe.success();
		self.framework.responseContent(self.req, self.res, self.status, output, 'text/html', true, headers);
		self.framework.stats.response.view++;

		return self;
	};
});

setTimeout(function() {
	framework.eval(definition);
}, 100);