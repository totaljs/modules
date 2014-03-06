# doT view engine

- install npm dot
- copy **dot.js** to __/your-totaljs-website/modules/__
- supports !!! __prefixes__ !!!
- [EXAMPLE](https://github.com/petersirka/total.js-modules/tree/master/dot/example)

## Functions

```javascript

function view_homepage() {
	var this = self;

	self.view('homepage');

	// or

	self.view('homepage', { name: 'model' });

	// ./views/homepage.html

	// dot === global variable
	// var fn = dot.template('<h1>Here is a sample template {{=it.foo}}</h1>');
	// var result = fn({foo: 'with doT'});
}

```