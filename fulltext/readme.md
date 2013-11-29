# Live storage

- __partial.js version +v1.3.0__
- copy **fulltext.js** to __/your-partialjs-website/modules/__
- install [fulltext module from NPM](https://github.com/petersirka/node-fulltext)
- all files will stored in database directory

```
$ npm install fulltext
```

Live storage stores data into the file. If you restart an app this data will be loaded automatically to the original state.

```js
var fulltext = framework.fulltext('database-name');

// or

var fulltext = controller.fulltext('database-name');
```