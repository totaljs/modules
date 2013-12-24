# FileCache

- __partial.js version +v1.3.2__
- copy **filecache.js** to __/your-partialjs-website/modules/__
- __IMPORTANT:__ this module does not work with the cluster

Filecache stores uploaded files for some time. The module automatically removed older files.

#### Add a file: filecache.add(file, expire, [callback])

```js
// this === controller
var self = this;
var filecache = self.module('filecache');

var id = filecache.add(self.files[0], new Date().add('minute', 5));
console.log(id);

// or

filecache.add(self.files[0], new Date().add('minute', 5), function(id, header) {
	console.log(id);
	console.log(header);
}, true);
```

#### Read a file: filecache.read(id, calllback, [removeAfterRead]);

```js
// this === controller
var self = this;
var filecache = self.module('filecache');

filecache.read('id', function(err, header, stream) {

	if (err) {
		self.view500(err);
		return;
	}

	// header.contentType {String}
	// header.filename {String}
	// header.expire {DateTime}

	self.stream(header.contentType, stream);
});
```

#### Has a file: filecache.has(id);

```js
// this === controller
var self = this;
var filecache = self.module('filecache');

console.log(filecache.has('id')); // TRUE or FALSE
```

#### Remove a file: filecache.remove(id)

```js
// this === controller
var self = this;
var filecache = self.module('filecache');

filecache.remove('id');

// or

filecache.remove(['id1', 'id2', 'id3']);
```

#### Send files to FileServer: filecache.fileserver(name, id, [callback], [headers], [removeAfterRead])

> removeAfterRead = true

```js
// this === controller
var self = this;
var filecache = self.module('filecache');
var fileserver = self.module('fileserver');

var files = filecache.fileserver('mywebsite', 'id', function(err, result) {

});

// or

var files = filecache.fileserver('mywebsite', ['id1', 'id2', 'id3'], function(err, result) {

});
```