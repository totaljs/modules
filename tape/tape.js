// [4 bytes]  | [4 bytes]    | [2 bytes]  | [info data]    | [file data]
// size_info  | size_file    | state      | {...json...}   | ... binary data ...
// size_info  | size_file    | state      | {...json...}   | ... binary data ...
// size_info  | size_file    | state      | {...json...}   | ... binary data ...
// size_info  | size_file    | state      | {...json...}   | ... binary data ...

const Fs = Total.Fs;

function Tape(filename) {
	let t = this;
	t.filename = filename;
	t.operation = 0; // 1: appending, 2: removing, 3: clearing
}

function base64size(bytes) {
	let tmp = 4 * (bytes / 3);
	tmp = Math.ceil(tmp);
	let mod = tmp % 4;
	if (mod)
		tmp += mod;
	return tmp;
}

function parseid(id) {
	let arr = id.split('X');
	return { offset: +arr[0], info: +arr[1], file: +arr[2] };
}

Tape.prototype.check = function(id, callback) {

	let t = this;

	Fs.open(t.filename, 'r', function(err, fd) {

		let meta = typeof(id) === 'string' ? parseid(id) : id;
		let buffer = Buffer.alloc(10 + meta.info);

		Fs.read(fd, buffer, 0, buffer.length, meta.offset, function(err, bytes) {

			if (bytes) {

				Fs.close(fd, NOOP);

				var size_info = buffer.readInt32BE(0);
				var size_file = buffer.readInt32BE(4);
				var state = buffer.readInt8(8);
				var info = buffer.toString('utf8', 10, size_info + 10);
				if (info[0] === '{' && info[info.length - 1] === '}') {
					// correct
					meta.meta = info;
					meta.state = state;
					callback(null, meta);
				} else
					callback('Invalid identifier');
			}

		});
	});
};

Tape.prototype.read = function(id, callback) {

	let t = this;

	if (!callback)
		return new Promise((resolve, reject) => t.read(id, (err, response) => err ? reject(err) : resolve(response)));

	let meta = parseid(id);

	t.check(meta, function(err, info) {

		if (err) {
			callback(err);
			return;
		}

		if (!info.state) {
			callback('Invalid identifier');
			return;
		}

		let data = info.meta.parseJSON(true);
		data.id = id;
		data.size = info.file;

		callback(null, data);
	});
};

function append(t, meta, buffer_file, callback) {

	let buffer_meta = Buffer.alloc(10);
	let buffer_info = Buffer.from(JSON.stringify(meta), 'utf8');

	buffer_meta.writeInt32BE(buffer_info.length, 0);
	buffer_meta.writeInt32BE(buffer_file.length, 4);
	buffer_meta.writeInt8(1, 8); // 0: removed; 1: active; 2: active compressed;

	let buffer = Buffer.concat([buffer_meta, buffer_info, buffer_file]);

	Fs.appendFile(t.filename, buffer, function() {
		Fs.lstat(t.filename, function(err, stat) {
			meta.id = (stat.size - buffer_info.length - buffer_file.length - 10) + 'X' + buffer_info.length + 'X' + buffer_file.length;
			meta.size = buffer_file.length;
			callback && callback(meta);
			t.operation = 0;
		});
	});

}

Tape.prototype.add = Tape.prototype.append = function(filename, meta, callback) {

	let t = this;

	if (!callback)
		return new Promise((resolve, reject) => t.append(filename, meta, (err, response) => err ? reject(err) : resolve(response)));

	if (t.operation) {
		callback('The file is locked for with another operation');
		return;
	}

	t.operation = 1;

	if (filename instanceof Buffer) {
		append(t, meta, filename, callback);
		return;
	}

	Fs.lstat(filename, function(err, stat) {

		if (!meta.name)
			meta.name = U.getName(filename);

		meta.date = stat.birthtime || stat.mtime;

		Fs.readFile(filename, function(err, buffer_file) {

			if (err) {
				t.operation = 0;
				callback(err);
			} else
				append(t, meta, buffer_file, callback);

		});
	});

};

Tape.prototype.stream = function(id, callback) {

	let t = this;

	if (!callback)
		return new Promise((resolve, reject) => t.stream(id, (err, response) => err ? reject(err) : resolve(response)));

	let meta = parseid(id);

	t.check(meta, function(err, info) {

		if (err) {
			callback(err);
			return;
		}

		if (!info.state) {
			callback('Invalid identifier');
			return;
		}

		let stream = Fs.createReadStream(t.filename, { start: meta.offset + meta.info + 10, end: meta.offset + meta.info + meta.file + 9 });
		callback(null, stream);
	});
};

Tape.prototype.remove = function(id, callback) {

	let t = this;

	if (!callback)
		return new Promise((resolve, reject) => t.remove(id, (err, response) => err ? reject(err) : resolve(response)));

	if (t.operation) {
		callback('The file is locked for with another operation');
		return;
	}

	t.check(id, function(err, meta) {

		if (err) {
			callback(err);
			return;
		}

		if (!meta.state) {
			callback('Invalid identifier');
			return;
		}

		t.operation = 2;

		Fs.open(t.filename, 'r+', function(err, fd) {

			t.operation = 0;

			if (err) {
				callback(err);
				return;
			}

			let arr = id.split('X');
			arr[0] = +arr[0];
			arr[1] = +arr[1];
			arr[2] = +arr[2];

			var buffer = Buffer.alloc(2);
			buffer.writeInt8(0);

			Fs.write(fd, buffer, 0, buffer.length, arr[0] + 8, function() {
				Fs.close(fd, NOOP);
			});
		});
	});

};

function readtape(filename, onitem, onclose) {

	Fs.open(filename, 'r', function(err, fd) {

		var read = function(offset) {

			let buffer = Buffer.alloc(10);

			Fs.read(fd, buffer, 0, buffer.length, offset, function(err, bytes) {

				if (!bytes) {
					// nothing (end of file)
					Fs.close(fd, NOOP);
					onclose && onclose();
					return;
				}

				let size_info = buffer.readInt32BE(0);
				let size_file = buffer.readInt32BE(4);
				let state = buffer.readInt8(8);

				// Removed, skip
				if (!state) {
					read(offset + size_info + size_file + 10);
					return;
				}

				let buffer_info = Buffer.alloc(size_info);

				Fs.read(fd, buffer_info, 0, buffer_info.length, offset + 10, function(err) {

					let item = buffer_info.toString('utf8').parseJSON(true);
					item.size = size_file;
					item.id = offset + 'X' + size_info + 'X' + size_file;

					onitem(item, function(cancel) {

						if (cancel) {
							Fs.close(fd, NOOP);
							onclose && onclose();
							return;
						}

						read(offset + size_info + size_file + 10);
					});

				});

			});
		};

		read(0);
	});
}

Tape.prototype.ls = function(callback) {

	let t = this;

	if (!callback)
		return new Promise((resolve, reject) => t.ls((err, response) => err ? reject(err) : resolve(response)));

	let arr = [];

	readtape(t.filename, function(item, next) {
		arr.push(item);
		next();
	}, () => callback(null, arr));

};

Tape.prototype.clear = function(callback) {

	let t = this;

	if (!callback)
		return new Promise((resolve, reject) => t.clear((err, response) => err ? reject(err) : resolve(response)));

	if (t.operation) {
		callback('The file is locked for with another operation');
		return;
	}

	t.operation = 3;

	let writer = Fs.createWriteStream(t.filename + '.tmp');
	let removed = 0;

	writer.on('close', function() {
		Fs.rename(t.filename + '.tmp', t.filename, function(err) {
			t.operation = 0;
			callback(err, removed);
		});
	});

	Fs.open(t.filename, 'r', function(err, fd) {

		var read = function(offset) {

			let buffer = Buffer.alloc(10);

			Fs.read(fd, buffer, 0, buffer.length, offset, function(err, bytes) {

				if (!bytes) {
					writer.end();
					Fs.close(fd, NOOP);
					return;
				}

				let size_info = buffer.readInt32BE(0);
				let size_file = buffer.readInt32BE(4);
				let state = buffer.readInt8(8);

				if (!state) {
					// skip item
					removed++;
					read(offset + 10 + size_info + size_file);
					return;
				}

				// In memory copy
				let data = Buffer.alloc(10 + size_info + size_file);

				Fs.read(fd, data, 0, data.length, offset, function(err, bytes) {
					if (bytes) {
						writer.write(data);
						read(offset + data.length);
					}
				});

			});
		};

		read(0);
	});
};

exports.create = filename => new Tape(filename);