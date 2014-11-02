# Installation

```js
var options = {};

// Name of cookie
// options.cookie = '__ssid';

// Secret for encrypt/decrypt
// options.secret = 'N84';

// Timeout
// options.timeout = '5 minutes';

INSTALL('module', 'https://modules.totaljs.com/session/v1.00/session.js', options);
// UNINSTALL('module', 'session');
```

or __download module__ from GitHub and copy into `/your-totaljs-website/modules/`.

## Usage in Controller

- session is a middleware
- session is automatically loaded
- session is automatically saved after is response finished

```js
exports.install = function(framework, options) {
    // IMPORTANT: #session is a middleware
    // You can specify Session into all routes:
    framework.route('/', some_action_in_controller, ['#session']);
    // or
    framework.websocket('/', some_action_in_controller, ['#session']);

    // or for all routes use (this is global middleware for all requests):
    // framework.use('session');
};


function some_action_in_controller() {
    var self = this;

    if (typeof(self.session.counter) === 'undefined')
        self.session.counter = 0;

    self.session.counter++;
    self.view('some-view');
};

```

## REDIS as session storage (example)

> Create some definition file, example: __session-redis.js__

```js

framework.on('install', function(type, name) {

    if (type !== 'module')
        return;

    if (name !== 'session')
        return;

    var session = MODULE('session').instance;

    session.onRead = function(id, callback) {

        // id              = session ID === user ID === browser ID
        // callback(value) = return value from the storage

        redis_client.get('session_' + id, function(err, reply) {
            callback(err ? {} : JSON.parse(reply.toString()));
        });

    };

    session.onWrite = function(id, value) {
        
        // id              = session ID === user ID === browser ID
        // value           = session state
        
        redis_client.set('session_' + id, JSON.stringify(value));

    };
});
```