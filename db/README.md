# total.js db module - like a codeigniter active record class
This module is compatible with CodeIgniter Active Record provides database support.
[CodeIgniter Active Record] (https://ellislab.com/codeigniter/user-guide/database/active_record.html)

There are currently only support Firebird.

## Configuration
In total.js configuration file;

```
    db-driver          : firebird  //only support firebird
    db-host            : localhost
    db-port            : 3050
    db-database-name   : test
    db-user-name       : SYSDBA
    db-password        : masterkey
```

## Supported Functions

Global
---



set - set field values.(fieldName, value) 
-----------------------------
**Parameters**

**fieldName**: string | object, single field name or fields and values in json object.

**value**: *, field value.


delete - delete record in database.(tableName, data, cb) 
-----------------------------
**Parameters**

**tableName**: string, delete table name.

**data**: object, delete where object.

**cb**: function, callback function. return one argument. err handling.


update - update selected record.(tableName, data, cb) 
-----------------------------
**Parameters**

**tableName**: string, update table name.

**data**: object, update data object. include fiels and values. optional.

**cb**: function, callback function. return one argument. err handling.


insert - insert record to database.(tableName, data, cb) 
-----------------------------
**Parameters**

**tableName**: string, insert table name.

**data**: object, fields and values json object. optional.

**cb**: function, callback function. return one argument. err handling.


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


select - set select string to sql.(sel) 
-----------------------------
**Parameters**

**sel**: string, select string. required.


distinct - add distinct keyword to a query.() 
-----------------------------


having - add having.(param, value) 
-----------------------------
**Parameters**

**param**: string | object, having field name or object.

**value**: string, having value.


or_having - onyl seperates multiple clauses with or(param, value) 
-----------------------------
**Parameters**

**param**: string | object, having field name or object.

**value**: string, having value.


group_by - add group by clauses to a query.(param) 
-----------------------------
**Parameters**

**param**: string, group field name.


order_by - set a order by clause.(param, type) 
-----------------------------
**Parameters**

**param**: string, fields names.

**type**: string, order by sorting type. default asc


where - this function create where string in sql(param, value) 
-----------------------------
**Parameters**

**param**: string | Array.&lt;string&gt;, key param or json object.

**value**: string, value optional param.


like - add like clauses in sql.(param, value, type) 
-----------------------------
**Parameters**

**param**: string, field name

**value**: string, field value.

**type**: string, like clauses type. before, after or both. default both.


or_like - add like clauses in sql.(param, value, type) 
-----------------------------
**Parameters**

**param**: string, field name

**value**: string, field value.

**type**: string, like clauses type. before, after or both. default both.


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


where_in - add &quot;in&quot; clauses.(param, value) 
-----------------------------
**Parameters**

**param**: string, in field name.

**value**: Array.&lt;string&gt;, in values. string array.


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


where - this function create where string in sql(self, param, value, type, operator) 
-----------------------------
**Parameters**

**self**: object, db class instance.

**param**: string | Array.&lt;string&gt;, key param

**value**: string, value optional param.

**type**: string, and, or. optional param. default value and.

**operator**: string, optional. default value =.


get_where - get and where sql.(tableName, where, limit, offset, cb) 
-----------------------------
**Parameters**

**tableName**: string, get table name.

**where**: object, where sql. accept only json object.

**limit**: number, limit size. optional.

**offset**: number, offset position. optional.

**cb**: function, callback have a two params. result and err handling.


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


---

## Examples

### Basic example

```
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
