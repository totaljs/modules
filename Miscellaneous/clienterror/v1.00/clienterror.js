exports.id = 'clienterror';
exports.version = '1.00';
exports.options = { logger: true, console: false, filename: 'clienterror' };

function onController(controller) {
    controller.head("<script>window.onerror=function(e){var err=e.toString();if(window.CLIENTERROR===err)return;window.CLIENTERROR=err;var xhr=new XMLHttpRequest();xhr.open('POST','/$clienterror/',true);xhr.setRequestHeader('Content-type','application/json');xhr.send(JSON.stringify({url:window.location.href,error:e}));};</script>");
}

exports.install = function(framework, options) {
    U.copy(options, exports.options);
    F.on('controller', onController);
    F.route('/$clienterror/', json_error, ['post', 'json', 'referer']);
};

exports.uninstall = function() {
    F.removeListener('controller', onController);
};

function json_error() {
    var self = this;
    self.plain('');

    if (exports.options.logger)
        self.logger(exports.options.filename, self.body.url, self.body.error);

    if (exports.options.console)
        console.log('CLIENTERROR:', self.body.url, self.body.error);
}