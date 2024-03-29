# TotalDB

This module allows you communicate easily with the __Total DB__.

## Usage example

```js
// TDB is a global variable

var endpoint = 'https://yourtotaldb.com?token=123456'

response = await TDB.read('type686', 's69a001ey41d').expand().fields('id,name,x14_name').promise(endpoint);
console.log(response);

response = await TDB.insert('type526', { name: 'Test XXL' }).promise(endpoint);
console.log(response);

response = await TDB.remove('type526', 'sp54001dk41d').promise(endpoint);
console.log(response);

response = await TDB.insert('type591', { name: 'A record name', x01: '123456' }).promise(endpoint);
console.log(response);

response = await TDB.read('type686', 's69a001ey41d').fields('id,name,x14_name').promise(endpoint);
console.log(response);
```

## Methods

- `read(type, id)` reads a specific record
- `first(type)` reads a specific record according to the filter
- `find(type)` finds records
- `list(type)` makes a list of recrods with the pagination
- `insert(type, data)` inserts a specific record
- `update(type, id, data)` updates a specific record
- `remove(type, id)` removes a specific record

A `{Response}` from the Total DB methods is the __TotalDB QueryBuilder__:

- `.paginate(page, [limit])`
- `.expand()` returns expanded relations
- `.group(groups)` performs a group by, example: `group('attr3,name')`
- `.sort(value)` sorts data, example: `sort('name asc,attr3 desc')`;
- `.fields(value)` filters fields, example: `fields('name,attr4_name')`
- `.where(value)` makes a simple filter `where('name=%Total%&attr3=100 - 200')`
- `.filter(value)` makes advanced filter `filter('[name=Total Avengers] AND [attr3>100] AND [attr3<300]')`;
- `.callback(url, callback)` a callback
- `.promise(url, [$])` returns a promise for async/await