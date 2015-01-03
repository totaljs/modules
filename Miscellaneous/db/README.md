# total.js db module - like a codeigniter active record class
This module is compatible with CodeIgniter Active Record provides database support.
[CodeIgniter Active Record] (https://ellislab.com/codeigniter/user-guide/database/active_record.html)

There are currently only support Firebird and MySQL.

## Requirements

need be installed for the Firebird;
```
    npm install node-firebird
```    

need be installed for the MySQL;
```
    npm install mysql
```

## Configuration
In total.js configuration file;

```json
    db-driver          : firebird  //only support firebird and mysql
    db-host            : localhost
    db-port            : 3050
    db-database-name   : test
    db-user-name       : SYSDBA
    db-password        : masterkey
    db-debug-mode      : true
```

if debug mode is true, get method is write sql output to log file.

## Supported Functions

set - set field values.(fieldName, value) 
-----------------------------
**Parameters**

**fieldName**: string | object, single field name or fields and values in json object.

**value**: *, field value.

example:
```javascript
    db.set("age", 31);
    
    or
    
    db.set({"age": 31,
            "name": "Ys"}); 
```    


delete - delete record in database.(tableName, data, cb) 
-----------------------------
**Parameters**

**tableName**: string, delete table name.

**data**: object, delete where object.

**cb**: function, callback function. return one argument. err handling.

example:
```javascript
    db.where("id", 500);
    db.delete("test", function(err) {
        if (err) console.log("err:"+err.message);
    });
    
    or
    
    db.delete("test", {"id": 500}, function(err) {
        if (err) console.log("err:"+err.message);
    });
```

update - update selected record.(tableName, data, cb) 
-----------------------------
**Parameters**

**tableName**: string, update table name.

**data**: object, update data object. include fiels and values. optional.

**cb**: function, callback function. return one argument. err handling.

example:
```javascript
    db.where("id", 500);
    db.update("test", {"name": "test"}, function(err) {
        if (err)
            console.log(err.message);
    });
    
    or
    
    db.set("name", "test");
    db.where("id", 500);
    db.update("test", function(err) {
            if (err)
                console.log(err.message);
    });        
    
```

insert - insert record to database.(tableName, data, cb) 
-----------------------------
**Parameters**

**tableName**: string, insert table name.

**data**: object, fields and values json object. optional.

**cb**: function, callback function. return one argument. err handling.

example:
```javascript
    db.insert("test", {"age": 31,
                       "name": "Ys"},
    function (err) {
        if (err) console.log(err.message);
    });
    
    or
    
    db.set("age", 31);
    db.set("name", "Ys");
    db.insert("test", 
    function (err) {
        if (err) console.log(err.message);
    });
```

load - this function load and connect db.(cb) 
-----------------------------
**Parameters**

**cb**: function, callback this return err handling.


query - this function execute sql on database(sql, params, cb) 
-----------------------------
**Parameters**

**sql**: string, 

**params**: string | Array.&lt;string&gt;, 

**cb**: function, callback have two params. result and err.

example:
```javascript
    db.query("select * from test where age = ?", [31], function (result, err) {
        if (err) console.log(err.message);
        else
            console.log(result);
    });
```

select - set select string to sql.(sel) 
-----------------------------
**Parameters**

**sel**: string, select string. required.

example:
```javascript
    db.select("name");
    db.select("age");
    
    or
    
    db.select("name, age");
    db.select("(select sum(age) from test2) sum_age");
```

distinct - add distinct keyword to a query.() 
-----------------------------


having - add having.(param, value) 
-----------------------------
**Parameters**

**param**: string | object, having field name or object.

**value**: string, having value.

example:
```javascript
    db.having("age = 31");
    
    or
    
    db.having("age", 31);
    
    or
    
    db.having([{field: "age",
                value: 31
               },
               {field: "name",
                value: "Ys"}
                ]);
```

or_having - onyl seperates multiple clauses with or(param, value) 
-----------------------------
**Parameters**

**param**: string | object, having field name or object.

**value**: string, having value.


group_by - add group by clauses to a query.(param) 
-----------------------------
**Parameters**

**param**: string, group field name.

example:
```javascript
    db.group_by("name");
    
    or
    
    db.group_by(["name", "age"]);
```

order_by - set a order by clause.(param, type) 
-----------------------------
**Parameters**

**param**: string, fields names.

**type**: string, order by sorting type. default asc

example:
```javascript
    db.order_by("age", "desc");
    db.order_by("name");
    
    or
    
    db.order_by("age desc", "name asc");
```

where - this function create where string in sql(param, value) 
-----------------------------
**Parameters**

**param**: string | Array.&lt;string&gt;, key param or json object.

**value**: string, value optional param.

example:
```javascript
    db.where("name", "Ys");
    
    or
    
    db.where("age >", 31);
    
    or
    
    db.where([{
               field: "age >",
               value: 31
              },
              {
               field: "name",
               value: "Ys"
              }
             ]);   
```

like - add like clauses in sql.(param, value, type) 
-----------------------------
**Parameters**

**param**: string, field name

**value**: string, field value.

**type**: string, like clauses type. before, after or both. default both.

example:
```javascript
    db.like("name", "Ys");
    
    or
    
    db.like("name", "Ys", "both");
```

or_like - add like clauses in sql.(param, value, type) 
-----------------------------
**Parameters**

**param**: string, field name

**value**: string, field value.

**type**: string, like clauses type. before, after or both. default both.

example:
```javascript
    db.where("age", 31);
    db.or_like("name", "Ys");
    
    //output where age = 31 or name like '%Ys%'
```

not_like - add not like clauses in sql.(param, value, type) 
-----------------------------
**Parameters**

**param**: string, field name

**value**: string, field value.

**type**: string, like clauses type. before, after or both. default both.


or_not_like - add not like clauses in sql.(param, value, type) 
-----------------------------
**Parameters**

**param**: string, field name

**value**: string, field value.

**type**: string, like clauses type. before, after or both. default both.


or_where - add or clauses.(param, value) 
-----------------------------
**Parameters**

**param**: string | Array.&lt;string&gt;, key param or json object.

**value**: string, value optional param.

example:
```javascript
    db.where("age", 31);
    db.or_where("name", "Ys");
    
    //output: where age = 31 or name = 'Ys';
```

where_in - add &quot;in&quot; clauses.(param, value) 
-----------------------------
**Parameters**

**param**: string, in field name.

**value**: Array.&lt;string&gt;, in values. string array.

example:
```
    db.where_in("age", [30, 31]);
    
    //output: age in (30, 31);
```

or_where_in - add &quot;in&quot; clauses.(param, value) 
-----------------------------
**Parameters**

**param**: string, in field name.

**value**: Array.&lt;string&gt;, in values. string array.


where_not_in - add &quot;not in&quot; clauses.(param, value) 
-----------------------------
**Parameters**

**param**: string, in field name.

**value**: Array.&lt;string&gt;, in values. string array.


or_where_not_in - add &quot;not in&quot; clauses.(param, value) 
-----------------------------
**Parameters**

**param**: string, in field name.

**value**: Array.&lt;string&gt;, in values. string array.


get_where - get and where sql.(tableName, where, limit, offset, cb) 
-----------------------------
**Parameters**

**tableName**: string, get table name.

**where**: object, where sql. accept only json object.

**limit**: number, limit size. optional.

**offset**: number, offset position. optional.

**cb**: function, callback have a two params. result and err handling.

example:
```javascript
    db.get_where("test", [{field:"age",
                           value: 31},
                          {field:"name",
                           value: "Ys"}], 
                 function(result, err) {
                    if (err) console.log(err.message);
                    else console.log(result);
                 });
                 //output: select * from test where age = 31 and name = 'Ys'
```

select_max - this function add max aggregate in select string.(field, alias) 
-----------------------------
**Parameters**

**field**: string, max field name.

**alias**: string, max field alias name.


select_avg - this function add avg aggregate in select string.(field, alias) 
-----------------------------
**Parameters**

**field**: string, field name.

**alias**: string, field alias name.


select_sum - this function add sum aggregate in select string.(field, alias) 
-----------------------------
**Parameters**

**field**: string, field name.

**alias**: string, field alias name.


select_min(field, alias) 
-----------------------------
**Parameters**

**field**: string, 

**alias**: string, 


join - add sql join in sql string.(tableName, condition, joinType) 
-----------------------------
**Parameters**

**tableName**: string, join table name.

**condition**: string, join on condition

**joinType**: string, join type. left, right. default value is join.

example:
```javascript
    db.select("age");
    db.from("test");
    db.join("test2", "test2.user_id = test.id");
    //output select age from test join test2 on test2.user_id = test.id
    
    or
    
    db.select("age");
    db.from("test");
    db.join("test2", "test2.user_id = test.id", "left");
    //output select age from test left join test2 on test2.user_id = test.id
```

from - add table name in sql(tableName) 
-----------------------------
**Parameters**

**tableName**: required.


count_all_results - get query row count.(tableName, cb) 
-----------------------------
**Parameters**

**tableName**: string, count table name.

**cb**: function, callback function. have a two arguments. count and error.


count_all - get row count from table name.(tableName, cb) 
-----------------------------
**Parameters**

**tableName**: string, 

**cb**: function, have a two arguments. count and error.


limit -(limit, offset) 
-----------------------------
**Parameters**

**limit**: number, limit value.

**offset**: number, offset position. optional value.


get - get rows from table.(tableName, limit, offset, cb) 
-----------------------------
**Parameters**

**tableName**: string, table name.

**limit**: number, limit size. (optional)

**offset**: number, offset position. (optional)

**cb**: function, callback have a two params. result and err handling.

example:
```javascript
    db.select("name");
    db.select("age");
    db.from("test");
    db.where("name", "Ys");
    db.where("age", 31);
    db.get(function(result, err) {
        if (err)
            console.log("err:"+err.message);
        else
            console.log(result);
    });
```

## Examples

### Basic example

```javascript
    db.load(function (err) {
        if (!err) {
            db.select("h.id");
            db.select("d.adi");
            db.from("h");
            db.where("1", 1);
            db.like("d.adi", "TEST", "both");
            db.join("d", "d.id = h.d_id", "left");
            db.group_by(["1", "2"]);
            db.get(function (result, err) {
                if (err)
                  self.plain("err:"+err.message);
                else
                    self.json(result); //sql output: select h.id, d.adi from h left join d on d.id = h.d_id where 1=1 and d.adi like "%TEST%" group by 1,2
            });
        }
        else self.plain("error:"+err.message);
    });
```
