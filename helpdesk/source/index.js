// MIT License
// Copyright Peter Širka <petersirka@gmail.com>

var OPT;
var DDOS = {};

exports.version = 'v1.0.0';
exports.install = function(options) {

	// options.restrictions = ['127.0.0.1'];
	// options.url = '/$helpdesk/';
	// options.customer = 'EMAIL ADDRESS';
	// options.support = 'EMAIL ADDRESS';
	// options.auth = ['petersirka:123456'];

	OPT = options;

	if (!OPT)
		OPT = {};

	OPT.url = U.path(OPT.url || '/$helpdesk/');

	// Routes

	if (OPT.auth === true) {
		F.route(OPT.url, view_index, ['authorize']);
		F.route(OPT.url, json_tasks, ['xhr', 'authorize']);
		F.route(OPT.url, json_tasks_add, ['post', 'authorize']);
	} else {
		F.route(OPT.url, view_index);
		F.route(OPT.url, json_tasks, ['xhr']);
		F.route(OPT.url, json_tasks_add, ['post']);
	}

	// Mapping
	F.map(OPT.url + 'default.css', '@helpdesk/default.css');
	F.map(OPT.url + 'default.js', '@helpdesk/default.js');

	F.on('service', service);
};

exports.uninstall = function() {
	OPT = null;
	DDOS = null;
	F.removeListener('service', service);
};

function service(counter) {
	if (counter % 15 === 0)
		DDOS = {};
}

function view_index() {
	if (isRestricted(this))
		return;
	this.repository.url = OPT.url;
	this.view('@helpdesk/index');
}

function json_tasks() {
	if (isRestricted(this))
		return;
	NOSQL('helpdesk').find().sort('datecreated', true).callback(this.callback());
}

function json_tasks_add() {

	if (isRestricted(this))
		return;

	var self = this;
	var model = self.body;
	var db = NOSQL('helpdesk');
	var customer = self.query.customer === '1';

	if (model.type === 'insert') {
		model.type = undefined;
		var obj = {};
		obj.id = UID();
		obj.datecreated = F.datetime;
		obj.body = model.body;
		obj.comments = [];
		obj.solved = false;
		obj.ip = self.ip;
		obj.customer = customer;

		db.insert(obj).callback(function() {
			self.json(SUCCESS(true));
			customer && notify('insert', obj.id, customer);
		});

	} else if (model.type === 'comment') {

		db.modify({ comments: function(val) {
			val.push({ datecreated: F.datetime, body: model.body, ip: self.ip, customer: customer });
			return val;
		}}).where('id', model.id).callback(function() {
			self.json(SUCCESS(true));
			notify('comment', model.id, customer);
		});

	} else if (model.type === 'toggle')
		db.modify({ solved: n => !n, datesolved: F.datetime, ip: self.ip }).where('id', model.id).callback(() => self.json(SUCCESS(true)));
	else if (model.type === 'removecomment') {

		db.modify({ comments: function(val) {
			val.splice(self.body.index, 1);
			return val;
		}}).where('id', model.id).callback(() => self.json(SUCCESS(true)));

	} else if (model.type === 'remove')
		db.remove(F.path.databases('helpdesk_removed.nosql')).where('id', model.id).callback(() => self.json(SUCCESS(true)));
	else
		self.throw400();
}

function isRestricted(controller) {

	if (OPT.auth === true)
		return false;

	if (OPT.auth && OPT.auth.length) {
		var user = controller.baa();
		if (user.empty || OPT.auth.indexOf(user.user + ':' + user.password) === -1) {

			if (DDOS[controller.ip])
				DDOS[controller.ip]++;
			else
				DDOS[controller.ip] = 1;

			if (DDOS[controller.ip] > 15)
				controller.throw401();
			else
				controller.baa('Secured area');

			return true;
		}
	}

	if (!OPT.restrictions || !OPT.restrictions.length)
		return false;

	for (var i = 0, length = OPT.restrictions.length; i < length; i++) {
		if (controller.ip.indexOf(OPT.restrictions[i]) === -1) {
			controller.throw401();
			return true;
		}
	}

	return false;
}

function notify(type, id, customer) {

	if (customer) {
		if (!OPT.support)
			return;
	} else if (!OPT.customer)
		return;

	NOSQL('helpdesk').find().where('id', id).first().callback(function(err, doc) {
		if (err || !doc)
			return;
		doc.type = type;
		F.mail(customer ? OPT.support : OPT.customer, F.config.name + ': HelpDesk notification', '@helpdesk/mail', doc);
	});
}