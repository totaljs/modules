var fs = require('fs');
var ssh2 = require('ssh2');

var version = 'v1.0.0';
var options = {};

exports.init = function(opts) {

	if (!opts || !opts.host || !opts.port || !opts.username) return console.log('MODULE(ssh-backup) Error: missing options');
	if (!opts.privateKey && !opts.password) return console.log('MODULE(ssh-backup) Error: missing privateKey or password');

	options = opts;
};

exports.backup = function(target, destination, callback) {

	if (!target || !destination) return callback('MODULE(ssh-backup) Error: missing `target` or `destination`');

	var conn = new ssh2();

	conn.on('ready', function() {

		conn.sftp(function(err, sftp) {

			if (err) {
				return callback && callback('MODULE(ssh-backup) Error: problem starting SFTP: %s', err);
			}

			var readStream = fs.createReadStream(target);
			var writeStream = sftp.createWriteStream(destination);

			writeStream.on('close', function() {
				sftp.end();
				callback && callback(null);
			});

			readStream.pipe(writeStream);
		});
	});

	conn.on('error', function(err) {
		callback && callback('MODULE(ssh-backup) Error: could not connect', err);
	});

	conn.connect(options);
};
