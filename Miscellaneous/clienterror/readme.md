# Installation

__ClientError module__ captures all client-side errors, then it writes into the console or log file on the server-side. The module appends a small JS script into the `@{head}` tag.

- download and copy `clienterror.js` into the `/modules/` directory __or create a definition with:__

```javascript
var options = {};

// options.logger = true;
// options.console = false;

// The framework adds `.log` extension automatically
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