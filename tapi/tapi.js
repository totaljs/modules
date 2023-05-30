// Total.js Module: TAPI
// Author: Peter Širka / Total.js
// Readme: https://github.com/totaljs/modules/tree/master/tapi
// License: MIT

exports.install = function() {
	ROUTE('GET ' + (CONF.tapi || '/tapi/'), api);
};

function api() {

	var $ = this;

	if (TEMP.TAPI) {
		$.json(TEMP.TAPI);
		return;
	}

	var items = [];
	var output = [];

	EACHSCHEMA(function(name, schema) {

		for (var key in schema.actions) {
			var action = schema.actions[key];
			if (action.public)
				items.push({ action: key, schema: name, icon: action.icon, name: action.name, params: action.params || undefined, input: action.input || undefined, ouptut: action.ouptut || undefined, query: action.query || undefined, summary: action.summary });
		}

	});

	for (var key in F.actions) {
		var action = F.actions[key];
		if (action.public)
			items.push({ action: key, icon: action.icon, name: action.name, params: action.params || undefined, input: action.input || undefined, ouptut: action.ouptut || undefined, query: action.query || undefined, summary: action.summary });
	}

	for (var a in F.routes.api) {
		var actions = F.routes.api[a];
		for (var b in actions) {
			var action = actions[b];
			for (var i = 0; i < items.length; i++) {
				var m = items[i];

				if (CONF.tapiendpoint && action.url !== CONF.tapiendpoint)
					continue;

				if (action.action.indexOf(' ' + m.action) !== -1 && (!m.schema || action.action.indexOf(m.schema + ' ') !== -1)) {
					items.splice(i, 1);
					m.id = action.name;
					m.url = $.hostname(action.url);
					m.action = undefined;
					m.schema = undefined;
					output.push(m);
					break;
				}
			}
		}
	}

	TEMP.TAPI = output;
	$.json(output);
}