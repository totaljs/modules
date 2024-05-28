// [4 bytes]  | [4 bytes]    | [2 bytes]  | [info data]    | [file data]         | [4 bytes] (due to reverse read)
// size_info  | size_file    | state      | {...json...}   | ... binary data ... | total_size
// size_info  | size_file    | state      | {...json...}   | ... binary data ... | total_size
// size_info  | size_file    | state      | {...json...}   | ... binary data ... | total_size
// size_info  | size_file    | state      | {...json...}   | ... binary data ... | total_size

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
		let buffer = Buffer.alloc(14 + meta.info);

		Fs.read(fd, buffer, 0, buffer.length, meta.offset, function(err, bytes) {

			if (bytes) {

				Fs.close(fd, NOOP);

				var size_info = buffer.readInt32BE(0);
				var size_file = buffer.readInt32BE(4);
				var state = buffer.readInt8(8);
				var checksum = buffer.readInt32BE(10);
				var sum = size_file + size_info + state;

				if (checksum !== sum) {
					callback('Invalid identifier');
					return;
				}

				var info = buffer.toString('utf8', 14, size_info + 14);
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

	let buffer_meta = Buffer.alloc(14);
	let buffer_info = Buffer.from(JSON.stringify(meta), 'utf8');
	let buffer_total = Buffer.alloc(4);

	buffer_meta.writeInt32BE(buffer_info.length, 0);
	buffer_meta.writeInt32BE(buffer_file.length, 4);
	buffer_meta.writeInt8(1, 8); // 0: removed; 1: active; 2: active compressed;
	buffer_meta.writeInt32BE(buffer_info.length + buffer_file.length + 1, 10); // a mini checksum

	// Due to reverse reading
	buffer_total.writeInt32BE(buffer_meta.length + buffer_info.length + buffer_file.length);

	// 4 bytes info size, 4 bytes file size, 2 bytes state, 4 bytes checksum, info_buffer, file_buffer, 4 bytes info about total size
	let buffer = Buffer.concat([buffer_meta, buffer_info, buffer_file, buffer_total]);

	Fs.appendFile(t.filename, buffer, function() {
		Fs.lstat(t.filename, function(err, stat) {
			meta.id = (stat.size - buffer_info.length - buffer_file.length - 14) + 'X' + buffer_info.length + 'X' + buffer_file.length;
			meta.size = buffer_file.length;
			callback && callback(null, meta);
			t.operation = 0;
		});
	});

}

Tape.prototype.add = Tape.prototype.append = function(filename, meta, callback) {

	let t = this;

	if (!callback) {
		return new Promise(function(resolve, reject) {
			t.append(filename, meta, function(err, response) {
				if (err)
					reject(err);
				else
					resolve(response);
			});
		});
	}

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

Tape.prototype.cursor = function(onitem, ondone) {
	// @TODO: missing reverse mode
	readtape(this.filename, onitem, ondone);
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

Tape.prototype.rm = Tape.prototype.remove = function(id, callback) {

	let t = this;

	if (!callback)
		return new Promise((resolve, reject) => t.remove(id, (err, response) => err ? reject(err) : resolve(response)));

	if (t.operation) {
		callback('The file is locked for with another operation');
		return;
	}

	var info = parseid(id);

	t.check(info, function(err, meta) {

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

			var buffer = Buffer.alloc(6);
			buffer.writeInt8(0);
			buffer.writeInt32BE(meta.info + meta.file + 0, 2); // checksum

			// (4 bytes info size, 4 bytes file size) = 8, 2 bytes state, 4 bytes checksum
			Fs.write(fd, buffer, 0, buffer.length, info.offset + 8, function() {
				Fs.close(fd, NOOP);
				callback(null, meta);
			});
		});
	});

};

function readtape(filename, onitem, onclose) {

	Fs.open(filename, 'r', function(err, fd) {

		var read = function(offset) {

			let buffer = Buffer.alloc(14);

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
				let checksum = buffer.readInt32BE(10);
				let sum = size_file + size_info + state;

				// Removed, skip
				if (checksum !== sum || !state) {
					read(offset + size_info + size_file + 14 + 4);
					return;
				}

				let buffer_info = Buffer.alloc(size_info);

				Fs.read(fd, buffer_info, 0, buffer_info.length, offset + 14, function(err, b) {

					let item = buffer_info.toString('utf8').parseJSON(true);
					item.size = size_file;
					item.id = offset + 'X' + size_info + 'X' + size_file;

					onitem(item, function(cancel) {

						if (cancel) {
							Fs.close(fd, NOOP);
							onclose && onclose();
							return;
						}

						read(offset + size_info + size_file + 14 + 4);
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

	t.operation = 4;
	Fs.unlink(t.filename, function(err) {
		t.operation = 0;
		callback();
	});
};

Tape.prototype.clean = function(callback) {

	let t = this;

	if (!callback)
		return new Promise((resolve, reject) => t.clean((err, response) => err ? reject(err) : resolve(response)));

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

			let buffer = Buffer.alloc(14);

			Fs.read(fd, buffer, 0, buffer.length, offset, function(err, bytes) {

				if (!bytes) {
					writer.end();
					Fs.close(fd, NOOP);
					return;
				}

				let size_info = buffer.readInt32BE(0);
				let size_file = buffer.readInt32BE(4);
				let state = buffer.readInt8(8);
				let checksum = buffer.readInt32BE(10);
				let sum = size_file + size_info + state;

				if (checksum !== sum || !state) {
					// skip item
					removed++;
					read(offset + 14 + size_info + size_file + 4);
					return;
				}

				// In memory copy
				let data = Buffer.alloc(14 + size_info + size_file + 4);

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