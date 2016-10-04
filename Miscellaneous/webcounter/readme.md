# Installation

- download and copy `session.js` into the `/modules/` directory __or create a definition with:__

```js
const options = {};

// Counting of XHR requests (default: true):
// options.xhr = true;

// Tracks all online IP addresses (default: false)
// options.ip = true;

// A default URL address of statistics (only for package)
// options.url = '/webcounter/';

INSTALL('module', 'https://modules.totaljs.com/latest/webcounter.js', options);
```

## Instance

```js
var webcounter = MODULE('webcounter');
```

### Online visitors

`console.log(webcounter.online);`

### Today statistics

`console.log(webcounter.today);`

### Instance

`console.log(webcounter.instance);`

## Helpers

- Get online visitors `@{online()}`
- Get count of all unique visitors `@{visitors()}`

## Additional features

### Custom counter

#### Append into statistics:
`MODULE('webcounter').increment('order')` or `MODULE('webcounter').increment('contact-form')`

#### Read from statistics:
`console.log(MODULE('webcounter').today.order);` or `console.log(MODULE('webcounter').today['contact-form']);`
