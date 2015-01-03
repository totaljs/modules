exports.install = function(framework) {
    framework.route('/', view_homepage);
};

function view_homepage() {
    var self = this;
    var data = {'name': 'Alan', 'hometown': 'Somewhere, TX', 'kids': [{'name': 'Jimmy', 'age': '12'}, {'name': 'Sally', 'age': '4'}]};
    self.view('homepage', data);
}