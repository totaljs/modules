# Authorization module

- partial.js version +v1.2.4-4
- copy **authorization.js** to __/your-partialjs-website/modules/__
- [EXAMPLE](https://github.com/petersirka/partial.js-modules/tree/master/authorization/example)

## Functions and Events

```javascript

var auth = framework.module('authorization');

/*
	Login an user
	@controller {Controller}
	@id {Number}
	@user {Object}
	@expire {Number} :: expire in minutes
	return {Module}
*/
auth.login(controller, id, user, expire);

/*
	Logoff an user
	@controller {Controller}
	@id {Number or String} :: Id user
	return {Module}
*/
auth.logoff(controller, id);

/*
	Change an user
	@id {Number}
	@newUser {Object}
	return {Users}
*/
auth.change(id, newUser);

// ==========================================
// EVENTS
// ==========================================

auth.on('login', function(id, user) {});
auth.on('logoff', function(id, user) {});
auth.on('change', function(id, user, old) {});
auth.on('online', function(online) {});
auth.on('expire', function(id, user) {});
```


## Example

### /controllers/default.js

```javascript

exports.install = function(framework) {
	// ...
	// ...
	// ...
	framework.route('/xhr/login/', json_login, ['unlogged']);
	framework.route('/xhr/logoff/', json_logoff, ['logged']);
	framework.route('/', view_logged, ['logged']);
};

function json_login() {

	var self = this;
	var auth = self.module('authorization');

    // read user information from database
    // this is an example
	var user = { id: '1', alias: 'Peter' };

    // create cookie
    // save to session
	// @controller {Controller}
	// @id {String}
	// @user {Object}
	auth.login(self, user.id, user);

	self.json({ r: true });
}

function json_logoff() {

	var self = this;
	var auth = self.module('authorization');
	var user = self.user;

    // remove cookie
    // remove user session
	// @controller {Controller}
	// @id {String}
	auth.logoff(self, user.id);

	self.json({ r: true });
}

function view_logged() {
	var self = this;
	var user = self.user;

	// user.id
	// user.alias

	self.view('profile');
}

```

### /modules/#.js

```javascript

framework.on('load', function() {

	var auth = self.module('authorization');

	auth.onAuthorization = function(id, callback) {

        // - this is cached
        // - read user information from database
        // - into callback insert the user object (this object is saved to session/cache)
        // - this is an example
        callback({ id: '1', alias: 'Peter Sirka' });

        // if user not exist then
        // callback(null);
	};

});

```