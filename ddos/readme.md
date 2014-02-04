# Simple preventing of DDOS

- copy **ddos.js** to __/your-totaljs-website/modules/__

## Properties

```javascript
var ddos = framework.module('ddos');

// Maximum request per IP
// ip += 1 every request, but every second ip -= 1;
// default 1000
ddos.options.maximum = 1000;

// IP ban in minutes
// default 5
ddos.options.minutes = 5;
```