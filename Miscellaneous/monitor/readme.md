![total.js logo](https://www.totaljs.com/img/signature.png)

# Simple monitoring of total.js applications

This module is for mobile application for watching behaviour of the application. If your web application contains this module, open website `https://monitor.totaljs.com` and register your app.

## Installation

### 1.

- download the file `dependenies`
- add it into your application root

```html
/your-application-directory/config
/your-application-directory/release.js
/your-application-directory/debug.js
/your-application-directory/dependencies
```

IMPORTANT: the file `dependencies` contains links to other modules `webcounter` (for tracking visitors) and `reqstats` (for tracking traffic).

### 2.

- download the module `monitor.js`
- add it into modules in your application directory

```html
/your-application-directory/moduels/monitor.js
```

IMPORTANT: download other modules too [webcounter](https://github.com/totaljs/modules/tree/master/Miscellaneous/webcounter) (for tracking visitors) and [reqstats](https://github.com/totaljs/modules/tree/master/Miscellaneous/reqstats) (for tracking traffic).

### 3.

- create some definition file e.g. `/definitions/modules.js`
- put into the file below text

```javascript
// WebCounter module
INSTALL('module', 'https://modules.totaljs.com/latest/webcounter.js');

// Request stats module
INSTALL('module', 'https://modules.totaljs.com/latest/reqstats.js');

// Total.js monitoring
INSTALL('module', 'https://modules.totaljs.com/latest/monitor.js');
```

