# Installation

- download and copy `ddos.js` into the `/modules/` directory __or create a definition with:__

```javascript
var options = {};

// Maximum requests for IP
// options.maximum = 1000;

// Ban timeout
// options.minutes = 5;

INSTALL('module', 'https://modules.totaljs.com/latest/ddos.js', options);
// UNINSTALL('module', 'ddos');
```

## Instance

```js
var ddos = MODULE('ddos');
```

## Additional features

Reset all bans: `ddos.reset()`
