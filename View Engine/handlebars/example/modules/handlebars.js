// MIT License
// Copyright Peter Širka <petersirka@gmail.com>
// Version 1.01

global.Handlebars = require('handlebars');

var definition = (function() {
    Controller.prototype.view = function (name, model, headers, isPartial) {

        var self = this;
        var skip = name[0] === '~';

        if (!self.isLayout && !skip)
            name = self._currentView + name;

        if (skip)
            name = name.substring(1);

        if (typeof(isPartial) === UNDEFINED && typeof(headers) === BOOLEAN) {
            isPartial = headers;
            headers = null;
        }

        var filename = name;
        var key = 'handlebars_' + name;

        var fn = framework.cache.read(key);

        if (fn === null) {

            var fs = require('fs');
            var ext = '.html';
            var exists = fs.existsSync(framework.path.views(filename + ext));

            if (!exists) {
                self.view500('View "' + name + '" not found.');
                return;
            }

            var path = framework.path.views(filename + ext);
            var options = utils.extend({ filename: path }, exports.options);

            var fn = Handlebars.compile(fs.readFileSync(path).toString('utf8'), options);

            if (!framework.config.debug && fn !== null)
                framework.cache.add(key, fn, new Date().add('m', 4));

            if (fn === null) {
                self.view500('View "' + name + '" not found.');
                return;
            }
        }

        if (isPartial)
            return fn(model);

        self.subscribe.success();

        if (self.isConnected) {
            framework.responseContent(self.req, self.res, self.status, fn(model), 'text/html', true, headers);
            framework.stats.response.view++;
        }

        return self;
    };
});

setTimeout(function() {
    framework.eval(definition);
}, 100);

exports.name = 'handlebars';
exports.version = '1.01';

exports.helper = function(name, fn) {
    Handlebars.registerHelper(name, fn);
};

exports.partial = function(name, value) {
    Handlebars.registerPartial(name, value);
};