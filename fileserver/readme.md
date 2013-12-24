# FileServer

- __partial.js version +v1.3.2__
- You must download [FileServer application](https://github.com/petersirka/fileserver).
- copy **fileserver.js** to __/your-partialjs-website/modules/__
- FileServer using [FileStorage](https://github.com/petersirka/node-filestorage)

FileServer stores uploaded files in other server via HTTP protocol.

#### Configure

Use the definition:

```js
framework.module('fileserver').configure('mywebsite', 'http://127.0.0.1:8000');
```

#### Add a file or files: module.upload(name, httpFile/httpFiles, [callback], [headers])

```js
// this === controller
var self = this;
var fileserver = self.module('fileserver');

fileserver.upload('mywebsite', self.files, function(err, result) {
	self.json(result);
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

