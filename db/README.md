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
