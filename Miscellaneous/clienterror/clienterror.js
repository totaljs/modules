// MIT License
// Copyright Peter Širka <petersirka@gmail.com>

const Events = require('events');
const REGEXP_BROWSER = /Chrome\/\d+|Firefox\/[0-9.]|Safari\/\d+|MSIE.\d+|Opera\/[0-9.]+/;
const REGEXP_MOBILE = /mobile/i;
const USAGE = { errors: [], counter: 0 };

module.exports.name = 'clienterror';
module.exports.usage = () => USAGE;
module.exports.options = options = { logger: true, console: true, filename: 'clienterror', url: '/$clienterror/' };

module.exports.install = function(opt) {
	options = U.extend(options, opt, true);
	F.on('controller', onController);
	F.route(options.url, process_error, ['post', 'json', 'referer']);
};

module.exports.uninstall = function() {
	F.removeListener('controller', onController);
};

function onController(controller) {
	!controller.robot && controller.head("<script>window.onerror=function(e){var err=e.toString();if(window.CLIENTERROR===err)return;window.CLIENTERROR=err;var x=new XMLHttpRequest();x.open('POST','{0}',true);x.setRequestHeader('Content-type','application/json');x.send(JSON.stringify({url:location.href,error:e}));};</script>".format(options.url));
}

function process_error() {
	var self = this;
	var body = self.body;
	var ua = self.req.headers['user-agent'] || '';
	var browser = '';

	self.empty();
	USAGE.counter++;

	var r = ua.match(REGEXP_BROWSER);
	if (r)
		browser = r.toString();

	if (REGEXP_MOBILE.test(ua))
		browser += ' (mobile)';

	options.logger && self.logger(options.filename, body.url, body.error, browser);
	options.console && console.log('CLIENTERROR:', body.url, body.error, browser);

	body.browser = browser;
	body.ip = self.ip;

	USAGE.errors.push(body);
	USAGE.errors.length > 50 && USAGE.errors.shift();
}
