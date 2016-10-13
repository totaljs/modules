# total-boom
[Boom](https://www.npmjs.org/package/boom) with [Totaljs](https://github.com/totaljs).

## Install

- download and copy `total-boom.js` into the `/modules/` directory
- install `boom` with command
```
    npm install boom --save
```
## Usage

```js
F.route('/boom', boom_with_controller);
F.route('/boom-res', boom_with_response);

function boom_with_controller() {
    var self = this;
    self.boom.badRequest('invalid query');
}

function boom_with_response() {
    var self = this;
    self.res.boom.unauthorized('invalid password');
}

```
For a complete list of boom methods, see the [Boom docs](https://github.com/hapijs/boom#overview)
