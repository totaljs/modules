# Installation

- download and copy `auth.js` into the `/modules/` directory __or create a definition with:__

```javascript
var options = {};

// Name of cookie
// options.cookie = '__user';

// Secret for encrypt/decrypt
// options.secret = 'N84';

// Session expiration
// options.expireSession = 10; // minutes

// Cookie expiration
// options.expireCookie = 10; // days

// Auto-login
// options.autoLogin = true;

INSTALL('module', 'https://modules.totaljs.com/latest/auth.js', options);
// UNINSTALL('module', 'auth');
```

## Properties and Functions and Events

```javascript
var auth = MODULE('auth');

// ==========================================
// PROPERTIES
// ==========================================

auth.options.cookie = '__user'; // cookie name, default __user
auth.options.autoLogin = true; // default true
auth.options.expireSession = 10; // in minutes, default 10
auth.options.expireCookie = 10; // in days, defualt 10

auth.online; // get online users

// ==========================================
// METHODS
// ==========================================

/*
	Login a user
	@controller {Controller}
	@id {Number or String}
	@user {Object}
	@expire {Number} :: expire in minutes
	return {Module}
*/
auth.login(controller, id, user, expire);

/*
	Logoff a user
	@controller {Controller}
	@id {Number or String} :: Id user
	return {Module}
*/
auth.logoff(controller, id);

/*
	Change a user
	@id {Number or String}
	@newUser {Object}
	return {Users}
*/
auth.change(id, newUser);

/*
	Update a user
	@id {Number or String}
	@fn {Function} :: function(user) {}
	return {Users}
*/
auth.update(id, fn);

/*
	Update a user
	@id {Number or String}
	expire {Date}
	return {Users}
*/
auth.setExpire(id, expire);


// ==========================================
// EVENTS
// ==========================================
auth.on('login', function(id, user) {});
auth.on('logoff', function(id, user) {});
auth.on('change', function(id, user, old) {});
auth.on('online', function(online) {});
auth.on('expire', function(id, user) {});
```

### /controllers/default.js

```javascript
exports.install = function() {
	// ...
	// ...
	// ...
	F.route('/', view_authorize, ['authorize']);
	F.route('/xhr/login/', json_login, ['unauthorize']);
	F.route('/xhr/logoff/', json_logoff, ['authorize']);
};

function json_login() {

	var self = this;
	var auth = MODULE('auth');

    // read user information from database
    // this is an example
	var user = { id: '1', alias: 'Peter' };

    // create cookie
    // save to session
	// @controller {Controller}
	// @id {String}
	// @user {Object}
	auth.login(self, user.id, user);

	self.json({ success: true });
}

function json_logoff() {

	var self = this;
	var auth = MODULE('auth');
	var user = self.user;

    // remove cookie
    // remove user session
	// @controller {Controller}
	// @id {String}
	auth.logoff(self, user.id);

	self.json({ r: true });
}

function view_authorize() {
	var self = this;
	var user = self.user;

	// user.id
	// user.alias

	self.view('profile');
}

```

### /definitions/authorization.js

```javascript
F.on('module#auth', function(type, name) {
	var auth = MODULE('auth');
	auth.onAuthorize = function(id, callback, flags) {

        // - this function is cached
        // - here you have to read user information from a database
        // - insert the user object into the callback (this object will be saved to session/cache)
        callback({ id: '1', alias: 'Peter Sirka' });

        // if user not exist then
        // callback(null);
	};
});
```

__IMPORTANT__ in practice:

```javascript
F.on('module#auth', function(type, name) {
	var auth = MODULE('auth');
	// "id" from auth.login()
	auth.onAuthorize = function(id, callback, flags) {
		
		var filter = function(user) {
			return user.id === id;
		};

		F.database('users').one(filter, function(user) {

			if (user === null) {
				callback(null);
				return;
			}

			callback(user);
		});
	};
});
```

### How to use roles?

> Use a definition.

```javascript
F.on('module#auth', function(type, name) {
	var auth = MODULE('auth');
	auth.onAuthorize = function(id, callback, flags) {

        // - this function is cached
        // - here you must read user information from a database
        // - insert the user object into the callback (this object will be saved to session/cache)
        callback({ id: '1', alias: 'Peter Sirka', roles: ['admin'] });

        // if user not exist then
        // callback(null);
	};
});

// Documentation: http://docs.totaljs.com/Framework/#framework.on('controller')
F.on('controller', function(self, name) {

	var user = self.user;
	if (user === null)
		return;

	var length = user.roles.length;
	for (var i = 0; i < length; i++) {

		var role = '!' + user.roles[i];
		if (self.flags.indexOf(role) === -1) {
			
			// Cancels executing of the controller
			self.cancel();

			// Performs redirect
			self.redirect('/you-do-not-have-permission/')
			return;
		}

	}
});
```

> Some Controller:

```javascript
exports.install = function() {
	F.route('/admin/', view_admin, ['!admin', '!moderator']);
	F.route('/admin/manage/', view_admin, ['!admin']);
};

// ....
// ....
// ....

```