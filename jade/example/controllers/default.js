exports.install = function(framework) {
	framework.route('/', view_homepage);
};

function view_homepage() {
	var self = this;
	var tobi = { name: 'tobi', age: 2 };
	var loki = { name: 'loki', age: 1 };
	var jane = { name: 'jane', age: 5 };
	self.view('extend', { title: 'pets', pets: [tobi, loki, jane] });
}