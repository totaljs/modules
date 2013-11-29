# Live storage

- __partial.js version +v1.3.0__
- copy **storage.js** to __/your-partialjs-website/modules/__

Live storage stores data into the file. If you restart an app this data will be loaded automatically to the original state.

```js
framework.module('storage').set('key', 'value');
framework.module('storage').set('json', { A: true, B: 10 });

// or

controller.module('storage').set('key', 'value');
controller.module('storage').set('json', { A: true, B: 10 });

var json = framework.module('storage').get('json');

// json.A
// json.B

framework.module('storage').remove('key');
framework.module('storage').clear();

// Reload data
framework.module('storage').refresh();
```

## Using in views

- views support readonly mode

```
Value from storage: @{storage('key', 'DEFAULT VALUE')}
```

## Delegates

If you need store data into REDIS or MEMCACHED you can rewrite these prototypes:

```js
framework.once('load', function() {

	// DEFAULT
	framework.module('storage').onLoad = function() {
		var self = this;
		fs.readFile(self.framework.path.root('storage'), function(err, data) {
			if (err)
				return;
			try
			{
				self.repository = JSON.parse(data);
			} catch(err) {};
		});	
	};

	// DEFAULT
	framework.module('storage').onSave = function() {
		var self = this;
		fs.writeFile(self.framework.path.root('storage'), JSON.stringify(self.repository), utils.noop);
	};

});
```