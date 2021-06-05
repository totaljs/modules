# FlowStream module

This module integrates Total.js FlowStream and extends it by adding new features. The module uses [__FlowStream app__](https://github.com/totaljs/flowstream).

## Usage

```js
var schema = { components: {}, design: {}, variables: {}, variables2: {} };
var worker_thread = true;
var instance = MODULE('flowstream');

// Methods:
// instance.init(meta [isworker]);
// instance.socket(meta, socket, check(client) => true);
// instance.input([flowstreamid], [id], data);
// instance.trigger(flowstreamid, id, data);
// instance.refresh([flowstreamid], [type]);
// instance.exec(flowstreamid, opt);
	// opt.id {String}
	// opt.ref {String} optional, custom reference
	// opt.uid {String} optional, custom reference
	// opt.repo {Object} optional, a custom message repository object
	// opt.vars {Object} optional, a custom message variables
	// opt.data {Object/String/Number} optional, data for the message
	// opt.timeout {Number} optional, a timeout in milliseconds
	// otp.callback(err, msg) return processed message
```