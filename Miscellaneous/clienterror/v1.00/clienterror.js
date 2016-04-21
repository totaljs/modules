// MIT License
// Copyright Peter Širka <petersirka@gmail.com>

var events = require('events');
var stats_errors = 0;

function ClientError () {}
ClientError.prototype.__proto__ = new events.EventEmitter();

var clienterror = new ClientError();

module.exports.name = 'clienterror';
module.exports.version = '2.00';
module.exports.on = (name, callback) => clienterror.on(name, callback);
module.exports.instance = clienterror;
module.exports.usage = function() {
    return {
        errors: stats_errors
    };
};

exports.install = function() {

    // Backward compatibility
    var options = F.version >= 1900 ? arguments[0] : arguments[1];

    clienterror.options = Utils.extend({ logger: true, console: false, filename: 'clienterror' }, options, true);

    F.on('controller', onController);
    F.route('/$clienterror/', json_error, ['post', 'json', 'referer']);
};

module.exports.uninstall = function() {
    F.removeListener('controller', onController);
    clienterror = null;
};

function onController(controller) {
    controller.head("<script>window.onerror=function(e){var err=e.toString();if(window.CLIENTERROR===err)return;window.CLIENTERROR=err;var xhr=new XMLHttpRequest();xhr.open('POST','/$clienterror/',true);xhr.setRequestHeader('Content-type','application/json');xhr.send(JSON.stringify({url:window.location.href,error:e}));};</script>");
}

function json_error() {
    var self = this;
    var body = self.body;

    console.log('error')

    self.plain('');

    var ua = self.req.headers['user-agent'] || '';
    var browser = '';

    stats_errors++;

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

    if (clienterror.options.logger)
        self.logger(clienterror.options.filename, body.url, body.error, browser);

    if (clienterror.options.console)
        console.log('CLIENTERROR:', body.url, body.error, browser);

    clienterror.emit('clienterror', {url: body.url, error: body.error, browser: browser});
}
