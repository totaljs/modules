// MIT License
// This module performs full-text search on the text content.
// Author: Peter Širka

const REG_KEYWORDS = /\s|\t|\n/;

function _min(d0, d1, d2, bx, ay) {
	return d0 < d1 || d2 < d1 ? d0 > d2 ? d2 + 1 : d0 + 1 : bx === ay ? d1 : d1 + 1;
}

// License: MIT
// Author: Gustaf Andersson
// Source: https://github.com/gustf/js-levenshtein
function levelstein(a, b) {

	if (a === b)
		return 0;

	if (a.length > b.length) {
		let tmp = a;
		a = b;
		b = tmp;
	}

	let la = a.length;
	let lb = b.length;

	while (la > 0 && (a.charCodeAt(la - 1) === b.charCodeAt(lb - 1))) {
		la--;
		lb--;
	}

	let offset = 0;

	while (offset < la && (a.charCodeAt(offset) === b.charCodeAt(offset)))
		offset++;

	la -= offset;
	lb -= offset;

	if (la === 0 || lb < 3)
		return lb;

	let x = 0;
	let y;
	let d0;
	let d1;
	let d2;
	let d3;
	let dd;
	let dy;
	let ay;
	let bx0;
	let bx1;
	let bx2;
	let bx3;
	let vector = [];

	for (y = 0; y < la; y++) {
		vector.push(y + 1);
		vector.push(a.charCodeAt(offset + y));
	}

	var len = vector.length - 1;

	for (; x < lb - 3;) {
		bx0 = b.charCodeAt(offset + (d0 = x));
		bx1 = b.charCodeAt(offset + (d1 = x + 1));
		bx2 = b.charCodeAt(offset + (d2 = x + 2));
		bx3 = b.charCodeAt(offset + (d3 = x + 3));
		dd = (x += 4);
		for (y = 0; y < len; y += 2) {
			dy = vector[y];
			ay = vector[y + 1];
			d0 = _min(dy, d0, d1, bx0, ay);
			d1 = _min(d0, d1, d2, bx1, ay);
			d2 = _min(d1, d2, d3, bx2, ay);
			dd = _min(d2, d3, dd, bx3, ay);
			vector[y] = dd;
			d3 = d2;
			d2 = d1;
			d1 = d0;
			d0 = dy;
		}
	}

	for (; x < lb;) {
		bx0 = b.charCodeAt(offset + (d0 = x));
		dd = ++x;
		for (y = 0; y < len; y += 2) {
			dy = vector[y];
			vector[y] = dd = _min(dy, d0, dd, bx0, vector[y + 1]);
			d0 = dy;
		}
	}

	return dd;
}

function parsekeywords(search) {

	let keywords = search.split(REG_KEYWORDS);
	let output = [];

	for (let i = 0; i < keywords.length; i++) {
		let keyword = keywords[i];
		if (keyword.trim()) {
			let kw = {};
			kw.text = keyword;
			kw.ch = search.indexOf(keyword);
			kw.search = kw.text.toASCII().replace(/y/g, 'i');
			output.push(kw);
		}
	}

	return output;
}

function FulltextResponse() {}

FulltextResponse.prototype = {
	get count() {
		return this.items.length;
	},
	get value() {
		let item = this.items[0];
		return item ? item.value : null;
	},
	get values() {
		let items = [];
		for (let m of this.items)
			items.push(m.value);
		return items;
	}
};

FulltextResponse.prototype.or = function(opt) {
	let t = this;
	return t.items.length ? t : t.search(opt);
};

FulltextResponse.prototype.set = function(path, arr) {
	let t = this;
	let val = arr ? t.values : t.value;
	if (path.includes('.'))
		U.set(t.parent.response, path, val);
	else
		t.parent.response[path] = val;
	return t;
};

FulltextResponse.prototype.search = function(opt) {

	let t = this;
	let output = [];

	for (let m of t.items) {

		let filter = {};
		for (let key in opt)
			filter[key] = opt[key];

		var from = opt.from || opt.line;

		filter.line = m.line;

		if (typeof(from) === 'string')
			filter.line += from.parseInt();

		output.push(filter);
	}

	if (output.length)
		return t.parent.search(output);

	let response = new FulltextResponse();
	response.parent = t.parent;
	return response;
};

FulltextResponse.prototype.next = function(fn) {
	let t = this;
	fn.call(t, t);
	return t;
};

function Fulltext() {
	var t = this;
	t.response = {};
	t.cache = {};
}

function preparevalue(opt, meta, val) {

	if (opt.limit)
		val = val.substring(0, opt.limit);

	meta.raw = val;

	if (opt.match) {
		val = val.match(opt.match);
		if (!val)
			return 0;
		val = val[0];
	}

	meta.matched = val;

	if (opt.clean)
		val = val.replace(opt.clean, '');

	if (opt.trim === undefined || opt.trim == true)
		val = val.trim();

	meta.cleaned = val;

	if (opt.convert) {
		switch (opt.convert) {
			case 'number':
				val = val.parseFloat2();
				break;
			default:
				val = val.parseDate(opt.convert);
				break;
		}
	}

	meta.value = val;
}

function findkeywords(opt, line, keywords, number) {

	let output = [];
	let counter = 0;
	let from = 0;
	let start = null;
	let diffcount = null;
	let linekeywords = line.keywords.slice(0);
	let diff = opt.diff ? (opt.diff + 1) : 0;

	for (let k of keywords) {
		let index = linekeywords.findIndex(opt.strict ? 'text' : 'search', opt.strict ? k.text : k.search);
		if (index !== -1) {
			let tmp2 = linekeywords[index];
			linekeywords.splice(index, 1);
			from = Math.max(from, tmp2.ch + tmp2.text.length);
			start = start == null ? tmp2.ch : Math.min(start, tmp2.ch);
			counter++;
		} else if (!opt.strict && diff) {
			// compare levelstein
			for (let j = 0; j < linekeywords.length; j++) {
				let k2 = linekeywords[j];
				if (Math.abs(k2.search.length - k.search.length) < diff) {
					let len = Math.ceil((k2.search.length + k.search.length) / 100 * 20);
					if (levelstein(k2.search, k.search) < len) {
						let startindex = line.text.indexOf(k2.text);
						from = Math.max(startindex + k2.text.length);
						start = start == null ? startindex : Math.min(start, startindex);
						diffcount++;
						counter++;
						linekeywords.splice(j, 1);
						break;
					}
				}
			}
		}
	}

	if (counter === keywords.length) {
		// Between keywords are spaces
		from += counter - 1;
		let raw = opt.parse ? line.text.substring(from) : line.text;
		let meta = { line: number, text: line.text, context: line.text.substring(start), ch: from, levelstein: diffcount || 0 };
		preparevalue(opt, meta, raw);
		output.push(meta);
	}

	return output.length ? output : null;
}

Fulltext.prototype.set = function(path, value) {
	var t = this;
	if (path.includes('.'))
		U.set(t.response, path, value);
	else
		t.response[path] = value;
	return t;
};

Fulltext.prototype.load = function(value, separator = '\n') {

	let t = this;
	let lines = separator ? value.split(separator).trim() : [value.trim()];
	var output = [];

	for (let line of lines) {

		let keywords = line.split(REG_KEYWORDS).trim();
		let item = {};

		item.text = line;
		item.keywords = [];

		for (let i = 0; i < keywords.length; i++) {
			let keyword = {};
			keyword.text = keywords[i];
			keyword.ch = line.indexOf(keyword.text);
			keyword.search = keyword.text.toASCII().replace(/y/g, 'i');
			item.keywords.push(keyword);
		}

		output.push(item);
	}

	t.lines = output;

	return t;
};

Fulltext.prototype.clear = function() {
	var t = this;
	t.cache = {};
	t.response = {};
	return t;
};

Fulltext.prototype.search = function(opt) {

	if (typeof(opt) === 'string')
		opt = { search: opt };

	let t = this;
	let output = [];
	let response = new FulltextResponse();
	response.parent = t;

	if (opt instanceof Array) {
		for (let m of opt) {
			let tmp = t.search(m);
			if (tmp.items.length)
				output.push.apply(output, tmp.items);
		}
		response.items = output;
		return response;
	}

	if (!opt.from)
		opt.from = 0;

	if (opt.line)
		opt.from = opt.line;

	if (!opt.to)
		opt.to = t.lines.length;
	else if (typeof(opt.to) === 'string')
		opt.to = opt.from + opt.to.parseInt();

	if (opt.parse === undefined)
		opt.parse = true;

	if (opt.diff == null)
		opt.diff = 2;

	if (opt.search instanceof RegExp) {
		for (let i = opt.from; i < opt.to; i++) {
			let line = t.lines[i];
			if (line) {
				let match = line.text.match(opt.search);
				if (match) {
					let meta = { line: i, text: line.text, context: match[0] };
					preparevalue(opt, meta, match[0]);
					output.push(meta);
				}
			}
		}

		response.items = output;
		return response;
	}

	let keywords = t.cache[opt.search];
	if (keywords == null)
		keywords = t.cache[opt.search] = parsekeywords(opt.search);

	for (let i = opt.from; i < opt.to; i++) {
		let line = t.lines[i];
		if (line) {
			let tmp = findkeywords(opt, line, keywords, i);
			if (tmp) {
				for (let m of tmp)
					output.push(m);
			}
		}
	}

	response.items = output;
	return response;
};

exports.load = function(value) {

	var fulltext = new Fulltext();

	// fulltext.search(opt)
	// opt.search {String/RegExp}
	// opt.clean {RegExp}
	// opt.match {RegExp}
	// opt.line {Number} or opt.from {Number} default: 0
	// opt.to {Number/String}
	// opt.diff {Number} default: 2
	// opt.trim {Boolean} default: true
	// opt.string {Boolean} default: false
	// opt.value {Boolean}
	// opt.limit {Number} max. chars for the obtaining value
	// returns response {FulltextResponse}

	// response.parent {FullText}
	// response.count {Number} returns a count of results
	// response.values {String/Number/Date Array} returns list of values
	// response.value {String/Number/Date} returns the first value
	// response.items[0].line {Number} line number
	// response.items[0].text {String}
	// response.items[0].ch {Number} char index
	// response.items[0].levelstein {Number} levelstein distance
	// response.items[0].raw {String} a raw found text
	// response.items[0].matched {String} a matched value
	// response.items[0].cleaned {String} a matched and cleaned value
	// response.items[0].value {String/Number/Date} a converted value
	// response.search(opt); // it continues with searching from the current line
	// response.next(fn); // it continues with searching from the current line
	// response.or(opt); // it's evaluated if the response doesn't contain "response"

	fulltext.load(value);

	return fulltext;
};