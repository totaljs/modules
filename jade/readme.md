# JADE VIEW ENGINE

- install npm jade
- copy **jade.js** to __/your-partialjs-website/modules/__
- supports !!! __prefixes__ !!!
- [EXAMPLE](https://github.com/petersirka/partial.js-modules/tree/master/jade/example)

## Functions

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