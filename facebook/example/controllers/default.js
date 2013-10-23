exports.install = function(framework) {
    
    framework.route('/', view_homepage);
    framework.route('/login/facebook/', process_facebook);
    framework.route('/login/facebook/', process_facebook);
};

// Homepage & login form
// GET
function view_homepage() {
    var self = this;
    self.view('homepage');
}

// Process Facebook profile
// GET
function process_facebook() {
    
    var self = this;
    var facebook = self.module('facebook');
    var code = self.get.code || '';

    var key = '346088855483095';
    var secret = '51a88d8de5c8f5627413759bc1c09063';

    if (code === '') {
        var url = facebook.redirect(key, self.host('/login/facebook/'));
        self.redirect(url);
        return;
    }

    facebook.profile(key, secret, code, self.host('/login/facebook/'), function(err, user) {

        if (err) {
            self.view500(err);
            return;
        }

        self.json(user);        
    });

}