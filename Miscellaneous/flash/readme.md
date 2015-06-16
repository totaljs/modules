# Flash messages

- inspired from <https://github.com/jaredhanson/connect-flash>
- cookie per session + session timeout 5 minutes
- copy __flash.js__ to /your-totaljs-website/modules/

### Usage

```javascript
exports.install = function() {
    F.route('/', json_index, ['#flash']);
    F.route('/flash/', redirect_flash, ['#flash']);
    // or use global middleware
    // F.use('flash');
};

function json_index() {
    var self = this;
    // self.json(self.flash('info'))
    self.json(self.flash());
}

function redirect_flash() {
    var self = this;
    // self.req.flash()
    self.flash('info', 'Flash is back!');
    self.redirect('/');
}
```

```html
@{flash('info')} <b>returns array</b>
```