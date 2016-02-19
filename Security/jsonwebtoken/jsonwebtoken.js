// MIT License
// Copyright Peter Širka <petersirka@gmail.com>

exports.version = 'v1.0';

var jwt = require('jsonwebtoken');

F.encrypt = function(value, key, unique) {
	return jwt.sign(value, key);
};

F.decrypt = function(value, key, json) {
	try {
		return jwt.verify(value, key);
	} catch (e) {
		return null;
	}
};