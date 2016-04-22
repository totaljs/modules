# Installation

__ClientError module__ captures all client-side errors, then it writes into the console or log file on the server-side. The module appends a small JS script into the `@{head}` tag.

```js
var options = {};

// options.logger = true;
// options.console = false;

// The framework adds .log extension automatically
// options.filename = 'logger';
INSTALL('module', 'https://modules.totaljs.com/clienterror/v1.00/clienterror.js', options);

/*
F.on('module#clienterror', function() {
    MODULE('clienterror').on('clienterror', function(err) {
        // EVENT
    });
});
*/
```

__or download__ `clienterror.js` from GitHub and add it into the `/your-application/modules/` then you can set options.
```js
F.on('module#clienterror', function() {
    MODULE('clienterror').options.console = true;
    MODULE('clienterror').options.logger = false;
});
```
