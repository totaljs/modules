//author:  Serkan KOCAMAN - http://www.github.com/KiPSOFT

exports.name = 'db';
exports.version = '1.00';

/***
 * db class.
 * @class
 * @private
 */
function _db() {
    this.driver = null;
    this.options = {};
    this.driverName = null;
    this.database = null;
    this.selectstr = "*";
    this.wherestr = "";
    this.fromstr = "";
    this.joinstr = " ";
    this.groupbystr = "";
}

/***
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
};

/***
 * @function query - this function execute sql on database
 * @param {string} sql
 * @param {string|[]} params
 * @param {function} cb - callback have two params. result and err.
 */
_db.prototype.query = function (sql, params, cb) {
    var self = this;
    if (self.driverName === "firebird") {
        console.log(sql);
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
};

/***
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

_db.prototype.group_by = function(param) {
    var self = this;
    var tmp = "";
    if (typeof param === "array") tmp = param.join();
    else tmp = param;
    self.groupbystr = " group by "+tmp;
};


/***
 * @function where - this function create where string in sql
 * @param {string|[]} param - key param or json object.
 * @param {string} [value] - value optional param.
 */
_db.prototype.where = function (param, value) {
    var self = this;
    _where(self, param, value, "and");
};

/***
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

/***
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

/***
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

/***
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

/***
 * @function or_where - add or clauses.
 * @param {string|[]} param - key param or json object.
 * @param {string} [value] - value optional param.
 */
_db.prototype.or_where = function (param, value) {
    var self = this;
    _where(self, param, value, "or");
};

/***
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

/***
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

/***
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

/***
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

/***
 * @function where - this function create where string in sql
 * @private
 * @param {object} self - db class instance.
 * @param {string|[]} param - key param
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
        if (key.indexOf(">") > 0 || key.indexOf(">=") > 0 || key.indexOf("<=") > 0 || key.indexOf("!=") > 0 || key.indexOf("=") > 0 || key.indexOf("in") > 0 || key.indexOf("like") > 0)
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
        for (var key in param) {
            var val = param[key];
            self.wherestr += checkWhere() + checkOperator(key) + operator + checkVal(val);
        }
    }
    else if (typeof param === "string" && value === undefined)
        self.wherestr += param;
    else if (typeof param === "string" && value !== undefined) {
        var val = value;
        self.wherestr += checkWhere() + param + checkOperator(param) + checkVal(val);
    }
};

/***
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

/***
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

/***
 * @funtion select_min - this function add min aggregate in select string.
 * @param {string} field
 * @param {string} [alias]
 */
_db.prototype.select_min = function (field, alias) {
    var self = this;
    if (alias === undefined) alias = field;
    self.select("MIN(" + field + ") as " + alias);
};


/***
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

/***
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
    if (self.driverName === "firebird") {
        if (limit !== undefined && offset !== undefined)
            sql = "select first " + limit + " skip " + offset + " " + self.selectstr + " from " + self.fromstr + self.joinstr + self.wherestr + self.groupbystr;
        else
            sql = "select " + self.selectstr + " from " + self.fromstr + self.joinstr + self.wherestr + self.groupbystr;
        self.query(sql, undefined, function (result, err) {
            if (typeof limit === "function")
                limit(result, err);
            if (typeof tableName === "function")
                tableName(result, err);
            else
                cb(result, err);
        });
    }
};

/***
 * @function init - class constructor
 * @constructs
 * @param {object} framework
 */
_db.prototype.init = function (framework) {
    var self = this;
    self.framework = framework;
    self.driverName = framework.config['db-driver'];
    if (framework.config['db-driver'] === "firebird") {
        self.driver = require("node-firebird");
        self.options = {
            host: framework.config['db-host'],
            port: framework.config['db-port'],
            database: framework.config['db-database-name'],
            username: framework.config['db-user-name'],
            password: framework.config['db-password']
        };
    }
};

var db = new _db();

exports.db = db;

exports.install = function (framework) {
    db.init(framework);
};

exports.uninstall = function (framework, options) {
    if (db.database !== undefined) {
        db.database.detach();
    }
}