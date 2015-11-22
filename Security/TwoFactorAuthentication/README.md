TwoFactorAuthentication
-----------------------

TwoFactorAuthentication is a total.js module to implement 2 Factor Authentication secret generation and OTP verification.

You can use this module with Google Authenticator or any other TOTP based authenticator (f.e. AgileBits 1Password)

Usage
-----

TwoFactorAuthentication is loaded automatically by framework core and it's available as ```T.TFA``` class.

### Methods

#### newSecret()

Creates a new secret code.

```
var secret = F.TFA.newSecret();
```

This can be added directly to your Google Authenticator software and start generating new tokens.

Write secret on user record to use this code later.

#### getQRCode(appname, secret, [format], callback)

Generates a QRCode image via Google Chart API.
Formats: base64 or binary

```
F.TFA.getQRCode('MyAppName', secret, function(err, res) {
	// your code here
});
```

#### getCode(secret, [tolerance])

Generate the expected code based on secret and time.
Tolerance is a value multiple of 30 sec time frame.

```
var code = F.TFA.getCode(secret);
```

#### verify(secret, code, [tolerance])

Verifies the provided code by user with secret key.
Tolerance is the value used for code generation which accepts codes between +/- 30sec (f.e. 8 = 4 minutes before / after the current time). Defauls 1 (- 30 secs to + 30 secs, previous code and next code).
This method returns a boolean.

```
var result = F.TFA.verify(secret, code)
```

#### generateBackupCode()

Generate a backup code, which is stored on user record and used to deactivate 2 factor authentication. (f.e. User lost mobile phone or lost key generator)

Example
-------

```
// Generate a new secret
var secret = F.TFA.newSecret();

// Verify provided secret
var result = F.TFA.verify('PUD2A53PFSYCIWWG', self.post.code, 2);

console.log (result ? 'OK' : 'FAILED');
```
