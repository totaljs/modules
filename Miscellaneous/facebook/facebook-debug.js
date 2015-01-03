// MIT License
// Copyright Peter Širka <petersirka@gmail.com>
// Version 1.01

const URL = 'https://graph.facebook.com/oauth/authorize?type=web_server&client_id={0}&redirect_uri={1}&scope=email,user_birthday,user_hometown';
var stats_login = 0;

function redirect(key, url) {
	return URL.format(key, url);
}

function profile(key, secret, code, url, callback) {

	var url = 'https://graph.facebook.com/oauth/access_token?client_id={0}&redirect_uri={1}&client_secret={2}&code={3}'.format(key, url, secret, code);

	utils.request(url, 'GET', '', function(err, data, status, headers) {

		if (err) {
			callback(err, null);
			return;
		}

		if (data.indexOf('"error"') !== -1) {
			callback(JSON.parse(data), null);
			return;
		}

		stats_login++;
		utils.request('https://graph.facebook.com/me?' + data, 'GET', '', function(err, data, status) {

			if (err) {
				callback(err, null);
				return;
			}

			var user = JSON.parse(data);
			user.picture = user.link.replace('www.', 'graph.') + '/picture';
			callback(null, user);
		});

	});
}

exports.redirect = redirect;
exports.profile = profile;

exports.usage = function() {
	return { count: stats_login };
};