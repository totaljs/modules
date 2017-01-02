# PUG VIEW ENGINE

- install npm jade
- copy **pug.js** to __/your-website/modules/__

```javascript
function view_homepage() {
	var self = this;

	self.view('homepage');

	// or

	self.view('homepage', { name: 'model' });

	// ./views/homepage.pug

	// pug === global variable
	// pug.render();
}
```