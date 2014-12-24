// MIT License
// Copyright Peter Širka <petersirka@gmail.com>
// Version 1.01

var crypto = require('crypto');
var qs = require('querystring');

function Twitter(apiKey, apiSecret, accessToken, accessSecret) {
    this.apiKey = apiKey;
    this.apiSecret = apiSecret;
    this.accessToken = accessToken;
    this.accessSecret = accessSecret;
}

/**
 * Create a signature string
 * @param  {Object} obj All parameters
 * @return {String}     String to signature
 */
Twitter.prototype.create = function(obj) {
    var keys = Object.keys(obj);
    var length = keys.length;
    var builder = [];

    keys.sort();

    for (var i = 0; i < length; i++) {
        var key = keys[i];
        builder.push(key + '="' + escape(obj[key]) + '"');
    }

    return builder.join(', ');
};

/**
 * Create signature
 * @param  {String} method HTTP Method
 * @param  {String} url    Url
 * @param  {Object} params Parameters
 * @return {String}        Signature
 */
Twitter.prototype.signature = function(method, url, params) {

    var self = this;
    var keys = Object.keys(params);
    var builder = [];
    var key = encodeURIComponent(self.apiSecret) + '&' + encodeURIComponent(self.accessSecret);

    keys.sort();

    var length = keys.length;
    for (var i = 0; i < length; i++)
        builder.push(keys[i] + '%3D' + encodeURIComponent(params[keys[i]]));

    var signature = method + '&' + encodeURIComponent(url) + '&' + builder.join('%26');
    return crypto.createHmac('sha1', key).update(signature).digest('base64');
};

/**
 * Create a request to Twitter
 * @param  {String}   method   HTTP method
 * @param  {String}   url      Url address
 * @param  {Object}   params   Custom parameters
 * @param  {Function} callback Callback ()
 * @param  {String}   redirect Redirect URL address (currently not work)
 */
Twitter.prototype.request = function(method, url, params, callback, redirect) {

    var headers = {};
    var oauth = {};
    var self = this;
    var data = '';

    oauth['oauth_consumer_key'] = self.apiKey;

    if (redirect)
        oauth['oauth_callback'] = redirect;

    oauth['oauth_token'] = self.accessToken;
    oauth['oauth_signature_method'] = 'HMAC-SHA1';
    oauth['oauth_timestamp'] = Math.floor(new Date().getTime() / 1000).toString();
    oauth['oauth_nonce'] = Utils.GUID(32);
    oauth['oauth_version'] = '1.0';

    if (!params)
        params = {};
    else
        data = qs.stringify(params);

    var keys = Object.keys(params);
    var length = keys.length;

    for (var i = 0; i < length; i++)
        params[keys[i]] = encodeURIComponent(params[keys[i]]);

    params['oauth_consumer_key'] = oauth['oauth_consumer_key'];
    params['oauth_nonce'] = oauth['oauth_nonce'];
    params['oauth_signature_method'] = oauth['oauth_signature_method'];
    params['oauth_timestamp'] = oauth['oauth_timestamp'];
    params['oauth_version'] = oauth['oauth_version'];
    params['oauth_token'] = oauth['oauth_token'];

    oauth['oauth_signature'] = self.signature(method, url, params);
    headers['Authorization'] = 'OAuth ' + self.create(oauth);

    Utils.request(url, method, data, function(err, data) {
        if (callback)
            callback(err, JSON.parse(data));
    }, headers);
};

module.exports.Twitter = Twitter;
module.exports.create = function(apiKey, apiSecret, accessToken, accessSecret) {
    return new Twitter(apiKey, apiSecret, accessToken, accessSecret);
}