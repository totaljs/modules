// Install module
INSTALL('module', 'https://modules.totaljs.com/auth/v1.00/auth.js');

framework.on('install', function(type, name) {

    if (type !== 'module' && name !== 'auth')
        return;


    var self = this;
    var auth = MODULE('auth');

    auth.onAuthorization = function(id, callback) {

        // this is cached
        // read user information from database
        // into callback insert the user object (this object is saved to session/cache)
        // this is an example

        // Why "1"? Look into auth.login(controller, "ID", user);
        if (id === '1')
            return callback({ id: '1', alias: 'Peter Sirka' });

        callback(null);

        // if user not exist then
        // callback(null);
    };

});