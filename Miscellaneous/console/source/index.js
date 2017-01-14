// MIT License
// Copyright Peter Širka <petersirka@gmail.com>

exports.id = 'console';
exports.version = 'v3.0.0';

const console_log = console.log;
const console_error = console.error;
const console_warn = console.warn;
const history = [];
const output = { history: history };

var ticks = 0;
var options = { history: 50, url: '/$console/', user: '', password: '' };

exports.install = function(opts) {

	U.copy(opts, options);
	F.route(options.url, view_console);
	F.route(options.url, json_console, ['xhr', 'json']);

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

	F.on('controller', auth);
};

exports.uninstall = function() {
	console.log = console_log;
	console.error = console_error;
	console.warn = console_warn;
	F.removeListener('controller', auth);
};

function prepend(type, arg) {
	history.length === options.history && history.shift();
	var dt = new Date();
	ticks = dt.getTime();
	history.push(dt.format('yyyy-MM-dd HH:mm:ss') + ' (' + type + '): ' + append.apply(null, arg));
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
	var self = this;
	self.view('@console/index');
}

function json_console() {

	var self = this;
	var body = self.body;

	if (body.exec) {
		try
		{
			F.eval(body.exec);
		} catch (e) {
			F.error(e);
		}
	}

	if (body.ticks === ticks) {
		self.plain('null');
		return;
	}

	output.ticks = ticks;
	self.json(output);
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
