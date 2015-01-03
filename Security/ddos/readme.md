# Installation

```js
var options = {};

// Maximum requests for user
// options.maximum = 1000;

// Ban timeout
// options.minutes = 5;

INSTALL('module', 'https://modules.totaljs.com/ddos/v1.00/ddos.js', options);
// UNINSTALL('module', 'ddos');
```

or __download module__ from GitHub and copy into `/your-totaljs-website/modules/`.

## Instance

```js
var ddos = MODULE('ddos');
```

## Additional features

Reset all bans: `ddos.reset()`
