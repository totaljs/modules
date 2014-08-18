// MIT License
// Copyright Peter Širka <petersirka@gmail.com>
// Version 1.00

global.dust = require('dust');

var definition = (function() {
    Controller.prototype.view = function (name, model, headers, isPartial) {

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

        var key = 'dust_' + name;

        var fn = framework.cache.read(key);

        if (fn === null) {

            var fs = require('fs');
            var ext = '.html';
            var exists = fs.existsSync(framework.path.views(filename + ext));

            if (!exists) {
                self.throw500('View "' + name + '" not found.');
                return;
            }

            var path = framework.path.views(filename + ext);
            var fn = dust.compile(fs.readFileSync(path).toString('utf8'), name);

            if (!framework.config.debug && fn !== null)
                framework.cache.add(key, fn, new Date().add('m', 4));

            if (fn === null) {
                self.throw500('View "' + name + '" not found.');
                return;
            }
        }

        if (isPartial)
            throw new Error('Dust view engine doesn\'t support partial rendering.');

        self.subscribe.success();

        if (!self.isConnected)
            return self;

        dust.render(name, model, function(err, out) {

            if (err) {
                framework.response500(self.req, self.res, err);
                return;
            }

            framework.responseContent(self.req, self.res, self.status, fn(model), 'text/html', true, headers);
            framework.stats.response.view++;

        });

        return self;
    };
});

setTimeout(function() {
    framework.eval(definition);
}, 100);