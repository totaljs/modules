framework.once('load', function() {
    
    var self = this;
    var auth = self.module('authorization');

    auth.onAuthorization = function(id, callback) {

        // this is cached
        // read user information from database
        // into callback insert the user object (this object is saved to session/cache)
        // this is an example
        callback({ id: '1', alias: 'Peter Sirka' });
        
        // if user not exist then
        // callback(null);
    };

});