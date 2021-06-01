// FlowStream module v1
// The MIT License
// Copyright 2021 (c) Peter Širka <petersirka@gmail.com>

const W = require('worker_threads');
const Parent = W.parentPort;

var CALLBACKS = {};
var FLOWS = {};
var TMS = {};
var CALLBACKID = 0;

/*
	var instance = MODULE('flowstream').init({ components: {}, design: {}, variables: {}, variables2: {} }, true/false);

	Methods:
	instance.trigger(id, data);
	instance.destroy();
	instance.input(id, data);
	instance.add(id, body, [callback]);
	instance.rem(id, [callback]);
	instance.io(callback);
	instance.reconfigure(id, config);
	instance.variables(variables);
	instance.variables2(variables);
	instance.socket(socket);

	Delegates:
	instance.onsave(data);
	instance.ondone();
	instance.onerror(err, type);
	instance.onoutput(id, data);

	Extended Flow instances by:
	instance.save();
	instance.output(data);
	instance.reconfigure(config);

*/

function Instance(instance, id) {
	this.id = id;
	this.flow = instance;
}

// Performs trigger
Instance.prototype.trigger = function(id, data) {
	var self = this;
	if (self.isworkerthread)
		self.postMessage({ TYPE: 'stream/trigger', id: id, data: data });
	else {
		var com = self.flow.meta.flow[id];
		if (com && com.trigger)
			com.trigger(data);
	}
	return self;
};

// Asssigns UI websocket the the FlowStream
Instance.prototype.socket = function(socket) {
	var self = this;
	exports.socket(self.flow, socket);
	return self;
};

// Destroys the Flow
Instance.prototype.destroy = function() {

	var self = this;

	if (self.flow.isworkerthread)
		self.flow.terminate();
	else
		self.flow.destroy();

	for (var key in CALLBACKS) {
		if (CALLBACKS[key].id === self.id)
			delete CALLBACKS[key];
	}

	delete FLOWS[self.id];
};

// Sends data to the speficic input
// "@id" sends to all component with "id"
// "id" sends to instance with "id"
Instance.prototype.input = function(id, data) {

	var self = this;

	if (self.flow.isworkerthread) {
		self.flow.postMessage({ TYPE: 'stream/input', id: id, data: data });
		return self;
	}

	if (id[0] === '@') {
		var tmpid = id.substring(1);
		for (var key in self.flow.meta.flow) {
			let tmp = self.flow.meta.flow[key];
			if (tmp.message && tmp.component === tmpid)
				tmp.message(data);
		}
	} else {
		let tmp = self.flow.meta.flow[id];
		if (tmp.message)
			tmp.message(data);
	}

	return self;
};

// Adds a new component
Instance.prototype.add = function(id, body, callback) {

	if (self.flow.isworkerthread) {
		var callbackid = callback ? (CALLBACKID++) : -1;
		if (callback)
			CALLBACKS[callbackid] = { id: self.flow.id, callback: callback };
		self.flow.postMessage({ TYPE: 'stream/add', id: id, data: body, callbackid: callbackid });
		return self;
	}

	self.flow.add(id, body, callback);
	return self;
};

// Removes specific component
Instance.prototype.rem = function(id, callback) {
	if (self.flow.isworkerthread) {
		var callbackid = callback ? (CALLBACKID++) : -1;
		if (callback)
			CALLBACKS[callbackid] = { id: self.flow.id, callback: callback };
		self.flow.postMessage({ TYPE: 'stream/rem', id: id, callbackid: callbackid });
		return self;
	}
	self.flow.unregister(id, callback);
	return self;
};

// Reads all inputs, outputs, publish, subscribe instances
Instance.prototype.io = function(callback) {

	var self = this;

	if (self.flow.isworkerthread) {
		var callbackid = CALLBACKID++;
		CALLBACKS[callbackid] = { id: self.flow.id, callback: callback };
		self.flow.postMessage({ TYPE: 'stream/io', callbackid: callbackid });
		return self;
	}

	var flow = self.flow;
	var arr = [];
	for (var key in flow.meta.flow) {
		let tmp = flow.meta.flow[key];
		let com = flow.meta.components[tmp.component];
		if (com.type === 'output' || com.type === 'input' || com.type === 'pub' || com.type === 'sub')
			arr.push({ id: key, componentid: tmp.component, name: com.config.name || com.name, schema: com.schemaid ? com.schemaid[1] : undefined, icon: com.icon });
	}

	callback(arr);
};

// Reconfigures a component
Instance.reconfigure = function(id, config) {
	if (self.flow.isworkerthread)
		self.flow.postMessage({ TYPE: 'stream/reconfigure', id: id, data: config });
	else
		self.flow.reconfigure(id, config);
	return self;
};

// Updates variables
Instance.variables = function(variables) {

	var self = this;
	var flow = self.flow;

	if (flow.isworkerthread) {
		flow.postMessage({ TYPE: 'stream/variables', data: variables });
	} else {
		flow.variables = variables;
		for (var key in flow.meta.flow) {
			var instance = flow.meta.flow[key];
			instance.variables && instance.variables(flow.variables);
		}
		flow.proxy.online && flow.proxy.send({ TYPE: 'flow/variables', data: variables });
		flow.save();
	}
	return self;
};

// Updates global variables
Instance.variables2 = function(variables) {

	var self = this;
	var flow = self.flow;

	if (flow.isworkerthread) {
		flow.postMessage({ TYPE: 'stream/variables2', data: variables });
	} else {
		flow.variables2 = variables;
		for (var key in flow.meta.flow) {
			var instance = flow.meta.flow[key];
			instance.variables2 && instance.variables2(flow.variables2);
		}
		flow.save();
	}
	return self;
};

// Initializes FlowStream
exports.init = function(meta, isworker) {
	return isworker ? init_worker(meta) : init_current(meta);
};

function init_current(meta) {

	var flow = exports.flowstream(meta);
	FLOWS[meta.id] = flow;

	flow.proxy.online = false;
	flow.$instance = new Instance(flow, meta.id);

	if (Parent) {

		Parent.on('message', function(msg) {

			switch (msg.TYPE) {

				case 'stream/reconfigure':
					flow.reconfigure(meta.id, meta.data);
					break;

				case 'stream/trigger':
					let tmp = flow.meta.flow[meta.id];
					if (tmp && tmp.trigger)
						tmp.trigger(msg.data);
					break;

				case 'stream/io':
					var arr = [];
					for (var key in flow.meta.flow) {
						let tmp = flow.meta.flow[key];
						let com = flow.meta.components[tmp.component];
						if (com.type === 'output' || com.type === 'input' || com.type === 'pub' || com.type === 'sub')
							arr.push({ id: key, flowid: meta.id, componentid: tmp.component, name: com.config.name || com.name, schema: com.schemaid ? com.schemaid[1] : undefined, icon: com.icon });
					}
					msg.data = arr;
					Parent.postMessage(msg);
					break;

				case 'stream/input':

					if (msg.id[0] === '@') {
						var id = msg.id.substring(1);
						for (var key in flow.meta.flow) {
							let tmp = flow.meta.flow[key];
							if (tmp.message && tmp.component === id)
								tmp.message(msg.data);
						}
					} else {
						let tmp = flow.meta.flow[msg.id];
						if (tmp.message)
							tmp.message(msg.data);
					}

					break;

				case 'stream/add':
					flow.add(msg.id, msg.data, function(err) {
						msg.error = err ? err.toString() : null;
						if (msg.callbackid !== -1)
							Parent.postMessage(msg);
					});
					break;

				case 'stream/rem':
					flow.unregister(msg.id, function(err) {
						msg.error = err ? err.toString() : null;
						if (msg.callbackid !== -1)
							Parent.postMessage(msg);
					});
					break;

				case 'stream/variables':
					flow.variables = msg.data;
					for (var key in flow.meta.flow) {
						var instance = flow.meta.flow[key];
						instance.variables && instance.variables(flow.variables);
					}
					flow.save();
					break;

				case 'stream/variables2':
					flow.variables2 = msg.data;
					for (var key in flow.meta.flow) {
						var instance = flow.meta.flow[key];
						instance.variables2 && instance.variables2(flow.variables2);
					}
					flow.save();
					break;

				case 'ui/newclient':
					flow.proxy.online = true;
					flow.proxy.newclient(msg.clientid);
					break;

				case 'ui/online':
					flow.proxy.online = msg.online;
					break;

				case 'ui/message':
					flow.proxy.message(msg.data, msg.clientid);
					break;
			}
		});

		flow.proxy.send = function(msg, type, clientid) {
			Parent.postMessage({ TYPE: 'ui/send', data: msg, type: type, clientid: clientid });
		};

		flow.proxy.save = function(data) {
			Parent.postMessage({ TYPE: 'stream/save', data: data });
		};

		flow.proxy.done = function(err) {
			Parent.postMessage({ TYPE: 'stream/done', error: err });
		};

		flow.proxy.error = function(err, type) {
			Parent.postMessage({ TYPE: 'stream/error', error: err, type: type });
		};

		flow.proxy.output = function(id, data) {
			Parent.postMessage({ TYPE: 'stream/output', id: id, data: data });
		};

	} else {

		flow.proxy.send = NOOP;
		flow.proxy.save = function(data) {
			flow.$instance.onsave && flow.$instance.onsave(data);
		};

		flow.proxy.error = function(err, type) {
			flow.socket && flow.socket.send({ TYPE: 'flow/error', error: error, type: type });
		};

		flow.proxy.done = function(err) {
			flow.$instance.ondone && setImmediate(flow.$instance.ondone, err);
		};

		flow.proxy.error = function(err, type) {
			flow.$instance.onerror && flow.$instance.onerror(err, type);
		};

		flow.proxy.output = function(id, data) {
			flow.$instance.onoutput && flow.$instance.onoutput(id, data);
		};
	}

	return flow.$instance;
}

function init_worker(meta) {

	var worker = new W.Worker(__filename, { workerData: meta });
	worker.$instance = new Instance(worker, meta.id);
	worker.isworkerthread = true;

	FLOWS[meta.id] = worker;

	worker.on('message', function(msg) {

		switch (msg.TYPE) {

			case 'stream/error':
				worker.socket && worker.socket.send({ TYPE: 'flow/error', error: msg.error, type: msg.type });
				worker.$instance.onerror && worker.$instance.onerror(msg.error, msg.type);
				break;

			case 'stream/save':
				worker.$instance.onsave && worker.$instance.onsave(msg.data);
				break;

			case 'stream/done':
				worker.$instance.ondone && worker.$instance.ondone(msg.error);
				break;

			case 'stream/output':
				worker.$instance.output && worker.$instance.output(msg.id, msg.data);
				break;

			case 'stream/add':
			case 'stream/rem':
				var cb = CALLBACKS[msg.callbackid];
				if (cb) {
					delete CALLBACKS[msg.callbackid];
					cb.callback(msg.error);
				}
				break;

			case 'stream/io':
				var cb = CALLBACKS[msg.callbackid];
				if (cb) {
					delete CALLBACKS[msg.callbackid];
					cb.callback(msg.data);
				}
				break;

			case 'ui/send':
				switch (msg.type) {
					case 1:
						worker.socket && worker.socket.send(msg.data, client => client.id === msg.clientid);
						break;
					case 2:
						worker.socket && worker.socket.send(msg.data, client => client.id !== msg.clientid);
						break;
					default:
						worker.socket && worker.socket.send(msg.data);
						break;
				}
				break;
		}

	});

	return worker.$instance;
}

exports.socket = function(flow, socket) {

	if (typeof(flow) === 'string')
		flow = FLOWS[flow];

	if (!flow) {
		setTimeout(() => socket.destroy(), 100);
		return;
	}

	flow.socket = socket;

	socket.on('open', function(client) {
		if (flow.isworkerthread) {
			flow.postMessage({ TYPE: 'ui/newclient', clientid: client.id });
		} else {
			flow.proxy.online = true;
			flow.proxy.newclient(client.id);
		}
	});

	socket.autodestroy(function() {

		delete flow.socket;

		if (flow.isworkerthread)
			flow.postMessage({ TYPE: 'ui/online', online: false });
		else
			flow.proxy.online = false;
	});

	socket.on('close', function() {
		var is = socket.online > 0;
		if (flow.isworkerthread)
			flow.postMessage({ TYPE: 'ui/online', online: is });
		else
			flow.proxy.online = is;
	});

	socket.on('message', function(client, msg) {
		if (flow.isworkerthread)
			flow.postMessage({ TYPE: 'ui/message', clientid: client.id, data: msg });
		else
			flow.proxy.message(msg, client.id);
	});

	if (flow.isworkerthread)
		return;

	flow.proxy.send = function(msg, type, clientid) {

		// 0: all
		// 1: client
		// 2: with except client

		switch (type) {
			case 1:
				socket.send(msg, conn => conn.id === clientid);
				break;
			case 2:
				socket.send(msg, conn => conn.id !== clientid);
				break;
			default:
				socket.send(msg);
				break;
		}
	};
};

exports.flowstream = function(meta) {

	var flow = FLOWSTREAM(meta.id, function(err, type, instance) {
		flow.proxy.error(err, type, instance);
	});

	var saveid;

	var save_force = function() {

		saveid && clearTimeout(saveid);
		saveid = null;

		var variables = flow.variables;
		var design = {};
		var components = {};
		var sources = {};

		for (var key in flow.sources) {
			var com = flow.sources[key];
			sources[key] = com;
		}

		for (var key in flow.meta.components) {
			var com = flow.meta.components[key];
			components[key] = com.ui.raw;
		}

		for (var key in flow.meta.flow) {
			var com = flow.meta.flow[key];
			var tmp = {};
			tmp.id = key;
			tmp.config = CLONE(com.config);
			tmp.x = com.x;
			tmp.y = com.y;
			tmp.schemaid = com.schemaid;
			tmp.note = com.note;
			tmp.schema = com.schema;
			tmp.component = com.component;
			tmp.connections = CLONE(com.connections);
			var c = flow.meta.components[com.component];
			tmp.meta = { type: c.type, icon: c.icon, group: c.group, name: c.name, inputs: c.inputs, outputs: c.outputs };
			design[key] = tmp;
		}

		var data = {};
		data.id = meta.id;
		data.reference = meta.reference;
		data.author = meta.author;
		data.group = meta.group;
		data.icon = meta.icon;
		data.color = meta.color;
		data.version = meta.version;
		data.readme = meta.readme;
		data.url = meta.url;
		data.name = meta.name;
		data.components = components;
		data.design = design;
		data.variables = variables;
		data.sources = sources;
		data.dtcreated = meta.dtcreated;
		data.dtupdated = new Date();
		flow.proxy.save(data);
	};

	var save = function() {

		// reloads TMS
		for (var key in flow.sockets)
			flow.sockets[key].synchronize();

		clearTimeout(saveid);
		saveid = setTimeout(save_force, 5000);
	};

	flow.save = function() {
		save();
	};

	var refresh_components = function() {
		flow.proxy.online && flow.proxy.send({ TYPE: 'flow/components', data: flow.components(true) });
	};

	flow.sources = meta.sources;
	flow.proxy = {};

	flow.proxy.message = function(msg, clientid) {
		switch (msg.TYPE) {

			case 'call':
				var instance = flow.meta.flow[msg.id];
				if (instance && instance.call) {
					msg.id = msg.callbackid;
					msg.TYPE = 'flow/call';
					instance.call(msg.data, function(data) {
						msg.data = data;
						flow.proxy.online && flow.proxy.send(msg, 1, clientid);
					});
				}
				break;

			case 'note':
				var instance = flow.meta.flow[msg.id];
				if (instance) {
					instance.note = msg.data;
					msg.TYPE = 'flow/note';
					flow.proxy.online && flow.proxy.send(msg, 0, clientid);
					save();
				}
				break;

			case 'status':
				flow.instances().wait(function(com, next) {
					com[msg.TYPE] && com[msg.TYPE](msg, 0, clientid);
					setImmediate(next);
				}, 3);
				break;

			case 'refresh':
				// Sends last statuses
				flow.instances().wait(function(com, next) {
					com.status();
					setImmediate(next);
				}, 3);
				break;

			case 'reset':
				flow.errors.length = 0;
				msg.TYPE = 'flow/reset';
				flow.proxy.online && flow.proxy.send(msg, 0, clientid);
				break;

			case 'trigger':
				var instance = flow.meta.flow[msg.id];
				instance && instance.trigger && instance.trigger(msg);
				break;

			case 'reconfigure':
				flow.reconfigure(msg.id, msg.data);
				break;

			case 'move':
				var com = flow.meta.flow[msg.id];
				if (com) {
					com.x = msg.data.x;
					com.y = msg.data.y;
					msg.TYPE = 'flow/move';
					flow.proxy.online && flow.proxy.send(msg, 2, clientid);
					save();
				}
				break;

			case 'save':
				flow.use(CLONE(msg.data), function(err) {
					msg.error = err ? err.toString() : null;
					flow.proxy.online && flow.proxy.send(msg, 2, clientid);
					save();
				});
				msg.TYPE = 'flow/design';
				break;

			case 'variables':
				flow.variables = msg.data;
				for (var key in flow.meta.flow) {
					var instance = flow.meta.flow[key];
					instance.variables && instance.variables(flow.variables);
				}
				msg.TYPE = 'flow/variables';
				flow.proxy.online && flow.proxy.send(msg);
				save();
				break;

			case 'sources':
				msg.TYPE = 'flow/sources';
				msg.data = flow.sources;
				flow.proxy.online && flow.proxy.send(msg, 1, clientid);
				break;

			case 'source_read':
				msg.TYPE = 'flow/source_read';
				msg.data = flow.sources[msg.id];
				msg.error = msg.data ? null : 'Not found';
				flow.proxy.online && flow.proxy.send(msg, 1, clientid);
				break;

			case 'source_save':

				TMS.check(msg.data, function(err, meta) {

					if (err) {
						delete msg.data;
						msg.TYPE = 'flow/source_save';
						msg.error = err.toString();
						flow.proxy.online && flow.proxy.send(msg, 1, clientid);
						return;
					}

					var source = flow.sources[msg.data.id];
					if (source) {
						source.name = msg.data.name;
						source.url = msg.data.url;
						source.token = msg.data.token;
						source.dtupdated = NOW;
						source.meta = meta;
						source.checksum = HASH(JSON.stringify(meta)) + '';
					} else {
						flow.sources[msg.data.id] = msg.data;
						msg.data.meta = meta;
						msg.data.checksum = HASH(JSON.stringify(meta)) + '';
					}

					TMS.refresh(flow);
					save();
					flow.proxy.online && flow.proxy.send({ TYPE: 'flow/source_save', callbackid: msg.callbackid, error: null }, 1, clientid);

				});

				break;

			case 'source_remove':

				msg.TYPE = 'flow/remove';
				var source = flow.sources[msg.id];
				if (source) {
					delete flow.sources[msg.id];
					flow.sockets[msg.id] && flow.sockets[msg.id].destroy();
					for (var key in fs.meta.components) {
						var com = fs.meta.components[key];
						if (com.schemaid && com.schemaid[0] === msg.id)
							flow.unregister(key);
					}
					save();
				}

				msg.error = source == null ? 'Not found' : null;
				flow.proxy.online && flow.proxy.send(msg, 1, clientid);
				break;

			case 'component_read':
				msg.TYPE = 'flow/component_read';
				msg.data = flow.meta.components[msg.id] ? flow.meta.components[msg.id].ui.raw : null;
				msg.error = msg.data == null ? 'Not found' : null;
				flow.proxy.online && flow.proxy.send(msg, 1, clientid);
				break;

			case 'component_save':
				flow.add(msg.id, msg.data, function(err) {
					delete msg.data;
					msg.TYPE = 'flow/component_save';
					msg.error = err ? err.toString() : null;
					flow.proxy.online && flow.proxy.send(msg, 1, clientid);
					refresh_components();
					save();
				});
				break;

			case 'component_remove':
				flow.unregister(msg.id, function() {
					refresh_components();
					save();
				});
				break;
		}
	};

	flow.errors = [];
	flow.variables = meta.variables;
	flow.variables2 = meta.variables2;
	flow.sockets = {};

	flow.load(meta.components, meta.design, function() {

		Object.keys(flow.sources).wait(function(key, next) {
			TMS.connect(flow, key, next);
		});

		flow.ready = true;
		setImmediate(() => flow.proxy.done());
	});

	flow.components = function(prepare_export) {

		var self = this;
		var arr = [];

		for (var key in self.meta.components) {
			var com = self.meta.components[key];
			if (prepare_export) {
				var obj = {};
				obj.id = com.id;
				obj.name = com.name;
				obj.type = com.type;
				obj.css = com.ui.css;
				obj.js = com.ui.js;
				obj.icon = com.icon;
				obj.config = com.config;
				obj.html = com.ui.html;
				obj.schema = com.schema ? com.schema.id : null;
				obj.readme = com.ui.readme;
				obj.template = com.ui.template;
				obj.settings = com.ui.settings;
				obj.inputs = com.inputs;
				obj.outputs = com.outputs;
				obj.group = com.group;
				obj.version = com.version;
				obj.author = com.author;
				arr.push(obj);
			} else
				arr.push(com);
		}

		return arr;
	};

	var minutes = -1;
	var memory = 0;

	// Captures stats from the Flow
	flow.onstats = function(stats) {

		if (stats.minutes !== minutes) {
			minutes = stats.minutes;
			memory = process.memoryUsage().heapUsed;
		}

		flow.stats.memory = memory;
		flow.stats.TYPE = 'flow/stats';
		flow.proxy.online && flow.proxy.send(stats);
	};

	var cleanerid;
	var problematic = [];
	var cleaner = function() {

		cleanerid = null;

		for (var key of problematic) {
			delete meta.components[key];
			flow.unregister(key);
		}

		flow.proxy.online && flow.proxy.send({ TYPE: 'flow/components', data: FS.components(true) });
		save();
	};

	var cleanerservice = function() {
		cleanerid && clearTimeout(cleanerid);
		cleanerid = setTimeout(cleaner, 500);
	};

	flow.onregister = function(component) {
		if (!component.schema && component.schemaid && (component.type === 'pub' || component.type === 'sub')) {
			var tmp = flow.sources[component.schemaid[0]];
			if (tmp && tmp.meta) {
				var arr = component.type === 'pub' ? tmp.meta.publish : tmp.meta.subscribe;
				component.schema = arr.findItem('id', component.schemaid[1]);
				component.itemid = component.schemaid[0];
			} else {
				problematic.push(component.id);
				cleanerservice();
			}
		}
	};

	flow.onconnect = function(instance) {

		instance.save = function() {
			var item = {};
			item.x = instance.x;
			item.y = instance.y;
			item.note = instance.note;
			item.config = instance.config;
			flow.proxy.online && flow.proxy.send({ TYPE: 'flow/redraw', id: instance.id, data: item });
			save();
		};

		instance.output = function(data) {
			flow.proxy.output(this.id, data);
		};

		instance.reconfigure = function(config) {
			this.main.reconfigure(this.id, config);
		};

	};

	flow.onreconfigure = function(instance) {
		flow.proxy.online && flow.proxy.send({ TYPE: 'flow/config', id: instance.id, data: instance.config });
	};

	flow.onerror = function(err) {

		err += '';

		var obj = {};
		obj.error = err;
		obj.id = this.id;
		obj.ts = new Date();

		flow.errors.unshift(obj);

		if (flow.errors.length > 10)
			flow.errors.pop();

		flow.proxy.online && flow.proxy.send({ TYPE: 'flow/error', error: err, id: this.id, ts: obj.ts });
	};

	// component.status() will execute this method
	flow.onstatus = function(status) {

		var instance = this;

		if (status == null)
			status = instance.$status;
		else
			instance.$status = status;

		if (status != null && flow.proxy.online)
			flow.proxy.online && flow.proxy.send({ TYPE: 'flow/status', id: instance.id, data: status });

	};

	// component.dashboard() will execute this method
	flow.ondashboard = function(status) {

		var instance = this;

		if (status == null)
			status = instance.$dashboard;
		else
			instance.$dashboard = status;

		if (status != null && flow.proxy.online)
			flow.proxy.online && flow.proxy.send({ TYPE: 'dashboard', id: instance.id, component: instance.component, data: status });

	};

	flow.on('schema', function() {
		if (flow.ready) {
			for (var key in flow.sockets)
				flow.sockets[key].synchronize();
		}
	});

	flow.proxy.newclient = function(clientid) {
		if (flow.proxy.online) {
			flow.proxy.send({ TYPE: 'flow/variables', data: flow.variables }, 1, clientid);
			flow.proxy.send({ TYPE: 'flow/variables2', data: flow.variables2 }, 1, clientid);
			flow.proxy.send({ TYPE: 'flow/components', data: flow.components(true) }, 1, clientid);
			flow.proxy.send({ TYPE: 'flow/design', data: flow.export() }, 1, clientid);
			flow.proxy.send({ TYPE: 'flow/errors', data: flow.errors }, 1, clientid);
			setTimeout(function() {
				flow.instances().wait(function(com, next) {
					com.status();
					setImmediate(next);
				}, 3);
			}, 1500);
		}
	};

	return flow;
};

require('total4/flowstream').prototypes().Message.variables = function(str, data) {
	if (str.indexOf('{') !== -1) {
		str = str.args(this.vars);
		if (str.indexOf('{') !== -1) {
			str = str.args(this.instance.main.variables);
			if (str.indexOf('{') !== -1) {
				str = str.args(this.instance.main.variables2);
				if (data == true || (data && typeof(data) === 'object'))
					str = str.args(data == true ? this.data : data);
			}
		}
	}
	return str;
};

// TMS implementation:
TMS.check = function(item, callback) {

	WEBSOCKETCLIENT(function(client) {

		if (item.token)
			client.headers['x-token'] = item.token;

		client.options.reconnect = 0;

		client.on('open', function() {
			client.tmsready = true;
		});

		client.on('error', function(err) {
			client.tmsready = false;
			callback(err);
			clearTimeout(client.timeout);
		});

		client.on('close', function() {
			client.tmsready = false;
			callback(401);
		});

		client.on('message', function(msg) {
			switch (msg.type) {
				case 'meta':
					callback(null, msg);
					clearTimeout(client.timeout);
					client.close();
					break;
			}
		});

		client.timeout = setTimeout(function() {
			if (client.tmsready) {
				client.close();
				callback(408);
			}
		}, 1500);

		client.connect(item.url.replace(/^http/g, 'ws'));
	});
};

function makemodel(item) {
	return { url: item.url, token: item.token, error: item.error };
}

TMS.connect = function(fs, sourceid, callback) {

	if (fs.sockets[sourceid]) {
		fs.sockets[sourceid].close();
		delete fs.sockets[sourceid];
	}

	WEBSOCKETCLIENT(function(client) {

		var item = fs.sources[sourceid];

		item.restart = false;
		client.options.reconnectserver = true;

		if (item.token)
			client.headers['x-token'] = item.token;

		client.on('open', function() {
			fs.sockets[item.id] = client;
			item.error = 0;
			item.init = true;
			item.online = true;
			client.subscribers = {};
			client.tmsready = true;
			client.model = makemodel(item);
			client.synchronize();
		});

		client.synchronize = function() {

			client.synchronized = true;

			var publishers = {};

			for (var key in fs.meta.flow) {
				var instance = fs.meta.flow[key];
				var com = fs.meta.components[instance.component];
				if (com.itemid === item.id && com.outputs && com.outputs.length) {
					if (Object.keys(instance.connections).length)
						publishers[com.schema.id] = 1;
				}
			}

			client.send({ type: 'subscribers', subscribers: Object.keys(publishers) });
		};

		client.on('close', function(code) {

			if (code === 4001)
				client.destroy();

			item.error = code;
			item.online = false;

			client.model = makemodel(item);
			// AUDIT(client, 'close');

			delete fs.sockets[item.id];
			client.tmsready = false;
		});

		client.on('message', function(msg) {

			switch (msg.type) {
				case 'meta':

					item.meta = msg;

					var checksum = HASH(JSON.stringify(msg)) + '';
					client.subscribers = {};
					client.publishers = {};

					for (var i = 0; i < msg.publish.length; i++) {
						var pub = msg.publish[i];
						client.publishers[pub.id] = pub.schema;
					}

					for (var i = 0; i < msg.subscribe.length; i++) {
						var sub = msg.subscribe[i];
						client.subscribers[sub.id] = 1;
					}

					if (item.checksum !== checksum) {
						item.init = false;
						item.checksum = checksum;
						TMS.refresh2(fs);
					}

					client.synchronize();
					break;

				case 'subscribers':
					client.subscribers = {};
					if (msg.subscribers instanceof Array) {
						for (var i = 0; i < msg.subscribers.length; i++) {
							var key = msg.subscribers[i];
							client.subscribers[key] = 1;
						}
					}
					break;

				case 'publish':
					var schema = client.publishers[msg.id];
					if (schema) {
						// HACK: very fast validation
						var err = new ErrorBuilder();
						var data = framework_jsonschema.transform(schema, err, msg.data, true);
						if (data) {
							var id = 'pub' + item.id + 'X' + msg.id;
							for (var key in fs.meta.flow) {
								var flow = fs.meta.flow[key];
								if (flow.component === id)
									flow.process(data, client);
							}
						}
					}
					break;
			}

		});

		client.connect(item.url.replace(/^http/g, 'ws'));
		callback && setImmediate(callback);
	});
};

const TEMPLATE_PUBLISH = `<script total>

	exports.name = '{0}';
	exports.icon = '{3}';
	exports.config = {};
	exports.outputs = [{ id: 'publish', name: '{1}' }];
	exports.group = 'Publishers';
	exports.type = 'pub';
	exports.schemaid = ['{7}', '{1}'];

	exports.make = function(instance) {
		instance.process = function(msg, client) {
			instance.send('publish', msg, client);
		};
	};

</script>

<style>
	.f-{5} .url { font-size: 11px; }
</style>

<readme>
	{2}
</readme>

<body>
	<header>
		<div><i class="{3} mr5"></i><span>{0}</span></div>
		<div class="url">{4}</div>
	</header>
	<div class="schema">{6}</div>
</body>`;

const TEMPLATE_SUBSCRIBE = `<script total>

	exports.name = '{0}';
	exports.icon = '{3}';
	exports.group = 'Subscribers';
	exports.config = {};
	exports.inputs = [{ id: 'subscribe', name: '{1}' }];
	exports.type = 'sub';
	exports.schemaid = ['{7}', '{1}'];

	exports.make = function(instance) {
		instance.message = function(msg, client) {
			var socket = instance.main.sockets['{7}'];
			if (socket && socket.subscribers['{1}']) {
				/*
					var err = new ErrorBuilder();
					var data = framework_jsonschema.transform(schema, err, msg.data, true);
					if (data)
						socket.send({ type: 'subscribe', id: '{1}', data: data });
				*/
				socket.send({ type: 'subscribe', id: '{1}', data: msg.data });
			}
			msg.destroy();
		};
	};

</script>

<style>
	.f-{5} .url { font-size: 11px; }
</style>

<readme>
	{2}
</readme>

<body>
	<header>
		<div><i class="{3} mr5"></i><span>{0}</span></div>
		<div class="url">{4}</div>
	</header>
	<div class="schema">{6}</div>
</body>`;

function makeschema(item) {

	var str = '';

	for (var key in item.properties) {
		var prop = item.properties[key];
		str += '<div><code>{0}</code><span>{1}</span></div>'.format(key, prop.type);
	}

	return str;
}

TMS.refresh = function(fs, callback) {

	Object.keys(fs.sources).wait(function(key, next) {

		var item = fs.sources[key];
		if (item.init) {

			if (item.restart || !fs.sources[key])
				TMS.connect(fs, item.id, next);
			else
				next();

		} else {

			var index = item.url.indexOf('/', 10);
			var url = item.url.substring(0, index);

			if (item.meta.publish instanceof Array) {
				for (var i = 0; i < item.meta.publish.length; i++) {
					var m = item.meta.publish[i];
					var readme = [];

					readme.push('# ' + item.meta.name);
					readme.push('- URL address: <' + url + '>');
					readme.push('- Channel: __publish__');
					readme.push('- JSON schema `' + m.id + '.json`');

					readme.push('```json');
					readme.push(JSON.stringify(m.schema, null, '  '));
					readme.push('```');

					var id = 'pub' + item.id + 'X' + m.id;
					var template = TEMPLATE_PUBLISH.format(item.meta.name, m.id, readme.join('\n'), m.icon || 'fas fa-broadcast-tower', m.url, id, makeschema(m.schema), item.id);
					var com = fs.add(id, template);
					m.url = url;
					com.type = 'pub';
					com.itemid = item.id;
					com.schema = m;
				}
			}

			if (item.meta.subscribe instanceof Array) {
				for (var i = 0; i < item.meta.subscribe.length; i++) {
					var m = item.meta.subscribe[i];
					var readme = [];

					readme.push('# ' + item.meta.name);
					readme.push('- URL address: <' + url + '>');
					readme.push('- Channel: __subscribe__');
					readme.push('- JSON schema `' + m.id + '.json`');

					readme.push('```json');
					readme.push(JSON.stringify(m, null, '  '));
					readme.push('```');

					var id = 'sub' + item.id + 'X' + m.id;
					var template = TEMPLATE_SUBSCRIBE.format(item.meta.name, m.id, readme.join('\n'), m.icon || 'fas fa-satellite-dish', m.url, id, makeschema(m.schema), item.id);
					var com = fs.add(id, template);
					m.url = url;
					com.type = 'sub';
					com.itemid = item.id;
					com.schema = m;
				}
			}

			if (item.socket)
				next();
			else
				TMS.connect(fs, item.id, next);
		}

	}, function() {

		var components = fs.meta.components;
		var unregister = [];

		for (var key in components) {
			var com = components[key];
			var type = com.type;
			if (type === 'pub' || type === 'sub') {
				var index = key.indexOf('X');
				if (index !== -1) {

					var sourceid = key.substring(3, index);
					var subid = key.substring(index + 1);
					var source = fs.sources[sourceid];

					if (source) {
						if (type === 'pub') {
							if (source.meta.publish instanceof Array) {
								if (source.meta.publish.findItem('id', subid))
									continue;
							}
						} else {
							if (source.meta.subscribe instanceof Array) {
								if (source.meta.subscribe.findItem('id', subid))
									continue;
							}
						}
					}

					unregister.push(key);
				}
			}
		}

		unregister.wait(function(key, next) {
			fs.unregister(key, next);
		}, function() {

			if (fs.proxy.online) {
				fs.proxy.send({ TYPE: 'flow/components', data: fs.components(true) });
				fs.proxy.send({ TYPE: 'flow/design', data: fs.export() });
			}

			fs.save();
			callback && callback();
		});

	});

};

TMS.synchronize = function(fs, force) {

	var sync = {};

	for (var key in fs.meta.components) {
		var com = fs.meta.components[key];
		if (com.itemid)
			sync[com.itemid] = fs.sources.findItem('id', com.itemid);
	}

	for (var key in sync) {
		var source = sync[key];
		if (source && source.socket && (force || !source.socket.synchronized))
			source.socket.synchronize();
	}
};

TMS.refresh2 = function(fs) {
	setTimeout2('tms_refresh_' + fs.name, fs => TMS.refresh(fs), 500, null, fs);
};

// Runs the worker
if (W.workerData) {
	F.dir(PATH.join(__dirname, '../'));
	exports.init(W.workerData);
}

ON('service', function() {
	if (CALLBACKID > 999999999)
		CALLBACKID = 0;
});