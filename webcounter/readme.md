# Installation

```js
var options = {};

// Counting of XHR requests:
// options.xhr = true;

// A default URL address of statistics
// options.url = '/webcounter/';

framework.instal('module', 'http://modules.totaljs.com/webcounter/v1.00/webcounter.js', options);
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

Append into statistics:
`MODULE('webcounter').increment('order')` or `MODULE('webcounter').increment('contact-form')`

Read from statistics:
`console.log(MODULE('webcounter').today.order);`