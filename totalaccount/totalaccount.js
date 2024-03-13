const ACCOUNT = 'https://account.totaljs.com';
const COOKIE = 'ta';

var SESSIONS = {};

exports.install = function() {
	ROUTE('GET /auth/', auth);
};

function auth($) {
	var token = $.query.token;
	if (token) {
		$.cookie(COOKIE, token || '', '1 month');
		$.redirect('/');
	} else
		$.redirect(ACCOUNT + '/?app=' + encodeURIComponent($.hostname('/auth/')));
}

AUTH(async function($) {

	var token = $.cookie(COOKIE);
	if (token) {

		var response = SESSIONS[token];
		if (response) {
			$.success(response);
			return;
		}

		if (BLOCKED($, 10))
			return;

		response = SESSIONS[token] = await RESTBuilder.API(ACCOUNT + '/api/', 'account').header('x-token', token).promise($);
		response.expire = NOW.add('2 minutes');
		$.success(response);
		BLOCKED($, -1);

	} else
		$.invalid();

});

ON('service', function() {
	for (let key in SESSIONS) {
		let session = SESSIONS[key];
		if (session.expire < NOW)
			delete SESSIONS[key];
	}
});