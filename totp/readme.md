# TOTP: Time-Based One-Time Password Algorithm

- mobile apps: Google Authenticator or Microsoft Authenticator
- download and copy `totp.js` into the `/modules/` directory __or create a definition with:__

## Usage

```js
const Totp = MODULE('totp');
```

### Generating secret

```js
// Generates unique secret key
var meta = Totp.generate(label, issuer, type);
// @label {String} a label for the key
// @issuer {String} a issuer
// @type {String} password type (optional), can be `totp` (time-based password, default) or `hotp` (one-time password)
// returns {Object}

// Response
meta.secret;  // {String} a generated secret
meta.url;     // {String} an optimized url address for tokenization
meta.qrcode;  // {String} a link to the picture with QR code
```

### Checking token

```js
var result = Totp.totpverify(secret, token);
// @result {Object}

if (result == null) {
	console.log('NOT VALID');
} else {
	console.log(result); // { delta: NUMBER }
}
```