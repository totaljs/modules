# Fulltext Search Engine

- copy **fulltext.js** to __/your-totaljs-website/modules/__
- install [fulltext module from NPM](https://github.com/petersirka/node-fulltext)
- [fulltext engine documentation](https://github.com/petersirka/node-fulltext)
- all files will stored in database directory
- __IMPORTANT:__ this module does not work with the cluster

```
$ npm install fulltext
```

```js
var fulltext = framework.fulltext('blogs');

// or

var fulltext = controller.fulltext('blogs');
```