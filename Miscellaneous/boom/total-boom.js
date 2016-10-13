var boom = require('boom');
var helperMethods = ['wrap', 'create'];

function sendBoomOutput(res, boomed) {
    res.send(boomed.output.statusCode, boomed.output.payload);
}

function injectBoom(inject, res) {
    inject.boom = {};
    Object.keys(boom).forEach(function (key) {
        if (typeof boom[key] !== 'function') return;

        if (helperMethods.indexOf(key) !== -1) {
            inject.boom[key] = function () {
                return boom[key].apply(boom, arguments);
            };
        } else {
            inject.boom[key] = function () {
                var boomed = boom[key].apply(boom, arguments);
                sendBoomOutput(res, boomed);
            };
        }
    });
}

F.middleware('boom', function(req, res, next, options, controller) {
    if (res.boom) throw new Error('boom already exists on response object');
    injectBoom(res, res);
    next();
});

F.use('boom');
F.on("controller", onController);

function onController(controller) {
    injectBoom(controller, controller.res);
}

exports.uninstall = function() {
    F.uninstall('middleware', 'boom');
    F.removeListener('controller', onController);
};

exports.sendBoomOutput = sendBoomOutput;
