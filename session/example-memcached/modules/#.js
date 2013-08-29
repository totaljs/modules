
// npm install memcached
var Memcached = require('memcached');

framework.on('load', function() {

    var self = this;
    var session = self.module('session');

    session.memcached = new Memcached('localhost:11212', { retries: 10, retry: 10000, remove: true });

    // read values
    session.onRead = function(id, fnCallback) {

        var self = this;

        self.memcached.get(id, function(err, data) {

            if (err) {
                self.framework.error(err);
                fnCallback({});
                return;
            }

            fnCallback(JSON.parse(data || '{}'));
        });
    };

    // write values
    session.onWrite = function(id, value) {

        var self = this;

        self.set(id, JSON.stringify(value), 5, function (err) {

            if (err)
                self.framework.error(err);
        });
    };

});