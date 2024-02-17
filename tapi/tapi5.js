exports.install = function() {
	ROUTE('GET ' + (CONF.tapi || '/tapi/'), api);
};

function api($) {

	if (TEMP.TAPI) {
		$.json(TEMP.TAPI);
		return;
	}

	var routes = F.sourcemap().routes;
	var response = [];

	for (var item of routes) {
		if (item.public && item.url === CONF.$api)
			response.push({ id: item.id, name: item.name, summary: item.summary, params: item.params, query: item.query, input: item.input, output: item.output });
	}

	TEMP.TAPI = response;
	$.json(TEMP.TAPI);
}