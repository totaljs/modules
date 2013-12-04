var events = require('events');
var COOKIE = '__partialonline';

function Online() {
	this.online = 0;
	this.arr = [0, 0, 0];
	setInterval(this.clean.bind(this), 3000);
}

Online.prototype = {
	get online() {
		var arr = this.arr;
		return arr[0] + arr[1] + arr[2];
	}
};

Online.prototype.__proto__ = new events.EventEmitter();

Online.prototype.clean = function() {

	var self = this;
	var arr = self.arr;

	var isRefresh = arr[2] !== 0 || arr[1] !== 0 || arr[0] !== 0;
	var tmp2 = arr[2];
	var tmp1 = arr[1];

	arr[2] = 0;
	arr[1] = tmp2;
	arr[0] = tmp1;

	if (isRefresh)
		self.emit('refresh');

	return self;
};

Online.prototype.add = function(req, res) {

	var self = this;
	var arr = self.arr;
	var exists = req.cookie(COOKIE) === '1';

	arr[2]++;

	if (exists && arr[1] > 0)
		arr[1]--;

	if (!exists)
		self.emit('online', req);

	res.cookie(COOKIE, '1', new Date().add('m', 1));
	return self;
};

var online = new Online();
