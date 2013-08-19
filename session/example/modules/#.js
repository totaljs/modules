
// npm install redis

var redis = require("redis");
var redis_session = redis.createClient();

framework.on('load', function() {

    var self = this;
    var session = self.module('session');

    // read values
    session.onRead = function(id, fnCallback) {

        // read session value from DB
        redis_session.get(id, function(err, reply) {
            fnCallback(reply ? JSON.parse(reply) : {});
        });
    };

    // write values
    session.onWrite = function(id, value) {
        
        // write session value to DB
        redis_session.set(id, JSON.stringify(value));

    };

});