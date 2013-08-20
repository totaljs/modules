
framework.on('load', function() {

    var self = this;
    var session = self.module('session');

    // read values
    session.onRead = function(id, fnCallback) {
        fnCallback(framework.cache.read(id));
    };

    // write values
    session.onWrite = function(id, value) {

        // add value to in-memory
        // @key, @value, @expire
        framework.cache.add(id, value, new Date().add('minute', 3));

    };

});