Simple protection for e.g. **Login forms**.

# Installation

```js
var options = {};

// Timeout for an one attempt
// options.timeout = 3;

// Default maximum attempts
// options.max = 5;

INSTALL('module', 'https://modules.totaljs.com/protection/v1.00/protection.js', options);
// UNINSTALL('module', 'protection');
```

or __download module__ from GitHub and copy into `/your-totaljs-website/modules/`.

## Instance

```js
var protection = MODULE('protection');
```

### Protection.can(name, [max])

```js
// protection.can(name, [max])

if (!protection.can(controller.ip))
   return controller.throw400('Protection for login form.');

// or

if (!protection.can(controller.ip, 3))
   return controller.throw400('Protection for login form.');

// or

if (!protection.can(controller.body.email))
   return controller.throw400('Protection for login form.');

```

### Protection.reset([name])

```js

if (!protection.can(controller.ip))
   return controller.throw400('Protection for login form.');

// reset protection
protection.reset(controller.ip);

// or reset all protection records
protection.reset();
```