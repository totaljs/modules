var version = 'v1.0.0';

exports.install = function(options) {
	var url = '/$monitor/';
	if (options && options.url)
		url = options.url;
	F.route(url, json_monitor);
};

function json_monitor() {

	var self = this;
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
	stats.errors = F.errors.length;
	stats.problems = F.problems.length;

	var async = [];

	async.push(function(next) {
		var m = MODULE('webcounter');
		if (!m)
			return next();
		stats.webcounter = {};
		stats.webcounter.today = m.today();
		stats.webcounter.online = m.online();
		m.instance.monthly(function(response) {
			stats.webcounter.monthly = response;
			next();
		});
	});

	async.push(function(next) {
		var m = MODULE('reqstats');
		if (!m || !m.stats)
			return next();
		m.stats(function(err, response) {
			stats.reqstats = response;
			next();
		});
	});

	async.async(function() {
		self.json(stats);
	});
}