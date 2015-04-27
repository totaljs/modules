# PostgreSQL

IN PROGRESS ...

```javascript
var Pg = MODULE('pg');
Pg.init('connection-string-to-postgresql');

// or
// var sql = Pg.create('connection-string-to-postgresql');

var sql = DATABASE();
sql.select('users', 'tbl_users', '*').where('age', '>', 20);
sql.query('products', 'SELECT * FROM tbl_products').between('price', 10, 20);

sql.exec(function(err, response) {
    // err === ErrorBuilder
    console.log(response.users);
    console.log(response.products);
});
```
