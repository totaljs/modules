// MIT License
// Copyright Peter Širka <petersirka@gmail.com>
// Version 1.00

exports.id = 'social';
exports.version = '1.00';

var stats = { facebook: 0, google: 0,linkedin: 0, yahoo: 0 };

exports.usage = function() {
    return stats;
};

function facebook_redirect(key, url) {
    return 'https://graph.facebook.com/oauth/authorize?type=web_server&client_id={0}&redirect_uri={1}&scope=email,user_birthday,user_hometown'.format(key, encodeURIComponent(url));
}

function facebook_profile(key, secret, code, url, callback) {
    U.request('https://graph.facebook.com/oauth/access_token?client_id={0}&redirect_uri={1}&client_secret={2}&code={3}'.format(key, url, secret, code), ['get'], '', function(err, data, status, headers) {

        if (err)
            return callback(err, null);

        if (data.indexOf('"error"') !== -1)
            return callback(JSON.parse(data), null);

        U.request('https://graph.facebook.com/me?' + data, ['get'], '', function(err, data, status) {

            if (err)
                return callback(err, null);

            var user = JSON.parse(data);
            user.picture = user.link.replace('www.', 'graph.') + '/picture';
            stats.facebook++;
            callback(null, user);
        });
    });
}

function google_redirect(key, url) {
    return 'https://accounts.google.com/o/oauth2/auth?scope=email%20profile&redirect_uri={0}&response_type=code&client_id={1}'.format(encodeURIComponent(url), key);
}

function google_profile(key, secret, code, url, callback) {
    U.request('https://www.googleapis.com/oauth2/v3/token', ['post'], { code: code, client_id: key, client_secret: secret, redirect_uri: url, grant_type: 'authorization_code' }, function(err, data, status, headers) {

        if (err)
            return callback(err, null);

        if (data.indexOf('"error"') !== -1)
            return callback(JSON.parse(data), null);

        data = JSON.parse(data);
        U.request('https://www.googleapis.com/plus/v1/people/me', ['get'], '', function(err, data, status) {
            if (err)
                return callback(err, null);
            var user = JSON.parse(data);
            stats.google++;
            callback(null, user);
        }, null, { 'Authorization': 'Bearer ' + data.access_token });
    });
}

function linkedin_redirect(key, url) {
    return 'https://www.linkedin.com/uas/oauth2/authorization?response_type=code&client_id={0}&redirect_uri={1}&state=987654321'.format(key, encodeURIComponent(url));
}

function linkedin_profile(key, secret, code, url, callback) {
    U.request('https://www.linkedin.com/uas/oauth2/accessToken', ['post'], { code: code, client_id: key, client_secret: secret, redirect_uri: url, grant_type: 'authorization_code' }, function(err, data, status, headers) {

        if (err)
            return callback(err, null);

        if (data.indexOf('"error"') !== -1)
            return callback(JSON.parse(data), null);

        data = JSON.parse(data);
        U.request('https://api.linkedin.com/v1/people/~:(id,first-name,last-name,headline,member-url-resources,picture-url,location,public-profile-url,email-address)?format=json', ['get'], '', function(err, data, status) {
            if (err)
                return callback(err, null);
            var user = JSON.parse(data);
            stats.linkedin++;
            callback(null, user);
        }, null, { 'Authorization': 'Bearer ' + data.access_token });
    });
}

function yahoo_redirect(key, url) {
    return 'https://api.login.yahoo.com/oauth2/request_auth?client_id={0}&redirect_uri={1}&response_type=code&language=en-us'.format(key, encodeURIComponent(url));
}

function yahoo_profile(key, secret, code, url, callback) {
    U.request('https://api.login.yahoo.com/oauth2/get_token', ['post'], { code: code, client_id: key, client_secret: secret, redirect_uri: url, grant_type: 'authorization_code' }, function(err, data, status, headers) {

        if (err)
            return callback(err, null);

        if (data.indexOf('"error"') !== -1)
            return callback(JSON.parse(data), null);

        data = JSON.parse(data);
        U.request('https://social.yahooapis.com/v1/user/' + data.xoauth_yahoo_guid + '/profile?format=json', ['get'], '', function(err, data, status) {
            if (err)
                return callback(err, null);
            var user = JSON.parse(data);
            stats.yahoo++;
            callback(null, user);
        }, null, { 'Authorization': 'Bearer ' + data.access_token });
    });
}

exports.facebook_redirect = facebook_redirect;
exports.facebook_profile = facebook_profile;
exports.google_redirect = google_redirect;
exports.google_profile = google_profile;
exports.linkedin_redirect = linkedin_redirect;
exports.linkedin_profile = linkedin_profile;
exports.yahoo_redirect = yahoo_redirect;
exports.yahoo_profile = yahoo_profile;
