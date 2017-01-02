[![Support](https://www.totaljs.com/img/button-support.png)](https://www.totaljs.com/support/) [![Donate](https://www.totaljs.com/img/button-donate.png)](https://www.totaljs.com/#make-a-donation)

# Simple monitoring of total.js applications

This module can track behaviour of Total.js application. If your web application contains this module, open website `https://monitor.totaljs.com` and register your app.

- console: [monitor.totaljs.com](https://monitor.totaljs.com)
- not limited the performance
- simple installation
- very helpful

## Installation

### 1.

- download the file `dependencies`
- add it into your application root like this:

```html
/your-application-directory/config
/your-application-directory/release.js
/your-application-directory/debug.js
/your-application-directory/dependencies
```

__IMPORTANT:__ the file `dependencies` contains links to other modules: `webcounter` for tracking visitors and `reqstats` for tracking traffic.

---

### 2. or (alternative)

- download the module `monitor.js`
- add it into the modules in your application directory

```html
/your-application-directory/modules/monitor.js
```

__IMPORTANT:__ download other modules too: [webcounter](https://github.com/totaljs/modules/tree/master/Miscellaneous/webcounter) (for tracking visitors) and [reqstats](https://github.com/totaljs/modules/tree/master/Miscellaneous/reqstats) (for tracking traffic).

---

### 3. or (alternative)

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


---

### What's next?

- open total.js monitor console <https://monitor.totaljs.com>
- add your web application into the console (full hostname with protocol (http/https))

### Questions?

Contact me: <petersirka@gmail.com>
