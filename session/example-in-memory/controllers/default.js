exports.install = function(framework) {

    framework.route('/', view_homepage);
};

// Homepage & login form
// GET, [unlogged]
function view_homepage() {
    var self = this;

    if (utils.isEmpty(self.session))
		self.session = { count: 0 };

	self.session.count++;

    self.json(self.session);
}
