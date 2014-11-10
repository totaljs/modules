# Swig view engine

- install npm swig
- copy **swig.js** to __/your-website/modules/__

```javascript
function view_homepage() {
	var self = this;

	self.view('homepage');

	// or

	self.view('homepage', { name: 'model' });

	// swig === global variable
}
```