# Installation

__Requirements__:

- Total.js `+v4.0.0`

---

- download module `code.js`
- copy it to `yourapp/modules/code.js`
- update `/config` file
- restart the app

## Configuration

You can change the endpoint for the monitor via the `/config` file of the application like this:

```html
code_url     : /$code/
code_token   : 123456
```

- `code_url` is API endpoint for communicating between Total.js Code Editor and your app
- `code_token` is a security element (optional)