Simple protection for e.g. **Login forms**.

- download and copy `ddos.js` into the `/modules/` directory __or create a definition with:__

```javascript
var options = {};

// Timeout for an one attempt
// options.timeout = 3;

// Default maximum attempts
// options.max = 5;

INSTALL('module', 'https://modules.totaljs.com/latest/protection.js', options);
// UNINSTALL('module', 'protection');
```

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

// resets protection
protection.reset(controller.ip);

// or resets all protection records
protection.reset();
```