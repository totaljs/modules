# Handlebars.js

- install npm handlebars
- copy **handlebars.js** to __/your-website/modules/__

```javascript
MODULE('handlerbars').helper(name, fn); // ---> handlerbars.registerHelper()
MODULE('handlerbars').partial(name, value); // ---> handlebars.registerPartial()
```

```javascript
function view_homepage() {
    var self = this;

    self.view('homepage');

    // or

    self.view('homepage', { name: 'model' });

    // ./views/homepage.html

    // handlebars === global variable
}
```