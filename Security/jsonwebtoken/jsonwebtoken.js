// MIT License
// Copyright Peter Širka <petersirka@gmail.com>

exports.version = 'v1.0.0';

var jwt = require('jsonwebtoken');

F.encrypt = function(value, key) {
	return jwt.sign(value, key);
};

F.decrypt = function(value, key) {
	try {
		return jwt.verify(value, key);
	} catch (e) {
		return null;
	}
};