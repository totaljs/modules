# Dust view engine

- install npm dust
- copy **dust.js** to __/your-website/modules/__

## Functions

```javascript

function view_homepage() {
	var this = self;

	self.view('homepage');

	// or

	self.view('homepage', { name: 'model' });
	
	// dust === global variable
}

```