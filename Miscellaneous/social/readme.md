# Login with Facebook, Google, LinkedIn, Yahoo, GitHub, DropBox

- copy **social.js** to __/your-totaljs-website/modules/__
- For testing use: [NGROK - proxy tunnel](https://ngrok.com/)
example)

## Functions and Events

```javascript
var social = MODULE('social');

// code === controller.query.code
social.facebook_redirect(key, callbackURL);
social.facebook_profile(key, secret, code, callbackURL, callback(err, user));

// code === controller.query.code
social.google_redirect(key, callbackURL);
social.google_profile(key, secret, code, callbackURL, callback(err, user));

// code === controller.query.code
social.linkedin_redirect(key, callbackURL);
social.linkedin_profile(key, secret, code, callbackURL, callback(err, user));

// code === controller.query.code
social.yahoo_redirect(key, callbackURL);
social.yahoo_profile(key, secret, code, callbackURL, callback(err, user));

// code === controller.query.code
social.github_redirect(key, callbackURL);
social.github_profile(key, secret, code, callbackURL, callback(err, user));

// code === controller.query.code
social.dropbox_redirect(key, callbackURL);
social.dropbox_profile(key, secret, code, callbackURL, callback(err, user));
```
