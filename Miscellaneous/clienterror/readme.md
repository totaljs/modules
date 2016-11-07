# Installation

__ClientError module__ captures all client-side errors, then it writes into the console or log file on the server-side. The module appends a small JS script into the `@{head}` tag.

- download and copy `clienterror.js` into the `/modules/` directory __or create a definition with:__

```javascript
var options = {};

// options.logger = true;
// options.console = false;
// options.url = '/$clienterror/';

// The framework adds `.log` extension automatically
// options.filename = 'logger';
INSTALL('module', 'https://modules.totaljs.com/latest/clienterror.js', options);
```