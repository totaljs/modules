# Installation

The package contains HTML CSS JS for rendering statistics while the classic module is the clean module (without routes, HTML, CSS, etc.) for custom rendering.

```js
var options = {};

// Counting of XHR requests:
// options.xhr = true;

// A default URL address of statistics
// options.url = '/webcounter/';

// INSTALL('module', 'https://modules.totaljs.com/webcounter/v1.01/webcounter.js', options);
INSTALL('package', 'https://modules.totaljs.com/webcounter/v1.01/webcounter.package', options);
// UNINSTALL('module', 'webcounter');
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
