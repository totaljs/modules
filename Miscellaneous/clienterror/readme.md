# Installation

__ClientError module__ captures all client-side errors, then it writes into the console or log file on the server-side.

```js
var options = {};

// options.logger = true;
// options.console = false;

// The framework adds .log extension automatically
// options.filename = 'logger';

INSTALL('module', 'https://modules.totaljs.com/clienterror/v1.00/clienterror.js', options);
```

__or download__ `clienterror.js` from GitHub and add it into the `/your-application/modules/`.