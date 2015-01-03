// MIT License
// Copyright Peter Širka <petersirka@gmail.com>
// Version 1.00

global.swig = require('swig');

var definition = (function() {

    swig.setDefaults({ cache: !framework.config.debug });

    Controller.prototype.view = function(name, model, headers, isPartial) {

        var self = this;

        if (isPartial === undefined && typeof(headers) === BOOLEAN) {
            isPartial = headers;
            headers = null;
        }

        if (self.res.success && !isPartial)
            return self;

        var skip = name[0] === '~';
        var filename = name;
        var isLayout = self.isLayout;

        self.isLayout = false;

        if (!self.isLayout && !skip)
            filename = self._currentView + name;

        if (skip)
            filename = name.substring(1);

        var key = 'swig_' + name;
        var fn = framework.cache.read(key);
        var ext = '.html';


        if (fn === null) {

            filename = framework.path.views(filename + ext);
            var exists = fs.existsSync(filename);

            if (!exists) {
                self.throw500('View "' + name + '" not found.');
                return;
            }

            fn = swig.compileFile(filename);

            if (!self.config.debug && fn !== null)
                framework.cache.add(key, fn, new Date().add('m', 4));

            if (fn === null) {
                self.throw500('View "' + name + '" not found.');
                return;
            }
        }

        var output = fn(model);

        if (isPartial)
            return output;

        if (!self.isConnected)
            return self;

        framework.responseContent(self.req, self.res, self.status, output, 'text/html', true, headers);
        framework.stats.response.view++;
        self.subscribe.success();

        return self;
    };
});

setTimeout(function() {
    framework.eval(definition);
}, 100);