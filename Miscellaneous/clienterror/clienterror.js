// MIT License
// Copyright Peter Širka <petersirka@gmail.com>

const Events = require('events');
const REGEXP_BROWSER = /Chrome\/\d+|Firefox\/[0-9.]|Safari\/\d+|MSIE.\d+|Opera\/[0-9.]+/;
var stats_errors = 0;

module.exports = new Events.EventEmitter();
module.exports.name = 'clienterror';
module.exports.usage = () => { errors: stats_errors };
module.exports.options = options = { logger: true, console: false, filename: 'clienterror' }

module.exports.install = function(opts) {
	options = U.extend(options, opts, true);
	F.on('controller', onController);
	F.route('/$clienterror/', process_error, ['post', 'json', 'referer']);
};

module.exports.uninstall = function() {
	F.removeListener('controller', onController);
	module.exports.removeAllListeners();
};

function onController(controller) {
	controller.head("<script>window.onerror=function(e){var err=e.toString();if(window.CLIENTERROR===err)return;window.CLIENTERROR=err;var xhr=new XMLHttpRequest();xhr.open('POST','/$clienterror/',true);xhr.setRequestHeader('Content-type','application/json');xhr.send(JSON.stringify({url:location.href,error:e}));};</script>");
}

function process_error() {
	var self = this;
	var body = self.body;
	var ua = self.req.headers['user-agent'] || '';
	var browser = '';

	self.plain('');
	stats_errors++;

	var r = ua.match(REGEXP_BROWSER);
	if (r)
		browser = r.toString();

	if ((/mobile/i).test(ua))
		browser += ' (mobile)';

	options.logger && self.logger(options.filename, body.url, body.error, browser);
	options.console && console.log('CLIENTERROR:', body.url, body.error, browser);
	module.exports.emit('clienterror', { url: body.url, error: body.error, browser: browser });
}
