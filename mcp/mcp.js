// MCP router
// The MIT License
// Copyright 2026 (c) Peter Širka <petersirka@gmail.com> | Total.js
// Version: 2

/*
	// Supports: input, query, params, output
	// Field comments (// ...) are used as tool argument descriptions and as validation messages
	NEWACTION('Name', {
		mcp: true,
		input: '*name:String // User name',
		action: function($, model) {

		}
	});

	// tools/call arguments: { input: {}, query: {}, params: {} }
	// Authorization: CONF.mcp_token (or CONF.mcp_auth, MAIN.mcp.token) + "Authorization: Bearer <token>"
*/

MAIN.mcp = {};
MAIN.mcp.tools = [];

// Converts a parsed Total.js schema (jsinput, jsquery, jsparams, jsoutput) into JSON Schema
function convert(schema, forceString) {

	let properties = {};

	for (let key in schema.properties || {}) {

		let prop = schema.properties[key];
		let tmp = {};

		tmp.type = forceString ? 'string' : prop.type;

		if (prop.type === 'array' && prop.items && !forceString)
			tmp.items = { type: prop.items.type };

		if (prop.enum)
			tmp.enum = prop.enum;

		if (prop.nullable && !forceString)
			tmp.type = [tmp.type, 'null'];

		let description = (schema.errors && schema.errors[key]) || prop.summary || prop.description;
		if (description)
			tmp.description = description;

		properties[key] = tmp;
	}

	return properties;
}

function section(properties, required, name, schema, description, forceString) {
	properties[name] = {
		type: 'object',
		description: description,
		properties: convert(schema, forceString)
	};
	if (schema.required && schema.required.length) {
		properties[name].required = schema.required;
		required.push(name);
	}
}

function rpcerror($, response, code, message) {
	response.error = { code: code, message: message };
	$.json(response);
}

function toolerror(response, message) {

	if (typeof(message) !== 'string')
		message = message == null ? 'Tool execution failed' : String(message);

	response.result = {
		content: [{ type: 'text', text: message }],
		isError: true
	};
}

ROUTE('POST /mcp/ <5MB', async function($) {

	let data = $.body;
	let response = {};
	let token = CONF.mcp_auth || CONF.mcp_token || MAIN.mcp.token || MAIN.mcp.auth;

	if (token) {
		let auth = ($.headers.authorization || '').replace(/^Bearer\s+/i, '').trim();
		if (auth !== token) {
			$.response.status = 401;
			$.json({
				jsonrpc: '2.0',
				id: data && data.id !== undefined ? data.id : null,
				error: { code: -32001, message: 'Unauthorized' }
			});
			return;
		}
	}

	if (!data || data instanceof Array || typeof(data) !== 'object') {
		$.json({ jsonrpc: '2.0', id: null, error: { code: -32600, message: 'Invalid Request' }});
		return;
	}

	// Notifications do not have an id and MUST NOT receive a response.
	if (data.id === undefined) {
		$.empty();
		return;
	}

	response.jsonrpc = '2.0';
	response.id = data.id;

	if (data.jsonrpc !== '2.0' || typeof(data.method) !== 'string') {
		rpcerror($, response, -32600, 'Invalid Request');
		return;
	}

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

	if (data.method === 'ping') {
		response.result = {};
		$.json(response);
		return;
	}

	if (data.method === 'tools/list') {
		response.result = {
			tools: MAIN.mcp.tools
		};
		$.json(response);
		return;
	}

	if (data.method === 'tools/call') {

		let params = data.params || {};

		if (!params || typeof(params) !== 'object' || typeof(params.name) !== 'string') {
			rpcerror($, response, -32602, 'Invalid tools/call parameters');
			return;
		}

		let args = params.arguments || {};
		let action = Total.actions[params.name];

		if (!action || !action.mcp) {
			rpcerror($, response, -32602, 'Unknown tool: ' + params.name);
			return;
		}

		if (args == null || typeof(args) !== 'object' || Array.isArray(args)) {
			rpcerror($, response, -32602, 'Tool arguments must be an object');
			return;
		}

		let input = Object.prototype.hasOwnProperty.call(args, 'input') ? args.input : args.data;
		let builder = ACTION(params.name, input);

		if (args.query)
			builder.query(args.query);

		if (args.params)
			builder.params(args.params);

		builder.user({ sa: true, name: 'AI' });

		let errors = null;

		try {
			builder.options.error = err => errors = err.output();
			let output = await builder.promise();

			if (errors) {
				toolerror(response, typeof(errors) === 'string' ? errors : JSON.stringify(errors));
			} else {
				let text = typeof(output) === 'string' ? output : JSON.stringify(output);
				if (text == null)
					text = String(output);

				response.result = {
					content: [{ type: 'text', text: text }]
				};

				// In protocol version 2025-11-25 structuredContent must be a JSON object.
				// Keep the text representation for scalars, arrays and null values.
				if (output && typeof(output) === 'object' && !Array.isArray(output))
					response.result.structuredContent = output;
			}
		} catch (e) {
			// Tool errors (validation, $.invalid) are reported inside the result so the model can react to them
			toolerror(response, e.toString());
		}

		$.json(response);
		return;
	}

	rpcerror($, response, -32601, 'Method not found: ' + data.method);
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
		if (!action.mcp)
			continue;

		let obj = {};
		obj.name = key;
		obj.description = action.summary || action.name;

		let properties = {};
		let required = [];

		if (action.jsinput)
			section(properties, required, 'input', action.jsinput, 'Payload (request body) passed to this action.');

		if (action.jsquery)
			section(properties, required, 'query', action.jsquery, 'URL query parameters passed to this action.');

		if (action.jsparams)
			section(properties, required, 'params', action.jsparams, 'URL params passed to this action.', true);

		obj.inputSchema = {
			type: 'object',
			properties: properties,
			required: required
		};

		if (action.jsoutput) {
			obj.outputSchema = {
				type: 'object',
				properties: convert(action.jsoutput),
				required: action.jsoutput.required || EMPTYARRAY
			};
		}

		MAIN.mcp.tools.push(obj);
	}
};

ON('ready', MAIN.mcp.refresh);
