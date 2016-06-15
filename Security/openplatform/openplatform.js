const COOKIE = '__op';
const SESSION = {};
const HEADERS = {};
const FLAGS_READ = ['get', 'dnscache'];
const FLAGS_POST = ['post', 'json', 'dnscache'];
const EMPTYARRAY = [];
const EMPTYOBJECT = {};
const OPENPLATFORM = {};

global.OPENPLATFORM = OPENPLATFORM;

F.route('/openplatform/', function() {
	var self = this;
	OPENPLATFORM.authorize(self.req, self.res, function(err, response) {

		if (err) {
			F.logger('openplatform-errors', err);
			self.status = 400;
			return self.content(OPENPLATFORM.kill(), 'text/html');
		}

		self.plain('success');
	});
});

HEADERS['x-openplatform-id'] = F.config['openplatform.url'];

if (F.config['openplatform.secret'])
	HEADERS['x-openplatform-secret'] = F.config['openplatform.secret'];

OPENPLATFORM.kill = function() {
	return 'OpenPlatform: <b>401: Unauthorized</b><script>var data={};data.openplatform=true;data.type=\'kill\';data.body=null;data.sender=true;setTimeout(function(){top.postMessage(JSON.stringify(data),\'*\');},1000);</script>';
};

OPENPLATFORM.clientside = function() {
	return '<script>var OPENPLATFORM={};OPENPLATFORM.version="1.0.0",OPENPLATFORM.callbacks={},OPENPLATFORM.events={},OPENPLATFORM.is=top!==window,OPENPLATFORM.loading=function(n){return OPENPLATFORM.send("loading",n)},OPENPLATFORM.maximize=function(n){return OPENPLATFORM.send("maximize",n)},OPENPLATFORM.open=function(n){return OPENPLATFORM.send("open",n)},OPENPLATFORM.minimize=function(){return OPENPLATFORM.send("minimize")},OPENPLATFORM.close=function(){return OPENPLATFORM.send("kill")},OPENPLATFORM.notify=function(n,e,O){return"string"==typeof n&&(O=e,e=n,n=0),OPENPLATFORM.send("notify",{type:n,body:e,url:O||"",datecreated:new Date})},OPENPLATFORM.getProfile=function(n){return OPENPLATFORM.send("profile",n)},OPENPLATFORM.getApplications=function(n){return OPENPLATFORM.send("applications",n)},OPENPLATFORM.getUsers=function(n){return OPENPLATFORM.send("users",n)},OPENPLATFORM.getInfo=function(n){return OPENPLATFORM.send("info",n)},OPENPLATFORM.onMinimize=function(n){return OPENPLATFORM.on("minimize",n)},OPENPLATFORM.onMaximize=function(n){return OPENPLATFORM.on("maximize",n)},OPENPLATFORM.onClose=function(n){return OPENPLATFORM.on("kill",n)},OPENPLATFORM.send=function(n,e,O){"function"==typeof e&&(O=e,e=null);var P={};return P.openplatform=!0,P.type=n,P.body=e||null,P.sender=!0,top?(O&&(P.callback=(1e6*Math.random()).toString(32).replace(/\./g,""),OPENPLATFORM.callbacks[P.callback]=O),top.postMessage(JSON.stringify(P),"*"),OPENPLATFORM):void(O&&O(new Error("The application is not runned in the openplatform scope.")))},OPENPLATFORM.on=function(n,e){return OPENPLATFORM.events[n]||(OPENPLATFORM.events[n]=[]),OPENPLATFORM.events[n].push(e),OPENPLATFORM},window.addEventListener("message",function(n){try{var e=JSON.parse(n.data);if(!e.openplatform)return;if(e.callback){var O=OPENPLATFORM.callbacks[e.callback];return void(O&&(e.sender&&(e.error=new Error("The application is not runned in the openplatform scope.")),O(e.error,e.body||{}),delete OPENPLATFORM.callbacks[e.callback]))}if(e.sender)return;var P=OPENPLATFORM.events[e.type];if(!P)return;P.forEach(function(n){n(e.body||{})})}catch(n){}},!1);</script>'
};

OPENPLATFORM.session = function(cookie) {
	// checks whether is the cookie a request object
	if (cookie.cookie)
		cookie = cookie.cookie(COOKIE);
	return SESSION[cookie];
};

OPENPLATFORM.authorize = function(req, res, callback) {

	var cookie = req.cookie(COOKIE);
	var openplatform = req.query.openplatform;

	if (!cookie && !openplatform)
		return callback(new Error('Missing the "cookie" and "openplatform" query parameter.'));

	if (!cookie)
		cookie = U.GUID(30);

	var user;

	if (!openplatform) {
		user = SESSION[cookie];
		if (user)
			return callback(user);
	}

	if (!openplatform)
		return callback(new Error('Missing the "openplatform" query parameter.'), null);

	U.request(openplatform, FLAGS_READ, function(err, response, code) {

		if (err || code !== 200)
			return callback(err || response.parseJSON());

		user = response.parseJSON();
		if (!user)
			return callback(new Error(response));

		SESSION[cookie] = user;
		user.expire = F.datetime.getTime() + 900000;
		res.cookie(COOKIE, cookie, '1 days', { domain: req.uri.hostname });
		callback(null, user);

	}, null, HEADERS);
};

OPENPLATFORM.getApplications = function(openplatform, iduser, callback) {
	HEADERS['x-openplatform-user'] = iduser;
	U.request(openplatform + '/api/applications/', FLAGS_READ, function(err, response, code) {
		if (err)
			return callback(err);
		var data = response.parseJSON();
		if (code !== 200)
			return callback(data, EMPTYARRAY);
		callback(null, data);
	}, null, HEADERS);
	return OPENPLATFORM;
};

OPENPLATFORM.getUsers = function(openplatform, iduser, callback) {
	HEADERS['x-openplatform-user'] = iduser;
	U.request(openplatform + '/api/users/', FLAGS_READ, function(err, response, code) {
		if (err)
			return callback(err);
		var data = response.parseJSON();
		if (code !== 200)
			return callback(data, EMPTYARRAY);
		callback(null, data);
	}, null, HEADERS);
	return OPENPLATFORM;
};

OPENPLATFORM.getProfile = function(openplatform, iduser, callback) {
	HEADERS['x-openplatform-user'] = iduser;
	U.request(openplatform + '/api/info/', FLAGS_READ, function(err, response, code) {
		if (err)
			return callback(err);
		var data = response.parseJSON();
		if (code !== 200)
			return callback(data, EMPTYOBJECT);
		callback(null, data);
	}, null, HEADERS);
	return OPENPLATFORM;
};

OPENPLATFORM.getInfo = function(openplatform, callback) {
	U.request(openplatform + '/api/openplatform/', FLAGS_READ, function(err, response, code) {
		if (err)
			return callback(err);
		var data = response.parseJSON();
		if (code !== 200)
			return callback(data, EMPTYOBJECT);
		callback(null, data);
	}, null, HEADERS);
	return OPENPLATFORM;
};

OPENPLATFORM.notify = function(openplatform, iduser, body, callback, url, type) {
	HEADERS['x-openplatform-user'] = iduser;

	var model = {};
	model.body = body;
	model.url = url;
	model.type = type;

	U.request(openplatform + '/api/notifications/', FLAGS_POST, model, function(err, response, code) {
		if (err)
			return callback(err);
		var data = response.parseJSON();
		if (code !== 200)
			return callback(data, EMPTYOBJECT);
		callback(null, data);
	}, null, HEADERS);
	return OPENPLATFORM;
};

OPENPLATFORM.serviceworker = function(openplatform, iduser, event, data, callback) {
	HEADERS['x-openplatform-user'] = iduser;

	var model = {};
	model.event = event;
	model.data = data;

	U.request(openplatform + '/api/serviceworker/', FLAGS_POST, model, function(err, response, code) {
		if (err)
			return callback(err);
		var data = response.parseJSON();
		if (code !== 200)
			return callback(data, EMPTYOBJECT);
		callback(null, data);
	}, null, HEADERS);
	return OPENPLATFORM;
};

F.on('service', function(interval) {

	// Each 3 minutes
	if (interval % 3 !== 0)
		return;

	var ts = F.datetime.getTime();

	Object.keys(SESSION).forEach(function(key) {
		if (SESSION[key].expire < ts)
			delete SESSION[key];
	});
});

F.middleware('openplatform', function(req, res, next, options, controller) {
	OPENPLATFORM.authorize(req, res, function(user) {

		if (user) {
			user.session = F.datetime.getTime() + 900000;
			req.user = user;
			return next();
		}

		res.content(401, OPENPLATFORM.kill(), 'text/html');
		next = null;
		return false;
	});
});

F.helpers.openplatform = function() {
	return OPENPLATFORM.clientside();
};