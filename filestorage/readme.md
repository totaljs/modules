# FileStorage

- __partial.js version +v1.3.0__
- copy **filestorage.js** to __/your-partialjs-website/modules/__
- install [FileStorage](https://github.com/petersirka/node-filestorage)
- [filestorage documentation](https://github.com/petersirka/node-filestorage)
- all files will stored in __/your-partialjs-website/filestorage/__ directory
- __IMPORTANT:__ this module does not work with the cluster

```
$ npm install filestorage
```

Filestorage stores uploaded files.

```js
var filestorage = framework.filestorage('products');

// or

var filestorage = controller.filestorage('products');
```