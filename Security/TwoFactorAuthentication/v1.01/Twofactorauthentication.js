// Copyright 2015 (c) Andrea Sessa <andrea.sessa@gmail.com>
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

exports.version = '1.01';
exports.id = 'TwoFactorAuthentication';

var crypto = require('crypto');
var base32 = require('thirty-two');
var http = require('http');

/**
 * Return an array with all 32 characters for encoding/decoding base32 based on RFC 4648
 * @return Array
 */
var BASE32_ENCODE_CHAR = [
	'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', //  7
	'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', // 15
	'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', // 23
	'Y', 'Z', '2', '3', '4', '5', '6', '7' // 31
];

/**
 * Constructor
 */
function TwoFactorAuthentication() {};

/**
 * Create new secret.
 *
 * @return String
 */
TwoFactorAuthentication.prototype.newSecret = function() {
	var secret = '';
	for (i = 0; i < 16; i++) {
		secret += BASE32_ENCODE_CHAR.random();
	}

	return secret;
};

/**
 * Calculate the code with given secret
 *
 * @param String secret
 * @param Number tolerance (optional)
 * @return String
 */
TwoFactorAuthentication.prototype.getCode = function(secret, tolerance) {
	if (!tolerance)
		tolerance = 30;

	var secretkey = base32.decode(secret);

	var hmac = crypto.createHmac('sha1', secretkey);

	var tolerance = Math.floor((Date.now() / 1000) / tolerance);

	// Convert tolerance to hex
	var toleranceBytes = new Array(8);
	for (var i = 7; i >= 0; i--) {
		toleranceBytes[i] = tolerance & 0xff;
		tolerance = tolerance >> 8;
	}

	var token = hmac.update(new Buffer(toleranceBytes)).digest('hex');

	// Convert token to hex
	var tokenBytes = [];
	for (var i = 0; i < token.length; i += 2) {
		tokenBytes.push(parseInt(token.substr(i, 2), 16));
	}

	// truncate to 4 bytes
	var offset = tokenBytes[19] & 0xf;
	var ourCode =
		((tokenBytes[offset++] & 0x7f) << 24 |
		(tokenBytes[offset++] & 0xff) << 16 |
		(tokenBytes[offset++] & 0xff) << 8  |
		(tokenBytes[offset++] & 0xff)).toString();


	// truncate to correct length
	ourCode = ourCode.substr(ourCode.length - 6).padLeft(6, '0');

	return ourCode;
};

/**
 * Get QR-Code from google charts
 *
 * @param String name
 * @param String secret
 * @param String [format] (Values: binary, base64. Default base64)
 * @param Function callback
 * @return String | Binary
 */
TwoFactorAuthentication.prototype.getQRCode = function(name, secret, format, callback) {
	var rcvd_data = '';

	if (typeof format !== 'string') {
		callback = format;
		format = 'base64';
	}

	var options = {
		hostname: 'chart.googleapis.com',
		port: 80,
		path: '/chart?chs=200x200&chld=M|0&cht=qr&chl=otpauth://totp/' + name + '?secret=' + secret,
		method: 'GET',
	};

	var req = http.request(options, function(res) {
		res.setEncoding('binary');

		if (res.statusCode != 200) {
			callback(res.statusCode);
			return;
		}

		res.on('data', function (chunk) {
			rcvd_data += chunk;
		});

		res.on('end', function() {
			if (format === 'binary') {
				callback(false, new Buffer(rcvd_data, 'binary'));
			} else {
				callback(false, "data:" + res.headers["content-type"] + ";base64," + new Buffer(rcvd_data, 'binary').toString('base64'));
			}
		});
	});

	req.on('error', function(e) {
		callback(500);
	});

	req.end();
};

/**
 * Check provided code with secret.
 *
 * @param String secret
 * @param String code
 * @param Number [tolerance] This will accept codes between tolerance (+/- 30sec) (f.e. 8 = 4 minutes before / after)
 * @return Boolean
 */
TwoFactorAuthentication.prototype.verify = function(secret, code, tolerance) {
	if (!tolerance)
		tolerance = 1;

	for (i = (tolerance*-1); i <= tolerance; i++) {
		var chkCode = this.getCode(secret, (i * 30));
		if (chkCode === code) return true;
	}

	return false;
}

TwoFactorAuthentication.prototype.generateBackupCode = function() {
	var code = '';
	for (i = 0; i < 13; i++) {
		code += BASE32_ENCODE_CHAR.random();
		if (i == 3 || i == 7) code += '-';
	}

	return code;
}

TFA = new TwoFactorAuthentication;

/**
 * Module install
 */
exports.install = function() {
	F.TFA = TFA;
};

/**
 * Module uninstall
 */
module.exports.uninstall = function() {
	delete F.TFA;
};