# JsonWebToken (JWT) implementation for Total.js

- `npm install jsonwebtoken`
- download and copy `jsonwebtoken.js` into the `/modules/` directory __or create a definition with:__

```javascript
INSTALL('module', 'https://modules.totaljs.com/latest/jsonwebtoken.js')
```

__Usage__:

```javascript
var obj = { name: 'total.js' };

// Encrypt
var encoded = F.encrypt(obj, 'KEY');
console.log('encoded', encoded);

// Decrypt
var decoded = F.decrypt(encoded, 'KEY'));
console.log('decoded', decoded);
```
