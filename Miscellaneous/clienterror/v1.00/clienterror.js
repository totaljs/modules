// MIT License
// Copyright Peter Širka <petersirka@gmail.com>

exports.id = 'clienterror';
exports.version = '1.00';
exports.options = { logger: true, console: false, filename: 'clienterror' };

function onController(controller) {
	controller.head("<script>window.onerror=function(e){var err=e.toString();if(window.CLIENTERROR===err)return;window.CLIENTERROR=err;var xhr=new XMLHttpRequest();xhr.open('POST','/$clienterror/',true);xhr.setRequestHeader('Content-type','application/json');xhr.send(JSON.stringify({url:window.location.href,error:e}));};</script>");
}

exports.install = function() {
	// Backward compatibility
	var options = F.version >= 1900 ? arguments[0] : arguments[1];
	U.copy(options, exports.options);
	F.on('controller', onController);
	F.route('/$clienterror/', json_error, ['post', 'json', 'referer']);
};

exports.uninstall = function() {
	F.removeListener('controller', onController);
};

function json_error() {
	var self = this;

	var ua = self.req.headers['user-agent'] || '';
	var browser = '';

	var r = ua.match(/Chrome\/\d+/);
	if (r)
		browser = r.toString();
	else {
		r = ua.match(/Firefox\/[0-9.]+/);
		if (r)
			browser = r.toString();
		else {
			r = ua.match(/Safari\/\d+/);
			if (r)
				browser = r.toString();
			else {
				r = ua.match(/MSIE.\d+/);
				if (r)
					browser = r.toString();
				else {
					r = ua.match(/Opera\/[0-9.]+/);
					if (r)
						browser = r.toString();
					else {
						browser = ua;
					}
				}
			}
		}
	}

	if ((/mobile/i).test(ua))
		browser += ' (mobile)';

	if (exports.options.logger)
		self.logger(exports.options.filename, self.body.url, self.body.error, browser);

	if (exports.options.console)
		console.log('CLIENTERROR:', self.body.url, self.body.error, browser);

	self.plain('');
}