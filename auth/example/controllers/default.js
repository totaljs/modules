exports.install = function(framework) {
    
    framework.route('/', view_homepage);
    framework.route('/', view_profile, ['authorize']);
    framework.route('/usage/', view_usage);
    
    framework.route('/login/', json_login, ['xhr', 'post']);
    framework.route('/logoff/', json_logoff, ['authorize']);
};

// Homepage & login form
// GET, [unlogged]
function view_homepage() {
    var self = this;
    self.view('homepage');
}

// User profile
// GET, [logged]
function view_profile() {
    var self = this;
    self.json(self.user);

    // in a view @{user.alias}    
}

// Framework usage
// GET
function view_usage() {
    var self = this;
    self.plain(self.framework.usage(true));
}

// Login process
// POST, [xhr, unlogged]
function json_login() {
    var self = this;
    var auth = self.module('authorization');

    // read user information from database
    // this is an example
    var user = { id: '1', alias: 'Peter Sirka' };

    // create cookie
    // save to session
    auth.login(self, user.id, user);

    self.json({ r: true });
}

// Logoff process
// POST, [+xhr, logged]
function json_logoff() {
    var self = this;
    var auth = self.module('authorization');
    var user = self.user;

    // remove cookie
    // remove user session
    auth.logoff(self, user.id);

    self.redirect('/');
}