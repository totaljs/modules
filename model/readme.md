# Module adds support of models

- copy **model.js** to __/your-totaljs-website/modules/__
- this module reads models from __/your-totaljs-website/models/__ directory

Example of structure:

```
| controllers
| definitions
| models
    | subdirectory/user.js
    | user.js
    | product.js
    | order.js
| modules
    | model.js
| public
| debugging.js
| index.js
```

Example of model - user.js:

```js
module.exports = function(param) {
	console.log('param:', param);
	return { alias: '', age: 20, created: new Date() };
};
```

OR

Example of model - product.js:

```js
exports.category = function() {
	return { name: '' };
};

exports.product = function(name, price) {
	return { name: name, price: price };
};
```

#### Usage

```js
framework.module('model')('user')('my-custom-param');
framework.module('model')('subdirectory/user')(mongoose);

framework.module('model')('product').category();
framework.module('model')('product').product('Shoes', 32.34);

// or

controller.module('model')('user')('my-custom-param');
controller.module('model')('subdirectory/user')(mongoose);

controller.module('model')('product').category();
controller.module('model')('product').product('Shoes', 32.34);
```