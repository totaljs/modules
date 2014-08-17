# Swig view engine

- install npm swig
- copy **swig.js** to __/your-website/modules/__

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