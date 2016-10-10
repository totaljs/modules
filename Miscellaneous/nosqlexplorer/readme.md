# NoSQL embedded database explorer

This module can publish a content of the NoSQL embedded databases. Bind your NoSQL embedded database with [NoSQL embedded database explorer](https://www.totaljs.com/nosql/).

- download and copy `nosqlexplorer.js` into the `/modules/` directory __or create a definition with:__

```javascript
var options = {};
// options.url = '/$nosqlexplorer/';
INSTALL('module', 'https://modules.totaljs.com/latest/nosqlexplorer.js', options);
```


---

## Configuration

```html
// Change URL to `nosqlexplorer` in a configuration file
nosqlexplorer-url          : /$nosqlexplorer/
```

## Usage

- Listing: <https://www.yourdomain.com/$nosqlexplorer/>
- Database: <https://www.yourdomain.com/$nosqlexplorer/?name=DATABASE_NAME>

__Get list of all databases manually__:

```javascript
MODULE('nosqlexplorer').databases(function(err, filenames) {
    filenames.forEach(function(file) {
        console.log(file.name, file.url, file.size);
    });
});
```

__NoSQL embedded database explorer:__

```html
https://nosql.totaljs.com?url=https%3A%2F%2Fwww.yourdomain.com%2F%24nosqlexplorer%2F%3Fname%3DDATABASE_NAME
```