// MCP router
// The MIT License
// Copyright 2026 (c) Peter Širka <petersirka@gmail.com> | Total.js
// Version: 1

/*
	// Supports: query, params, input, output
	NEWACTION('Name', {
		mcp: true
		action: function($, model) {

		}
	});
*/

MAIN.mcp = {};
MAIN.mcp.tools = [];

ROUTE('POST /mcp/ <5MB', async function($) {

	let auth = $.headers.authorization || '';
	let token = CONF.mcp_auth || CONF.mcp_token || MAIN.mcp.token || MAIN.mcp.auth;

	if (auth || token) {
		if (!auth.includes(token)) {
			$.response.status = 401;
			$.json({ error: { message: 'Unauthorized' }});
			return;
		}
	}

	let data = $.body;
	let response = {};

	if (data.id == null || data.method === 'notifications/initialized') {
		$.empty();
		return;
	}

	response.jsonrpc = data.jsonrpc;
	response.id = data.id;

	if (data.method === 'initialize') {
		response.result = {
			protocolVersion: '2025-11-25',
			capabilities: {
				tools: {}
			},
			serverInfo: {
				name: CONF.name,
				version: CONF.version
			}
		};
		$.json(response);
		return;
	}

	if (data.method === 'server/discover') {
		response.result = {
			supportedVersions: ['2026-07-28'],
			capabilities: {
				tools: {}
			},
			_meta: {
				"io.modelcontextprotocol/serverInfo": {
					name: CONF.author,
					version: CONF.version
				}
			}
		};
		$.json(response);
		return;
	}

	if (data.method === 'tools/list') {
		response.result = {
			resultType: 'complete',
			tools: MAIN.mcp.tools,
			ttlMs: 0,
			cacheScope: 'private'
		};
		$.json(response);
		return;
	}

	if (data.method === 'tools/call') {

		let params = data.params;
		let action = Total.actions[params.name];
		if (action && action.mcp) {
			let builder = ACTION(params.name, params.arguments.input);
			builder.query(params.arguments.query);
			builder.params(params.arguments.params);
			builder.user({ sa: true, name: 'AI' });
			try {
				response.result = await builder.promise($);
			} catch (e) {
				response.error = { message: e.toString() };
			}

		} else {
			response.error = { message: 'Unknown tool: ' + params.name };
		}

	}

	if (response.error)
		$.response.status = 400;

	$.json(response);

});

NEWACTION('MCP|exec', {
	name: 'Exec action',
	input: '*schema,data:Object,query:Object,params:Object',
	action: function($, model) {

		let action = $.action(model.schema, model.data);

		if (model.query)
			action.query(model.query);

		if (model.params)
			action.params(model.params);

		action.callback($);
	}
});

MAIN.mcp.refresh = function() {

	MAIN.mcp.tools.length = 0;

	for (let key in Total.actions) {
		let action = Total.actions[key];
		if (action.mcp) {

			let obj = {};
			obj.name = key;
			obj.description = action.summary || action.name;

			let properties = {};

			properties.schema = {
				type: 'string',
				const: key,
				description: "Total.js schema (action) name. Always use '{0}'.".format(key)
			};

			if (action.jsinput) {

				let input = {};

				for (let k in action.jsinput.properties) {
					let prop = action.jsinput.properties[k];
					let tmp = {};

					tmp.type = prop.type;

					if (prop.nullable)
						tmp.type = [tmp.type, 'null'];

					tmp.description = prop.summary || prop.description;
					input[k] = tmp;
				}

				properties.data = {
					type: 'object',
					description: 'Payload passed to this action.',
					properties: input,
					required: action.jsinput.required
				};
			}

			if (action.jsquery) {

				let input = {};

				for (let k in action.jsquery.properties) {
					let prop = action.jsquery.properties[k];
					let tmp = {};
					tmp.type = prop.type;
					if (prop.nullable)
						tmp.type = [tmp.type, 'null'];
					tmp.description = prop.summary || prop.description;
					input[k] = tmp;
				}

				properties.query = {
					type: 'object',
					description: 'URL query parameters passed to this action.',
					properties: input,
					required: action.jsquery.required
				};
			}

			if (action.jsparams) {

				let input = {};

				for (let k in action.jsparams.properties) {
					let prop = action.jsparams.properties[k];
					let tmp = {};
					tmp.type = 'string';
					tmp.description = prop.summary || prop.description;
					input[k] = tmp;
				}

				properties.query = {
					type: 'object',
					description: 'Params passed to this action.',
					properties: input,
					required: action.jsparams.required
				};
			}

			obj.inputSchema = {
				type: 'object',
				properties: properties,
				required: Object.keys(properties)
			};

			if (action.jsoutput) {
				properties = {};
				for (let k in action.jsoutput.properties) {
					let prop = action.jsoutput.properties[k];
					let tmp = {};
					tmp.type = prop.type;
					if (prop.nullable)
						tmp.type = [tmp.type, 'null'];
					tmp.description = prop.summary || prop.description;
					properties[k] = tmp;
				}

				obj.outputSchema = {
					type: 'object',
					properties: properties,
					required: EMPTYARRAY
				};
			}

			MAIN.mcp.tools.push(obj);
		}
	}
};

ON('ready', MAIN.mcp.refresh);