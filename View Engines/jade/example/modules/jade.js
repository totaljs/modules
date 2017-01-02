// MIT License
// Copyright Peter Širka <petersirka@gmail.com>
// Version 2.0.0

global.jade = require('jade');

var definition = (function() {
	Controller.prototype.view = function (name, model, headers, isPartial) {

		var self = this;
		model = model || {}

		model.controller = this; //adds controller related functionality
		model.global = F.global;

		if (isPartial === undefined && typeof(headers) === 'boolean') {
			isPartial = headers;
			headers = null;
		}

		if (self.res.success && !isPartial)
			return self;

		var skip = name[0] === '~';
		var filename = name;
		var isLayout = self.isLayout;

		self.isLayout = false;

		if (!self.isLayout && !skip)
			filename = self._currentView + name;

		if (skip)
			filename = name.substring(1);

		var key = 'jade_' + filename; // fixes if I have two template in different directory with the same name.
		var fn = F.cache.read2(key);

		if (!fn) {

			var ext = '.jade';
			var exists = false;
			var path = F.path.views(filename + ext);
			var fs = require('fs');

			try {
				var val = fs.statSync(path);
				exists = val ? val.isFile() : false;
			} catch(e) {}

			if (!exists) {
				self.view500('View "' + name + '" not found.');
				return;
			}

			var options = U.extend({ filename: path }, exports.options);
			fn = jade.compile(fs.readFileSync(path).toString('utf8'), options);

			if (!self.config.debug && fn !== null)
				F.cache.add(key, fn, F.datetime.add('m', 4));

			if (fn === null) {
				self.view500('View "' + name + '" not found.');
				return;
			}
		}

		if (isPartial)
			return fn(model);

		self.subscribe.success();

		if (self.isConnected) {
			F.responseContent(self.req, self.res, self.status, fn(model), 'text/html', true, headers);
			F.stats.response.view++;
		}

		return self;
	};
});

setTimeout(() => F.eval(definition), 100);
