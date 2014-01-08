# Swig view engine

- partial.js version +v1.3.1
- install npm swig
- copy **swig.js** to __/your-partialjs-website/modules/__
- [EXAMPLE](https://github.com/petersirka/partial.js-modules/tree/master/swig/example)

## Functions

```javascript
function view_homepage() {
	var this = self;

	self.view('homepage');

	// or

	self.view('homepage', { name: 'model' });

	// ./views/homepage.html

	// swig === global variable
}
```