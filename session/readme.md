# Session module

- partial.js version +v1.2.5-0
- copy **session.js** to __/your-partialjs-website/modules/__
- [REDIS EXAMPLE](https://github.com/petersirka/partial.js-modules/tree/master/session/example)
- [IN-MEMORY EXAMPLE](https://github.com/petersirka/partial.js-modules/tree/master/session/example-in-memory)

## Functions and Events

```javascript

var session = framework.module('session');

/*
	Load delegate
	@id {String}
	@fnCallback {Function} :: fnCallback(obj) :: @obj {Object}
*/
session.onRead = function(id, fnCallback) {

	// read session value
	// read from DB by @id param

	fnCallback({ name: 'PETER' });
	
};

/*
	Save delegate
	@id {String}
	@value {Object}
*/
session.onWrite = function(id, value) {

	// write session value to DB

};

// ==========================================
// EVENTS
// ==========================================

session.on('read', function(id, value) {});
session.on('write', function(id, value) {});

```


## Example

### /controllers/default.js

```javascript

exports.install = function(framework) {
	framework.route('/', view_homepage);
};

function view_homepage() {

	var self = this;
	var session = self.session;

	if (utils.isEmpty(session))
		session = { count: 0 };

	session.count++;
	self.json(session);
}

```

### /modules/#.js

```javascript

// npm install redis
var redis = require("redis");
var redis_session = redis.createClient();

framework.on('load', function() {

    var self = this;
    var session = self.module('session');

    // load values
    session.onRead = function(id, fnCallback) {

        // read session value
        redis_session.get(id, function(err, reply) {
            fnCallback(reply ? JSON.parse(reply) : {});
        });

    };

    // save values
    session.onWrite = function(id, value) {
        // save session value
        redis_session.set(id, JSON.stringify(value));
    };

});

```