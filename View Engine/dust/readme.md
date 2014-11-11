# Dust view engine

- install npm dust
- copy **dust.js** to __/your-website/modules/__

## Functions

```javascript

function view_homepage() {
	var self = this;

	self.view('homepage');

	// or

	self.view('homepage', { name: 'model' });
	
	// dust === global variable
}

```