# doT view engine

- install npm dot
- copy **dot.js** to __/your-website/modules/__

```javascript
function view_homepage() {
	var self = this;

	self.view('homepage');

	// or

	self.view('homepage', { name: 'model' });

	// dot === global variable
	// var fn = dot.template('<h1>Here is a sample template {{=it.foo}}</h1>');
	// var result = fn({foo: 'with doT'});
}

```