exports.install = function() {
	F.route('/products/', view_products);
	F.route('/products/each/', view_products_each);
};

function view_products() {
	var self = this;

	var users = {
		tj: { age: 23, email: 'tj@vision-media.ca', isA: 'human' },
		tobi: { age: 1, email: 'tobi@is-amazing.com', isA: 'ferret' }
	};

	// loads from /views/each.jade
	self.view('~each', { users: users });
}

function view_products_each() {
	var self = this;

	var users = {
		tj: { age: 23, email: 'tj@vision-media.ca', isA: 'human' },
		tobi: { age: 1, email: 'tobi@is-amazing.com', isA: 'ferret' }
	};

	// loads from /views/products/each.jade
	self.view('each', { users: users });
}