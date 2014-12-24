# FileStorage

- copy **filestorage.js** to __/your-totaljs-website/modules/__
- install [FileStorage](https://github.com/petersirka/node-filestorage)
- [filestorage documentation](https://github.com/petersirka/node-filestorage)
- all files will stored in __/your-totaljs-website/filestorage/__ directory
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