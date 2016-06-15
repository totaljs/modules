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
	return "<script>var OPENPLATFORM={};OPENPLATFORM.version='1.0.0';OPENPLATFORM.callbacks={};OPENPLATFORM.events={};OPENPLATFORM.is=top!==window;OPENPLATFORM.loading=function(visible){return OPENPLATFORM.send('loading',visible);};OPENPLATFORM.maximize=function(url){return OPENPLATFORM.send('maximize',url);};OPENPLATFORM.open=function(id){return OPENPLATFORM.send('open',id);};OPENPLATFORM.minimize=function(){return OPENPLATFORM.send('minimize');};OPENPLATFORM.close=function(){return OPENPLATFORM.send('kill');};OPENPLATFORM.notify=function(type,body,url){if(typeof(type)==='string'){url=body;body=type;type=0;} return OPENPLATFORM.send('notify',{type:type,body:body,url:url||'',datecreated:new Date()});};OPENPLATFORM.getProfile=function(callback){return OPENPLATFORM.send('profile',callback);};OPENPLATFORM.getApplications=function(callback){return OPENPLATFORM.send('applications',callback);};OPENPLATFORM.getUsers=function(callback){return OPENPLATFORM.send('users',callback);};OPENPLATFORM.getInfo=function(callback){return OPENPLATFORM.send('info',callback);};OPENPLATFORM.onMinimize=function(callback){return OPENPLATFORM.on('minimize',callback);};OPENPLATFORM.onMaximize=function(callback){return OPENPLATFORM.on('maximize',callback);};OPENPLATFORM.onClose=function(callback){return OPENPLATFORM.on('kill',callback);};OPENPLATFORM.send=function(type,body,callback){if(typeof(body)==='function'){callback=body;body=null;} var data={};data.openplatform=true;data.type=type;data.body=body||null;data.sender=true;if(!top){if(callback) callback(new Error('The application is not runned in the openplatform scope.'));return;} if(callback){data.callback=(Math.random()*1000000).toString(32).replace(/\\./g,'');OPENPLATFORM.callbacks[data.callback]=callback;} top.postMessage(JSON.stringify(data),'*');return OPENPLATFORM;};OPENPLATFORM.on=function(name,callback){if(!OPENPLATFORM.events[name]) OPENPLATFORM.events[name]=[];OPENPLATFORM.events[name].push(callback);return OPENPLATFORM;};window.addEventListener('message',function(e){try{var data=JSON.parse(e.data);if(!data.openplatform) return;if(data.callback){var callback=OPENPLATFORM.callbacks[data.callback];if(callback){if(data.sender) data.error=new Error('The application is not runned in the openplatform scope.');callback(data.error,data.body||{});delete OPENPLATFORM.callbacks[data.callback];} return;} if(data.sender) return;var events=OPENPLATFORM.events[data.type];if(!events) return;events.forEach(function(e){e(data.body||{});});}catch(e){}},false);</script>";
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