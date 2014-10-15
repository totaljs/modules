//author:  Serkan KOCAMAN - http://www.github.com/KiPSOFT

exports.name = 'db';
exports.version = '1.01';

/**
 * db class.
 * @class
 * @private
 */
function _db() {
    this.driver = null;
    this.options = {};
    this.driverName = null;
    this.database = null;
    clearValues(this);
}


function clearValues(self) {
    self.selectstr = "*";
    self.wherestr = "";
    self.fromstr = "";
    self.joinstr = " ";
    self.groupbystr = "";
    self.distinctstr = "";
    self.havingstr = "";
    self.orderbystr = "";
    self.limitstr = "";
    self.fields = [];
    self.values = [];
};

/**
 * @function set - set field values.
 * @param {string|object} fieldName - single field name or fields and values in json object.
 * @param {*} [value] - field value.
 */
_db.prototype.set = function (fieldName, value) {
    var self = this;
    if (typeof fieldName !== "object" && value !== undefined) {
        self.fields.push(fieldName);
        if (typeof value === "string")
            self.values.push("'" + value + "'");
        else
            self.values.push(value);
    }
    else if (typeof fieldName === "object" && value === undefined) {
        for (var key in fieldName) {
            self.fields.push(key);
            if (typeof fieldName[key] === "string")
                self.values.push("'" + fieldName[key] + "'");
            else
                self.values.push(fieldName[key]);
        }
    }
};

/**
 * @function delete - delete record in database.
 * @param {string} tableName - delete table name.
 * @param {object} [data] - delete where object.
 * @param {function} cb - callback function. return one argument. err handling.
 */
_db.prototype.delete = function (tableName, data, cb) {
    var self = this;
    if (typeof data !== "function" && typeof data === "object") {
        self.where(data);
    }
    var sql = "DELETE FROM " + tableName + " " + self.wherestr;
    self.query(sql, undefined, function (result, err) {
        if (typeof data === "function")
            data(err);
        else
            cb(err);
        clearValues(self);
    });
};


/**
 * @function update - update selected record.
 * @param {string} tableName - update table name.
 * @param {object} [data] - update data object. include fiels and values. optional.
 * @param {function} cb - callback function. return one argument. err handling.
 */
_db.prototype.update = function (tableName, data, cb) {
    var self = this;
    if (typeof data !== "function" && typeof data === "object") {
        self.set(data);
    }
    var tmp = "";

    self.fields.forEach(function (element, index) {
        if (tmp !== "")
            tmp += ", ";
        tmp += element + " = " + self.values[index];
    });
    var sql = "UPDATE " + tableName + " SET " + tmp + " " + self.wherestr;
    self.query(sql, undefined, function (result, err) {
        if (typeof data === "function")
            data(err);
        else
            cb(err);
        clearValues(self);
    });
};

/**
 * @function insert - insert record to database.
 * @param {string} tableName - insert table name.
 * @param {object} [data] - fields and values json object. optional.
 * @param {function} cb - callback function. return one argument. err handling.
 */
_db.prototype.insert = function (tableName, data, cb) {
    var self = this;
    if (typeof data !== "function" && typeof data === "object") {
        self.set(data);
    }
    var sql = "INSERT INTO " + tableName + " (" + self.fields.join() + ") VALUES (" + self.values.join() + ")";
    self.query(sql, undefined, function (result, err) {
        if (typeof data === "function")
            data(err);
        else
            cb(err);
        clearValues(self);
    });
};

/**
 * @function load - this function load and connect db.
 * @param {function} cb - callback this return err handling.
 */
_db.prototype.load = function (cb) {
    var self = this;
    if (self.driverName === "firebird") {
        self.driver.attach(
            {
                host: self.options.host,
                database: self.options.database,
                user: self.options.username,
                password: self.options.password,
                port: self.options.port
            },
            function (err, db) {
                if (err) {
                    self.framework.error(err.message, "db");
                    cb(err);
                } else {
                    self.database = db;
                    cb();
                }
            }
        );
    }
    else if (self.driverName === "mysql") {
        var connection = self.driver.createConnection({
            host: self.options.host,
            user: self.options.username,
            password: self.options.password,
            port: self.options.port,
            database: self.options.database
        });
        connection.connect(function (err) {
            if (err) {
                var tmpErr = {
                    message: err.stack
                };
                self.framework.error(err.stack, "db");
                cb(tmpErr);
            }
            else {
                self.database = connection;
                cb();
            }
        });
    }
};

/**
 * @function query - this function execute sql on database
 * @param {string} sql
 * @param {string|string[]} params
 * @param {function} cb - callback have two params. result and err.
 */
_db.prototype.query = function (sql, params, cb) {
    var self = this;
    if (self.driverName === "firebird") {
        self.database.query(sql, params,
            function (err, result) {
                if (err) {
                    self.framework.error(err.message, "db");
                    cb(undefined, err);
                }
                else {
                    cb(result, err);
                }
            }
        );
    }
    else if (self.driverName === "mysql") {
        self.database.query(sql, params,
            function (err, result) {
                if (err) {
                    self.framework.error(err.stack, "db");
                    cb(undefined, err);
                }
                else {
                    cb(result, err);
                }
            }
        );
    }
};

/**
 * @function select - set select string to sql.
 * @param {string} sel - select string. required.
 */
_db.prototype.select = function (sel) {
    var self = this;
    if (self.selectstr === "*")
        self.selectstr = sel;
    else
        self.selectstr += "," + sel;
};

/**
 * @function distinct - add distinct keyword to a query.
 */
_db.prototype.distinct = function () {
    var self = this;
    self.distinctstr = "distinct";
};

/**
 * @function _having
 * @param {object} self - db instance.
 * @param {string|object} param - having fields name or object.
 * @param {string} [value] - having value.
 * @param {string} [type] - default type ","
 * @param {string} [operator] - default operator =
 */
function _having(self, param, value, type, operator) {
    if (operator === undefined) operator = "=";
    if (type === undefined) type = ",";

    function checkVal(val) {
        if (typeof val === "string")
            return "'" + val + "'";
        else
            return val;
    }

    function checkOperator(key) {
        if (key.indexOf(">") > 0 || key.indexOf(">=") > 0 || key.indexOf("<=") > 0 || key.indexOf("!=") > 0 || key.indexOf("=") > 0 || key.indexOf("in") > 0 || key.indexOf("like") > 0)
            return " ";
        else return " " + operator + " ";
    }

    if (typeof param === "object" && value === undefined) {
        self.havingstr = "having ";
        param.forEach(function (element, index) {
            if (self.havingstr !== "having ")
                self.havingstr += type;
            self.havingstr += element["field"] + checkOperator(element["field"]) + checkVal(element["value"]);
        });
    }
    else if (typeof param === "string" && value !== undefined) {
        self.havingstr = "having " + param + checkOperator(param) + checkVal(value);
    }
    self.havingstr += " ";
};

/**
 * @function having - add having.
 * @param {string|object} param - having field name or object.
 * @param {string} [value] - having value.
 */
_db.prototype.having = function (param, value) {
    var self = this;
    _having(self, param, value);
};

/**
 * @function or_having - onyl seperates multiple clauses with or
 * @param {string|object} param - having field name or object.
 * @param {string} [value] - having value.
 */
_db.prototype.or_having = function (param, value) {
    var self = this;
    _having(self, param, value, " or ");
};

/**
 * @function group_by - add group by clauses to a query.
 * @param {string} param - group field name.
 */
_db.prototype.group_by = function (param) {
    var self = this;
    var tmp = "";
    if (typeof param === "array") tmp = param.join();
    else tmp = param;
    self.groupbystr = " group by " + tmp + " ";
};

/**
 * @function order_by - set a order by clause.
 * @param {string} param - fields names.
 * @param {string} [type] - order by sorting type. default asc
 */
_db.prototype.order_by = function (param, type) {
    var self = this;
    if (type === undefined) type = "asc";
    if (typeof param === "string" && type !== undefined) {
        if (self.orderbystr === "")
            self.orderbystr = "order by";
        else
            self.orderbystr += ",";
        self.orderbystr += " " + param + " " + type;
    }
    if (typeof param === "string" && type === undefined) {
        self.orderbystr = "order by " + param + " " + type;
    }
    self.orderbystr += " ";
};

/**
 * @function where - this function create where string in sql
 * @param {string|string[]} param - key param or json object.
 * @param {string} [value] - value optional param.
 */
_db.prototype.where = function (param, value) {
    var self = this;
    _where(self, param, value, "and");
};

/**
 * @function like - add like clauses in sql.
 * @param {string} param - field name
 * @param {string} value - field value.
 * @param {string} type - like clauses type. before, after or both. default both.
 */
_db.prototype.like = function (param, value, type) {
    var self = this;
    if (type === undefined) type = "both";
    if (type === "before") value = "%" + value;
    else if (type === "after") value = value + "%";
    else if (type === "both") value = "%" + value + "%";
    _where(self, param, value, "and", "like");
};

/**
 * @function or_like - add like clauses in sql.
 * @param {string} param - field name
 * @param {string} value - field value.
 * @param {string} type - like clauses type. before, after or both. default both.
 */
_db.prototype.or_like = function (param, value, type) {
    var self = this;
    if (type === undefined) type = "both";
    if (type === "before") value = "%" + value;
    else if (type === "after") value = value + "%";
    else if (type === "both") value = "%" + value + "%";
    _where(self, param, value, "or", "like");
};

/**
 * @function not_like - add not like clauses in sql.
 * @param {string} param - field name
 * @param {string} value - field value.
 * @param {string} type - like clauses type. before, after or both. default both.
 */
_db.prototype.not_like = function (param, value, type) {
    var self = this;
    if (type === undefined) type = "both";
    if (type === "before") value = "%" + value;
    else if (type === "after") value = value + "%";
    else if (type === "both") value = "%" + value + "%";
    _where(self, param, value, "and", "not like");
};

/**
 * @function or_not_like - add not like clauses in sql.
 * @param {string} param - field name
 * @param {string} value - field value.
 * @param {string} type - like clauses type. before, after or both. default both.
 */
_db.prototype.or_not_like = function (param, value, type) {
    var self = this;
    if (type === undefined) type = "both";
    if (type === "before") value = "%" + value;
    else if (type === "after") value = value + "%";
    else if (type === "both") value = "%" + value + "%";
    _where(self, param, value, "or", "not like");
};

/**
 * @function or_where - add or clauses.
 * @param {string|string[]} param - key param or json object.
 * @param {string} [value] - value optional param.
 */
_db.prototype.or_where = function (param, value) {
    var self = this;
    _where(self, param, value, "or");
};

/**
 * @function where_in - add "in" clauses.
 * @param {string} param - in field name.
 * @param {string[]} value - in values. string array.
 */
_db.prototype.where_in = function (param, value) {
    var self = this;
    var tmp = "";
    value.forEach(function (element, index, array) {
        if (tmp !== "") tmp += ",";
        if (typeof element === "string")
            tmp += "'" + element + "'";
        else if (typeof element === "number")
            tmp += element;
    });
    _where(self, param, "(" + tmp + ")", "in");
};

/**
 * @function or_where_in - add "in" clauses.
 * @param {string} param - in field name.
 * @param {string[]} value - in values. string array.
 */
_db.prototype.or_where_in = function (param, value) {
    var self = this;
    var tmp = "";
    value.forEach(function (element, index, array) {
        if (tmp !== "") tmp += ",";
        if (typeof element === "string")
            tmp += "'" + element + "'";
        else if (typeof element === "number")
            tmp += element;
    });
    _where(self, param, "(" + tmp + ")", "or", "in");
};

/**
 * @function where_not_in - add "not in" clauses.
 * @param {string} param - in field name.
 * @param {string[]} value - in values. string array.
 */
_db.prototype.where_not_in = function (param, value) {
    var self = this;
    var tmp = "";
    value.forEach(function (element, index, array) {
        if (tmp !== "") tmp += ",";
        if (typeof element === "string")
            tmp += "'" + element + "'";
        else if (typeof element === "number")
            tmp += element;
    });
    _where(self, param, "(" + tmp + ")", "not in");
};

/**
 * @function or_where_not_in - add "not in" clauses.
 * @param {string} param - in field name.
 * @param {string[]} value - in values. string array.
 */
_db.prototype.or_where_not_in = function (param, value) {
    var self = this;
    var tmp = "";
    value.forEach(function (element, index, array) {
        if (tmp !== "") tmp += ",";
        if (typeof element === "string")
            tmp += "'" + element + "'";
        else if (typeof element === "number")
            tmp += element;
    });
    _where(self, param, "(" + tmp + ")", "or", "not in");
};

/**
 * @function where - this function create where string in sql
 * @private
 * @param {object} self - db class instance.
 * @param {string|string[]} param - key param
 * @param {string} [value] - value optional param.
 * @param {string} [type] - and, or. optional param. default value and.
 * @param {string} [operator] - optional. default value =.
 */
function _where(self, param, value, type, operator) {
    if (operator === undefined) operator = "=";
    if (type === undefined) type = "and";

    function checkWhere() {
        if (self.wherestr !== "where ")
            return " " + type + " ";
        else
            return " ";
    }

    function checkOperator(key) {
        if (key.indexOf(">") > 0 || key.indexOf(">=") > 0 || key.indexOf("<=") > 0 || key.indexOf("!=") > 0 || key.indexOf("=") > 0 || key.indexOf("like") > 0)
            return " ";
        else return " " + operator + " ";
    }

    function checkVal(val) {
        if (typeof val === "string")
            if (operator === "in") return val;
            else
                return "'" + val + "'";
        if (typeof val === "number")
            return val;
    }

    if (self.wherestr === "") self.wherestr = "where ";

    if (typeof param === "object" && value === undefined) {
        var val;
        param.forEach(function (element) {
            val = element["value"];
            self.wherestr += checkWhere() + element["field"] + checkOperator(element["field"]) + checkVal(val);
        });
    }
    else if (typeof param === "string" && value === undefined)
        self.wherestr += param;
    else if (typeof param === "string" && value !== undefined) {
        var val = value;
        self.wherestr += checkWhere() + param + checkOperator(param) + checkVal(val);
    }
};

/**
 * @function get_where - get and where sql.
 * @param {string} tableName - get table name.
 * @param {object} where - where sql. accept only json object.
 * @param {number} [limit] - limit size. optional.
 * @param {number} [offset] - offset position. optional.
 * @param {function} cb - callback have a two params. result and err handling.
 */
_db.prototype.get_where = function (tableName, where, limit, offset, cb) {
    var self = this;
    self.where(where);
    self.get(tableName, limit, offset, cb);
};

/**
 * @function select_max - this function add max aggregate in select string.
 * @param {string} field - max field name.
 * @param {string} [alias] - max field alias name.
 */
_db.prototype.select_max = function (field, alias) {
    var self = this;
    if (alias === undefined) alias = field;
    self.select("MAX(" + field + ") as " + alias);
};

/**
 * @function select_avg - this function add avg aggregate in select string.
 * @param {string} field - field name.
 * @param {string} [alias] - field alias name.
 */
_db.prototype.select_avg = function (field, alias) {
    var self = this;
    if (alias === undefined) alias = field;
    self.select("AVG(" + field + ") as " + alias);
};

/**
 * @function select_sum - this function add sum aggregate in select string.
 * @param {string} field - field name.
 * @param {string} [alias] - field alias name.
 */
_db.prototype.select_sum = function (field, alias) {
    var self = this;
    if (alias === undefined) alias = field;
    self.select("SUM(" + field + ") as " + alias);
};

/**
 * @funtion select_min - this function add min aggregate in select string.
 * @param {string} field
 * @param {string} [alias]
 */
_db.prototype.select_min = function (field, alias) {
    var self = this;
    if (alias === undefined) alias = field;
    self.select("MIN(" + field + ") as " + alias);
};


/**
 * @function join - add sql join in sql string.
 * @param {string} tableName - join table name.
 * @param {string} condition - join on condition
 * @param {string} [joinType] - join type. left, right. default value is join.
 */
_db.prototype.join = function (tableName, condition, joinType) {
    var self = this;
    var tmp = " join ";
    if (joinType === undefined) tmp = " join ";
    else if (joinType.toLowerCase() === "left") tmp = " left join ";
    else if (joinType.toLowerCase() === "right") tmp = " right join ";
    tmp += tableName + " on " + condition;
    if (self.joinstr === " ") self.joinstr = tmp + " ";
    else self.joinstr += " " + tmp + " ";
};

/**
 * @function from - add table name in sql
 * @param tableName - required.
 */
_db.prototype.from = function (tableName) {
    var self = this;
    self.fromstr = tableName;
};

/**
 * @function count_all_results - get query row count.
 * @param {string} [tableName] - count table name.
 * @param {function} cb - callback function. have a two arguments. count and error.
 */
_db.prototype.count_all_results = function (tableName, cb) {
    var self = this;
    self.selectstr = "count(*) as top";
    self.limitstr = "";
    self.distinctstr = "";
    if (typeof tableName !== "function")
        self.fromstr = tableName;
    self.orderbystr = "";
    self.get(function (result, err) {
        if (typeof tableName === "function")
            if (err)
                tableName(0, err);
            else
                tableName(result[0].top, err);
        else if (err)
            cb(0, err);
        else
            cb(result[0].top, err);
    });
};

/**
 * @function count_all - get row count from table name.
 * @param {string} tableName
 * @param {function} cb - have a two arguments. count and error.
 */
_db.prototype.count_all = function (tableName, cb) {
    var self = this;
    clearValues(self);
    self.select("count(*) as top");
    self.get(tableName, function (result, err) {
        if (err)
            cb(0, err);
        else
            cb(result[0].top, err);
    });
};

/**
 * @function limit -
 * @param {number} limit - limit value.
 * @param {number} [offset] - offset position. optional value.
 */
_db.prototype.limit = function (limit, offset) {
    var self = this;
    if (self.driverName === "firebird") {
        if (limit !== undefined)
            self.limitstr = "first " + limit;
        if (limit !== undefined && offset !== undefined)
            self.limitstr += " skip " + offset;
    }
    else
    if (self.driverName === "mysql") {
        if (limit !== undefined  && offset === undefined)
            self.limitstr = " limit " + limit;
        else
        if (limit !== undefined && offset !== undefined)
            self.limitstr = " limit " + offset +","+limit;
        else
        if (offset !== undefined && limit === undefined)
            self.limitstr = " limit 0, "+ offset;
    }
};

/**
 * @function get - get rows from table.
 * @param {string} [tableName] - table name.
 * @param {number} [limit] - limit size. (optional)
 * @param {number} [offset] - offset position. (optional)
 * @param {function} cb - callback have a two params. result and err handling.
 */
_db.prototype.get = function (tableName, limit, offset, cb) {
    var self = this;
    var sql = "";
    if (tableName !== undefined && typeof tableName !== "function") self.fromstr = tableName;

    if ((limit !== undefined && typeof limit !== "function") || (offset!==undefined && typeof offset !== "function"))
        self.limit(limit, offset);
    if (self.driverName === "mysql")
        sql = "select " + " " + self.distinctstr + self.selectstr + " from " + self.fromstr + self.joinstr + self.wherestr + self.groupbystr + self.havingstr + self.orderbystr + self.limitstr;
    else
    if (self.driverName === "firebird")
        sql = "select " + self.limitstr + " " + self.distinctstr + self.selectstr + " from " + self.fromstr + self.joinstr + self.wherestr + self.groupbystr + self.havingstr + self.orderbystr;
    if (self.framework.config['db-debug-mode'])
        self.framework.log("DB-MODULE", sql);
    self.query(sql, undefined, function (result, err) {
        clearValues(self);
        if (typeof limit === "function")
            limit(result, err);
        else if (typeof tableName === "function")
            tableName(result, err);
        else
            cb(result, err);
    });
};

/**
 * @function init - class constructor
 * @constructs
 * @param {object} framework
 */
_db.prototype.init = function (framework) {
    var self = this;
    self.framework = framework;
    self.driverName = framework.config['db-driver'];
    self.options = {
        host: framework.config['db-host'],
        port: framework.config['db-port'],
        database: framework.config['db-database-name'],
        username: framework.config['db-user-name'],
        password: framework.config['db-password']
    };
    if (framework.config['db-driver'] === "firebird") {
        self.driver = require("node-firebird");
    }
    else if (framework.config['db-driver'] === "mysql") {
        self.driver = require("mysql");
    }
};

var db = new _db();

exports.db = db;

exports.install = function (framework) {
    db.init(framework);
};

exports.uninstall = function (framework, options) {
    if (db.database !== undefined) {
        if (framework.config['db-driver'] === "mysql")
            db.database.end();
        else if (framework.config['db-driver'] === "firebird")
            db.database.detach();
    }
}