# QueryBuilder API

This module will enable full access to the DB for all external Total.js QueryBuilder declarations.

## Configuration

- `CONF.querybuilderapi {String}` optional, endpoint (default: `/db/`)
- `CONF.querybuilderapitoken {String}` __required__, a security token (compared with the URL query argument called `?token`)

### QueryBuilder declaration for external apps

```js
// DB connection to the external Total.js API with the QueryBuilderAPI module
NEWDB('default', function(filter, callback) {
	var opt = {};
	opt.url = 'https://yourapp.totaljs.com/db/?token=YOUR_TOKEN';
	opt.method = 'POST';
	opt.type = 'json';
	opt.keepalive = true;
	opt.body = JSON.stringify(filter);
	opt.callback = function(err, response) {
		if (err) {
			callback(err);
		} else {
			var data = response.body.parseJSON();
			var iserr = response.status !== 200;
			callback(iserr ? (data instanceof Array ? data[0].error : data) : null, iserr ? null : data);
		}
	};
	REQUEST(opt);
});
```