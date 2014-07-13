# Installation

```js
var options = {};

// Name of cookie
// options.cookie = '__ssid';

// Secret for encrypt/decrypt
// options.secret = 'N84';

// Timeout
// options.timeout = '5 minutes';

framework.instal('module', 'http://modules.totaljs.com/session/v1.00/session.js', options);
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
    framework.install('/', some_action_in_controller, ['#session']);

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

## Additional features

Reset all bans: `ddos.reset()`
