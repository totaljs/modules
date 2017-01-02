var version = 'v1.3.0';
var token = '';

exports.install = function(options) {
	var url = '/$monitor/';
	options && options.url && (url = options.url);
	options && options.token && (token = options.token);
	
	F.route(url, json_monitor);
};

function json_monitor() {
	var self = this;
	
	if(token && token !== self.query.token) return self.throw404();

	var stats = {};
	var memory = process.memoryUsage();

	stats.name = F.config.name;
	stats.version = F.config.version;
	stats.memoryTotal = (memory.heapTotal / 1024 / 1024).floor(2); // kB
	stats.memoryUsage = (memory.heapUsed / 1024 / 1024).floor(2); // kB
	stats.versionNode = process.version;
	stats.platform = process.platform;
	stats.ip = F.ip;
	stats.port = F.port;
	stats.pid = process.pid;
	stats.versionTotal = 'v' + F.version_header;
	stats.versionMonitor = version;
	stats.uptime = Math.floor(process.uptime() / 60); // minutes
	stats.mode = self.config.debug ? 'debug' : 'release';
	stats.cwd = process.cwd();
	stats.request = F.stats.request;
	stats.response = F.stats.response;
	stats.errors = F.errors;
	stats.problems = F.problems;

	if (F.stats.other.obsolete)
		stats.obsolete = F.stats.other.obsolete;

	var async = [];

	async.push(function(next) {
		var m = MODULE('webcounter');
		if (!m)
			return next();

		stats.versionWebcounter = m.version;
		stats.webcounter = {};
		stats.webcounter.today = m.today();
		stats.webcounter.online = m.online();
		stats.webcounter.monthly = F.cache.get('monitor.webcounter');

		if (stats.webcounter.monthly)
			return next();

		m.instance.monthly(function(response) {
			F.cache.set('monitor.webcounter', response, '5 minutes');
			stats.webcounter.monthly = response;
			next();
		});
	});

	async.push(function(next) {
		var m = MODULE('reqstats');
		if (!m || !m.stats)
			return next();
		stats.versionReqstats = m.version;
		m.stats(function(err, response) {
			stats.reqstats = response;
			next();
		});
	});

	async.async(() => self.json(stats));
}
