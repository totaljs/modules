# FileCache

- copy **filecache.js** to __/your-totaljs-website/modules/__
- __IMPORTANT:__ this module does not work with the cluster

FileCache stores uploaded files for some time. The module automatically removed older files.

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
	// { expire: Date, contentType: String, filename: String, length: Number, width: Number, height: Number }
}, true);
```

#### Read a file informations: filecache.info(id);

> If the file is expired or doesn't exist then function return __null__.

```js
// this === controller
var self = this;
var filecache = self.module('filecache');

console.log(filechace.info('d4e2ec5edbc4eda32e48'));
// { expire: Date, contentType: String, filename: String, path: String, length: Number, width: Number, height: Number }

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

#### Copy file: filecache.copy(id, path, [calllback], [removeAfterRead]);

```js
// this === controller
var self = this;
var filecache = self.module('filecache');

filecache.copy('id', '/newpah/myfile.jpg', function(err, path) {

	if (err) {
		self.view500(err);
		return;
	}

}, true);
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