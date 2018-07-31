var url = location.pathname + '?customer=1';

$(document).ready(function() {
	SCHEDULE('repeater', 'manually', '5 minutes', tasks_refresh);
	CACHE('helpdesk.customer') && set_superadmin();
	tasks_refresh();
});

function tasks_refresh() {
	AJAX('GET ' + url, function(response) {
		response.sort(function(a, b) {
			if (a.solved && !b.solved)
				return 1;
			if (!a.solved && b.solved)
				return -1;
			if (a.solved && b.solved)
				return a.datesolved > b.datesolved ? -1 : 1;
			return +a.id.substring(0, 14) > +b.id.substring(0, 14) ? -1 : 1;
		});
		SET('tasks.items', response);
	});
}

$(document).on('keydown', '.enter', function(e) {
	if (e.keyCode !== 13)
		return;
	var val = this.value;
	if (this.name === 'newtask') {
		this.value = '';
		val && AJAX('POST ' + url, { type: 'insert', body: val }, tasks_refresh);
	} else if (this.name === 'comment') {
		this.value = '';
		val && AJAX('POST ' + url, { id: $(this).closest('figure').attr('data-id'), type: 'comment', body: val }, tasks_refresh);
	}
});

$(document).on('dblclick', '.fa-bug', set_superadmin);

function set_superadmin() {
	var is = $('.taskform').toggleClass('taskform-sa').hasClass('taskform-sa');
	var u = location.pathname;
	if (is)
		url = u;
	else
		url = u + '?customer=1';
	$(document.body).toggleClass('superadmin', is);
	CACHE('helpdesk.customer', is, '1 year');
}

COMPONENT('repeater', function() {

	var self = this;
	var recompile = false;

	self.readonly();

	self.make = function() {
		var element = self.find('script');

		if (!element.length) {
			element = self.element;
			self.element = self.element.parent();
		}

		var html = element.html();
		element.remove();
		self.template = Tangular.compile(html);
		recompile = html.indexOf('data-jc="') !== -1;
	};

	self.setter = function(value) {

		if (!value || !value.length) {
			self.empty();
			return;
		}

		var builder = [];
		for (var i = 0, length = value.length; i < length; i++) {
			var item = value[i];
			item.index = i;
			builder.push(self.template(item).replace(/\$index/g, i.toString()).replace(/\$/g, self.path + '[' + i + ']'));
		}

		self.html(builder);
		recompile && jC.compile();
	};
});

COMPONENT('confirm', function() {
	var self = this;
	var is = false;

	self.readonly();
	self.singleton();

	self.make = function() {
		self.toggle('ui-confirm hidden', true);
		self.element.on('click', 'button', function() {
			self.hide($(this).attr('data-index').parseInt());
		});

		self.element.on('click', function(e) {
			if (e.target.tagName !== 'DIV')
				return;
			var el = self.element.find('.ui-confirm-body');
			el.addClass('ui-confirm-click');
			setTimeout(function() {
				el.removeClass('ui-confirm-click');
			}, 300);
		});
	};

	self.confirm = function(message, buttons, fn) {
		self.callback = fn;

		var builder = [];

		buttons.forEach(function(item, index) {
			builder.push('<button data-index="{1}">{0}</button>'.format(item, index));
		});

		self.content('ui-confirm-warning', '<div class="ui-confirm-message">{0}</div>{1}'.format(message.replace(/\n/g, '<br />'), builder.join('')));
	};

	self.hide = function(index) {
		self.callback && self.callback(index);
		self.element.removeClass('ui-confirm-visible');
		setTimeout2(self.id, function() {
			self.element.addClass('hidden');
		}, 1000);
	};

	self.content = function(cls, text) {
		!is && self.html('<div><div class="ui-confirm-body"></div></div>');
		self.element.find('.ui-confirm-body').empty().append(text);
		self.element.removeClass('hidden');
		setTimeout2(self.id, function() {
			self.element.addClass('ui-confirm-visible');
		}, 5);
	};
});

COMPONENT('empty', function() {

	var self = this;

	self.readonly();

	self.make = function() {
		self.element.addClass('ui-empty');
	};

	self.setter = function(value) {
		self.element.toggleClass('hidden', value && value.length ? true : false);
	};
});

function urlify(str) {
	return str.replace(/(((https?:\/\/)|(www\.))[^\s]+)/g, function(url, b, c) {
		var len = url.length;
		var l = url.substring(len - 1);
		if (l === '.' || l === ',')
			url = url.substring(0, len - 1);
		else
			l = '';
		url = c === 'www.' ? 'http://' + url : url;
		return '<a href="' + url + '" target="_blank">' + url + '</a>' + l;
	});
}

function mailify(str) {
	return str.replace(/(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/g, function(m) {
		var len = m.length;
		var l = m.substring(len - 1);
		if (l === '.' || l === ',')
			m = m.substring(0, len - 1);
		else
			l = '';
		return '<a href="mailto:' + m + '">' + m + '</a>' + l;
	});
}

function smilefy(text) {
	var db = { ':-)': 1, ':)': 1, ';)': 8, ':D': 0, '8)': 5, ':((': 7, ':(': 3, ':|': 2, ':P': 6, ':O': 4, ':*': 9, '+1': 10, '1': 11, '\/': 12 };
	return text.replace(/(\-1|[:;8O\-)DP(|\*]|\+1){1,3}/g, function(match) {
		var smile = db[match.replace('-', '')];
		return smile == undefined ? match : '<span class="smiles smiles-' + smile + '"></span>';
	});
}

Tangular.register('body', function(val) {
	return urlify(mailify(smilefy(val)));
});