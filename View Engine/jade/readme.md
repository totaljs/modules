# JADE VIEW ENGINE

- install npm jade
- copy **jade.js** to __/your-website/modules/__

```javascript
function view_homepage() {
	var this = self;

	self.view('homepage');

	// or

	self.view('homepage', { name: 'model' });

	// ./views/homepage.jade

	// jade === global variable
	// jade.render();
}
```