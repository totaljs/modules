# Swig view engine

- install npm swig
- copy **swig.js** to __/your-totaljs-website/modules/__
- [EXAMPLE](https://github.com/petersirka/total.js-modules/tree/master/swig/example)

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