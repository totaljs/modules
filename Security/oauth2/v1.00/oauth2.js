// MIT License
// Copyright Peter Širka <petersirka@gmail.com>
// Version 1.00

var Qs = require('querystring');

exports.id = 'oauth2';
exports.version = '1.00';

var stats = { facebook: 0, google: 0,linkedin: 0, yahoo: 0, dropbox: 0, github: 0 };

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
            user.link = user.link.replace('app_scoped_user_id/', '');
            user.picture = user.link.replace('www.', 'graph.') + 'picture';
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

function github_redirect(key, url) {
    return 'https://github.com/login/oauth/authorize?scope=user%3Aemail&redirect_uri={0}&response_type=code&client_id={1}'.format(encodeURIComponent(url), key);
}

function github_profile(key, secret, code, url, callback) {

    U.request('https://github.com/login/oauth/access_token', ['post'], { code: code, client_id: key, client_secret: secret, redirect_uri: url, grant_type: 'authorization_code' }, function(err, data, status, headers) {

        if (err)
            return callback(err, null);

        if (data.indexOf('"error"') !== -1)
            return callback(Qs.parse(data), null);

        data = Qs.parse(data);
        U.request('https://api.github.com/user', ['get'], '', function(err, data, status) {
            if (err)
                return callback(err, null);
            var user = JSON.parse(data);
            stats.github++;
            callback(null, user);
        }, null, { 'Authorization': 'Bearer ' + data.access_token, 'User-Agent': 'total.js' });
    });
}

function dropbox_redirect(key, url) {
    return 'https://www.dropbox.com/1/oauth2/authorize?redirect_uri={0}&response_type=code&client_id={1}'.format(encodeURIComponent(url), key);
}

function dropbox_profile(key, secret, code, url, callback) {
    U.request('https://api.dropbox.com/1/oauth2/token', ['post'], { code: code, client_id: key, client_secret: secret, redirect_uri: url, grant_type: 'authorization_code' }, function(err, data, status, headers) {

        if (err)
            return callback(err, null);

        if (data.indexOf('"error"') !== -1)
            return callback(JSON.parse(data), null);

        data = JSON.parse(data);
        U.request('https://api.dropbox.com/1/account/info', ['get'], '', function(err, data, status) {
            if (err)
                return callback(err, null);
            var user = JSON.parse(data);
            stats.dropbox++;
            callback(null, user);
        }, null, { 'Authorization': 'Bearer ' + data.access_token });
    });
}

exports.redirect = function(type, key, url, controller) {
    switch (type) {
        case 'facebook':
            controller.redirect(facebook_redirect(key, url));
            break;
        case 'google':
            controller.redirect(google_redirect(key, url));
            break;
        case 'yahoo':
            controller.redirect(yahoo_redirect(key, url));
            break;
        case 'linkedin':
            controller.redirect(linkedin_redirect(key, url));
            break;
        case 'github':
            controller.redirect(github_redirect(key, url));
            break;
        case 'dropbox':
            controller.redirect(dropbox_redirect(key, url));
            break;
    }
};

exports.callback = function(type, key, secret, url, controller, callback) {
    switch (type) {
        case 'facebook':
            facebook_profile(key, secret, controller.query.code, url, callback);
            break;
        case 'google':
            google_profile(key, secret, controller.query.code, url, callback);
            break;
        case 'yahoo':
            yahoo_profile(key, secret, controller.query.code, url, callback);
            break;
        case 'linkedin':
            linkedin_profile(key, secret, controller.query.code, url, callback);
            break;
        case 'github':
            github_profile(key, secret, controller.query.code, url, callback);
            break;
        case 'dropbox':
            dropbox_profile(key, secret, controller.query.code, url, callback);
            break;
    }
};

exports.facebook_redirect = facebook_redirect;
exports.facebook_profile = facebook_profile;
exports.google_redirect = google_redirect;
exports.google_profile = google_profile;
exports.linkedin_redirect = linkedin_redirect;
exports.linkedin_profile = linkedin_profile;
exports.yahoo_redirect = yahoo_redirect;
exports.yahoo_profile = yahoo_profile;
exports.github_redirect = github_redirect;
exports.github_profile = github_profile;
exports.dropbox_redirect = dropbox_redirect;
exports.dropbox_profile = dropbox_profile;