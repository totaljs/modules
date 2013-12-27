# FileServer

- __partial.js version +v1.3.1__
- You must download [FileServer application](https://github.com/petersirka/fileserver).
- copy **fileserver.js** to __/your-partialjs-website/modules/__
- FileServer using [FileStorage](https://github.com/petersirka/node-filestorage)

FileServer stores uploaded files on other server via HTTP protocol.

#### Configure

Use the definition:

```js
framework.module('fileserver').configure('mywebsite', 'http://127.0.0.1:8000');

// or

framework.module('fileserver').configure('mywebsite', 'http://127.0.0.1:8000', function(err) {
	// check availability
	if (err)
		console.log(err);
});
```

#### Add a file or files: module.upload(name, httpFile/httpFiles, [callback], [headers])

> Module return FileID collection from the FileServer.

```js
// this === controller
var self = this;
var fileserver = self.module('fileserver');

fileserver.upload('mywebsite', self.files, function(err, result) {
	self.json(result);
});

// or

fileserver.upload('mywebsite', self.files[0], function(err, result) {
	var file = result[self.file[0].name];
	// file.id
	self.json(file);
	//	self.json(result);
});
```

#### Remove a file or files: module.remove(name, id, [callback], [headers])

```js
// this === controller
var self = this;
var fileserver = self.module('fileserver');

fileserver.remove('mywebsite', 1, function(err) {

});

// or remove multiple files

fileserver.remove('mywebsite', [1, 3, 4, 5], function(err) {

});
```

#### Read a file: module.read(name, id, [callback], [headers])

```js
// this === controller
var self = this;
var fileserver = self.module('fileserver');

fileserver.read('mywebsite', 1, function(err, stream, contentType, length, width, height) {

});
```

#### Read a file information: module.info(name, id, [callback], [headers])

```js
// this === controller
var self = this;
var fileserver = self.module('fileserver');

fileserver.info('mywebsite', 1, function(err, info) {
	console.log(info);
});
```

#### Read FileServer information: module.count(name, [callback], [headers])

```js
// this === controller
var self = this;
var fileserver = self.module('fileserver');

fileserver.count('mywebsite', function(err, info) {
	console.log(info);
});
```

#### Listing: module.listing(name, [callback], [headers])

```js
// this === controller
var self = this;
var fileserver = self.module('fileserver');

fileserver.listing('mywebsite', function(err, list) {
	console.log(list);
});
```

#### Server availability: module.availability(name, callback)

```js
// this === controller
var self = this;
var fileserver = self.module('fileserver');

fileserver.availability('mywebsite', function(err, name) {
	if (err)
		console.log(err);
	else
		console.log('FileServer ' + name + ' is available.');
});
```

#### Pipe to current response: module.pipe(req, res, name, id, [headers]);

```js
function onFile(req, res, isValidation) {

	// this === framework
	var self = this;
	var fileserver = self.module('fileserver');

	fileserver.pipe(req, res, 'mywebsite', 1);
}
```

#### Pipe to current response as Image: module.pipe_image(req, res, name, id, fnProcess, [headers], [useImageMagick]);

```js
function onFile(req, res, isValidation) {

	// this === framework
	var self = this;
	var fileserver = self.module('fileserver');

	// EVERYTIME CACHED

	fileserver.pipe_image(req, res, 'mywebsite', 1, function(image) {
        image.resizeCenter(180, 180);
        image.quality(80);
        image.minify();
        image.output('jpg');
	});
}
```

#### Pipe to current response as Image: module.pipe_image_withoutcache(req, res, name, id, fnProcess, [headers], [useImageMagick]);

```js
function onFile(req, res, isValidation) {

	// this === framework
	var self = this;
	var fileserver = self.module('fileserver');

	fileserver.pipe_image_withoutcache(req, res, 'mywebsite', 1, function(image) {
        image.resizeCenter(180, 180);
        image.quality(80);
        image.minify();
        image.output('jpg');
	});
}
```