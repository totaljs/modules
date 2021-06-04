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
```