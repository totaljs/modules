// Install module
INSTALL('module', 'https://modules.totaljs.com/latest/auth.js');

framework.on('module#auth', function(type, name) {
    MODULE('auth').onAuthorize = function(id, callback) {

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