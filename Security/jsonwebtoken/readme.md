# JsonWebToken implementation for total.js

- `npm install jsonwebtoken`
- download and copy `jsonwebtoken.js` into the `/modules/` directory

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
