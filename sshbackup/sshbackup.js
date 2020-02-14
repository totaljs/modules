const Fs = require('fs');
const Ssh2 = require('ssh2');

var options = {};

exports.init = function(opts) {

	if (!opts || !opts.host || !opts.port || !opts.username)
		console.log('MODULE(ssh-backup) Error: missing options');

	if (!opts.privateKey && !opts.password)
		console.log('MODULE(ssh-backup) Error: missing privateKey or password');

	options = opts;
};

exports.backup = function(target, destination, callback) {

	if (!target || !destination)
		return callback('MODULE(ssh-backup) Error: missing `target` or `destination`');

	var conn = new Ssh2();

	conn.on('ready', function() {

		conn.sftp(function(err, sftp) {

			if (err) {
				callback && callback(err);
				return;
			}

			var writer = sftp.createWriteStream(destination);

			writer.on('close', function() {
				sftp.end();
				callback && callback();
			});

			Fs.createReadStream(target).pipe(writer);
		});
	});

	callback && conn.on('error', callback);
	conn.connect(options);
};
