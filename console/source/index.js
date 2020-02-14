// MIT License
// Copyright Peter Širka <petersirka@gmail.com>

exports.id = 'console';
exports.version = 'v4.0.0';

const history = [];
const console_log = console.log;
const console_error = console.error;
const console_warn = console.warn;
const MSG_INIT = { TYPE: 'init', history: history };
const MSG_BODY = { TYPE: 'add' };

var options = { history: 50, url: '/$console/', user: '', password: '' };
var websocket = null;

exports.install = function(opts) {

	U.copy(opts, options);

	ROUTE('GET ' + options.url, view_console);
	WEBSOCKET(options.url, websocket_action, ['json']);

	console.log = function() {
		prepend('log', arguments);
		console_log.apply(console_log, arguments);
	};

	console.error = function() {
		prepend('error', arguments);
		console_error.apply(console_error, arguments);
	};

	console.warn = function() {
		prepend('warn', arguments);
		console_warn.apply(console_warn, arguments);
	};

	ON('controller', auth);
};

exports.uninstall = function() {
	console.log = console_log;
	console.error = console_error;
	console.warn = console_warn;
	F.removeListener('controller', auth);
};

function websocket_action() {

	var self = this;

	websocket = self;

	self.autodestroy(() => websocket = null);

	self.on('open', function(client) {

		if (options.user && options.password) {
			if ((options.user + ':' + options.password).hash().toString() !== client.query.token) {
				client.attacker = true;
				client.close();
				return;
			}
		}

		client.send(MSG_INIT);
	});

	self.on('message', function(client, command) {

		if (client.attacker)
			return;

		try
		{
			F.eval(command);
		} catch (e) {
			F.error(e);
		}
	});
}

function prepend(type, arg) {
	history.length === options.history && history.shift();
	var dt = new Date();
	var str = dt.format('yyyy-MM-dd HH:mm:ss') + ' (' + type + '): ' + append.apply(null, arg);
	history.push(str);
	if (websocket) {
		MSG_BODY.body = str;
		websocket.send(MSG_BODY);
	}
}

function append() {

	var output = '';

	for (var i = 0; i < arguments.length; i++) {

		if (i)
			output += ' ';

		var value = arguments[i];

		if (value === null) {
			output += 'null';
			continue;
		}

		if (value === undefined) {
			output += 'undefined';
			continue;
		}

		var type = typeof(value);

		if (type === 'string' || type === 'number' || type === 'boolean')
			output += value.toString();
		else
			output += JSON.stringify(value);
	}

	return output;
}

function view_console() {
	this.view('@console/index', options.user && options.password ? (options.user + ':' + options.password).hash().toString() : '');
}

function auth(controller) {

	if (controller.name !== '#console' || !options.user || !options.password)
		return;

	var user = controller.baa();
	if (user.empty) {
		controller.baa('Console:');
		controller.cancel();
		return;
	}

	if (user.user !== options.user || user.password !== options.password) {
		controller.throw401();
		controller.cancel();
	}
}
