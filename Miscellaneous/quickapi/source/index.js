// MIT License
// Copyright Peter Širka <petersirka@gmail.com>

var OPT;

exports.version = 'v1.0.0';
exports.install = function(options) {
	OPT = options;

	if (!OPT)
		OPT = {};

	// options.controllers = { api: true, manager: true};
	// options.url = '/docs/';
	// options.description = 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Quia, at!';

	OPT.url = U.path(OPT.url || '/docs/');
	F.route(OPT.url, view_index);
};

exports.uninstall = function() {
	OPT = null;
};

function view_index() {
	var self = this;
	self.memorize('quickapi', '2 minutes', DEBUG, function() {
		var output = {};
		var builder = [];

		for (var i = 0, length = F.routes.web.length; i < length; i++) {
			var item = F.routes.web[i];
			if (!item.owner.startsWith('controller#') || !item.method)
				continue;

			var controller = item.owner.substring(11);
			if (OPT.controllers && !OPT.controllers[controller])
				continue;

			var obj = {};
			obj.url = item.urlraw;
			obj.method = item.method;
			obj.authorize = item.flags2.authorize;
			obj.description = item.description;
			obj.upload = item.flags2.upload;

			if (item.schema && item.schema.length && (obj.method === 'POST' || obj.method === 'PUT')) {
				var schema = GETSCHEMA(item.schema[0], item.schema[1]);
				if (!schema)
					continue;
				obj.schema = [];
				Object.keys(schema.schema).forEach(function(key) {
					var tmp = schema.schema[key];
					var type;

					switch (tmp.type) {
						case 1:
							type = 'Integer';
							break;
						case 2:
							type = 'Float';
							break;
						case 3:
							type = 'String';
							break;
						case 4:
							type = 'Boolean';
							break;
						case 5:
							type = 'Date';
							break;
						case 6:
							type = 'Object';
							break;
						case 7:
							type = 'Schema: ' + tmp.raw;
							break;
						case 8:
							type = 'Enum: ' + JSON.stringify(tmp.raw);
							break;
						case 9:
							type = 'KeyValue: ' + JSON.stringify(tmp.raw);
							break;
					}

					obj.schema.push({ name: key, required: tmp.required, type: type, isArray: tmp.isArray });
				});
			}

			if (output[controller])
				output[controller].push(obj);
			else
				output[controller] = [obj];
		}

		Object.keys(output).forEach(function(key) {
			output[key].quicksort('url', false, 20);
			builder.push({ controller: key, routes: output[key] });
		});

		builder.quicksort('controller');
		builder.description = OPT.description;
		self.view('@quickapi/index', builder);
	});
}