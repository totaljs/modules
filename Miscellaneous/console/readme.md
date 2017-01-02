# Installation

With this module __you can control a whole application__. The module contains real-time console with textbox for performing custom commands.

- download and copy `console.package` into the `/packages/` directory __or create a definition with:__

```javascript
var options = {};

// A credential is optional:
// options.user = 'login name';
// options.password = 'login password';

// options.url = '/$console/';

INSTALL('package', 'https://modules.totaljs.com/latest/console.package', options);
```

![Console](https://www.totaljs.com/exports/module-console.png)