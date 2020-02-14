// MIT License
// Copyright Peter Širka <petersirka@gmail.com>

const USAGE = { errors: [], counter: 0 };

exports.name = 'clienterror';
exports.usage = () => USAGE;
exports.options = { logger: true, console: true, filename: 'clienterror', url: '/$clienterror/' };
exports.version = 'v3.0.0';

var options = exports.options;

exports.install = function(opt) {
	options = U.extend(options, opt, true);
	ON('controller', controller);
	ROUTE('POST ' + options.url, process_error, ['referer']);
};

exports.uninstall = function() {
	OFF('controller', controller);
};

function controller(controller) {
	!controller.robot && controller.head("<script>window.onerror=function(e){var err=(e.stack||e).toString();if(window.CLIENTERROR===err)return;window.CLIENTERROR=err;var x=new XMLHttpRequest();x.open('POST','{0}',true);x.setRequestHeader('Content-type','application/json');x.send(JSON.stringify({url:location.href,error:e}));};</script>".format(options.url));
}

function process_error() {
	var self = this;
	var body = self.body;
	var ua = self.req.headers['user-agent'] || '';
	var browser = '';

	self.empty();
	USAGE.counter++;

	options.logger && self.logger(options.filename, body.url, body.error, browser, self.ip);
	options.console && console.log('CLIENTERROR:', body.url, body.error, browser, self.ip);

	body.browser = ua ? ua.parseUA() : 'Unknown';
	body.ip = self.ip;

	USAGE.errors.push(body);
	USAGE.errors.length > 50 && USAGE.errors.shift();
}
