exports.id = 'pg';
exports.version = '1.01';

var database = require('pg');
var Events = require('events');
var queries = {};

function SqlBuilder(skip, take) {
    this.builder = [];
    this._order = null;
    this._skip = skip >= 0 ? skip : 0;
    this._take = take >= 0 ? take : 0;
    this._set = null;
}

SqlBuilder.prototype.set = function(name, value) {
    var self = this;
    if (!self._set)
        self._set = {};
    self._set[name] = value === '$' ? '$' : value;
    return self;
};

SqlBuilder.prototype.order = function(name, desc) {

    var self = this;
    if (self._order === null)
        self._order = [];

    var lowered = name.toLowerCase();

    if (lowered.lastIndexOf('desc') !== -1 || lowered.lastIndexOf('asc') !== -1) {
        self._order.push(name);
        return self;
    } else if (typeof(desc) === 'boolean')
        desc = desc === true ? 'DESC' : 'ASC';
    else
        desc = 'ASC';

    self._order.push(SqlBuilder.column(name) + ' ' + desc);
    return self;
};

SqlBuilder.prototype.skip = function(value) {
    var self = this;
    self._skip = value;
    return self;
};

SqlBuilder.prototype.limit = function(value) {
    return this.take(value);
};

SqlBuilder.prototype.take = function(value) {
    var self = this;
    self._take = value;
    return self;
};

SqlBuilder.prototype.take = function(value) {
    var self = this;
    self._take = value;
    return self;
};

SqlBuilder.prototype.first = function() {
    var self = this;
    self._skip = 0;
    self._take = 1;
    return self;
};

SqlBuilder.prototype.where = function(name, operator, value) {
    return this.push(name, operator, value);
};

SqlBuilder.prototype.push = function(name, operator, value) {
    var self = this;

    if (value === undefined) {
        value = operator;
        operator = '=';
    } else if (operator === '!=')
        operator = '<>';

    // I expect Agent.$$
    if (typeof(value) === 'function')
        value = '$';

    self.builder.push(SqlBuilder.column(name) + operator + (value === '$' ? '$' : SqlBuilder.escape(value)));
    return self;
};

SqlBuilder.prototype.clear = function() {
    self._take = 0;
    self._skip = 0;
    this._order = null;
    this._set = null;
    this.builder = [];
    return this;
};

SqlBuilder.escape = function(value) {

    if (value === null || value === undefined)
        return 'null';

    var type = typeof(value);

    if (type === 'function') {
        value = value();

        if (value === null || value === undefined)
            return 'null';

        type = typeof(value);
    }

    if (type === 'boolean')
        return value === true ? 'true' : 'false';

    if (type === 'number')
        return value.toString();

    if (type === 'string')
        return pg_escape(value);

    if (value instanceof Array)
        return pg_escape(value.join(','));

    if (value instanceof Date)
        return pg_escape(dateToString(value));

    return pg_escape(value.toString());
};

SqlBuilder.column = function(name) {
    return name;
};

SqlBuilder.prototype.group = function(name, values) {
    var self = this;
    self.builder.push(SqlBuilder.column(name) + ' GROUP BY ' + (values instanceof Array ? values.join(',') : values));
    return self;
};

SqlBuilder.prototype.having = function(condition) {
    var self = this;
    self.builder.push(condition);
    return self;
};

SqlBuilder.prototype.and = function() {
    var self = this;
    if (self.builder.length === 0)
        return self;
    self.builder.push('AND');
    return self;
};

SqlBuilder.prototype.or = function() {
    var self = this;
    if (self.builder.length === 0)
        return self;
    self.builder.push('OR');
    return self;
};

SqlBuilder.prototype.in = function(name, value) {
    var self = this;
    if (!(value instanceof Array))
        return self;
    var values = [];
    for (var i = 0, length = value.length; i < length; i++)
        values.push(SqlBuilder.escape(value[i]));
    self.builder.push(SqlBuilder.column(name) + ' IN (' + values.join(',') + ')');
    return self;
};

SqlBuilder.prototype.like = function(name, value) {
    var self = this;
    self.builder.push(SqlBuilder.column(name) + ' LIKE ' + SqlBuilder.escape(value));
    return self;
};

SqlBuilder.prototype.between = function(name, valueA, valueB) {
    var self = this;
    self.builder.push(SqlBuilder.column(name) + ' BETWEEN ' + valueA + ' AND ' + valueB);
    return self;
};

SqlBuilder.prototype.sql = function(sql) {
    var self = this;
    self.builder.push(sql);
    return self;
};

SqlBuilder.prototype.toString = function(id) {

    var self = this;
    var plus = '';
    var order = '';

    if (self._order)
        order = ' ORDER BY ' + self._order.join(',');

    if (self._skip > 0 && self._take > 0)
        plus = ' LIMIT ' + self._take + ' OFFSET ' + self._skip;
    else if (self._take > 0)
        plus = ' LIMIT ' + self._take;
    else if (self._skip > 0)
        plus = ' OFFSET ' + self._skip;

    if (self.builder.length === 0)
        return order + plus;

    var where = self.builder.join(' ');

    if (id === undefined || id === null)
        id = 0;

    where = where.replace(/\$(?=\s|$)/g, SqlBuilder.escape(id));
    return ' WHERE ' + where + order + plus;
};

function Agent(options) {
    this.options = options;
    this.command = [];
    this.db = null;
    this.done = null;
    this.last = null;
    this.id = null;
    this.isCanceled = false;
    this.index = 0;
    this.isPut = false;
    this.skipCount = 0;
    this.skips = {};
}

Agent.prototype = {
    get $() {
        return new SqlBuilder();
    },
    get $$() {
        var self = this;
        return function() {
            return self.id;
        };
    }
};

Agent.prototype.__proto__ = Object.create(Events.EventEmitter.prototype, {
    constructor: {
        value: Agent,
        enumberable: false
    }
});

Agent.query = function(name, query) {
    queries[name] = query;
    return Agent;
};

Agent.prototype.skip = function(name) {

    var self = this;

    if (!name) {
        self.skipCount++;
        return self;
    }

    self.skips[name] = true;
    return self;
};

Agent.prototype.prepare = function(fn) {
    var self = this;
    self.command.push({ type: 'prepare', fn: fn });
    return self;
};

Agent.prototype.put = function(value) {
    var self = this;
    self.command.push({ type: 'put', params: value, disable: value === undefined || value === null });
    return self;
};

Agent.prototype.lock = function() {
    return this.put(this.$$);
};

Agent.prototype.unlock = function() {
    this.command.push({ 'type': 'unput' });
    return this;
};

Agent.prototype.query = function(name, query, params) {
    return this.push(name, query, params);
};

Agent.prototype.push = function(name, query, params) {
    var self = this;

    if (typeof(query) !== 'string') {
        params = query;
        query = name;
        name = self.index++;
    }

    var is = false;

    if (!params) {
        is = true;
        params = new SqlBuilder();
    }

    if (queries[query])
        query = queries[query];

    self.command.push({ name: name, query: query, params: params, first: isFIRST(query) });
    return is ? params : self;
};

Agent.prototype.validate = function(fn) {
    var self = this;
    if (fn === undefined) {
        fn = function(err, results) {
            if (self.last === null)
                return false;
            var r = results[self.last];
            if (r instanceof Array)
                return r.length > 0;
            return r !== null && r !== undefined;
        };
    }
    self.command.push({ type: 'validate', fn: fn });
    return self;
};

Agent.prototype.cancel = function(fn) {
    return this.validate(fn);
};

Agent.prototype.begin = function() {
    var self = this;
    self.command.push({ type: 'begin' });
    return self;
};

Agent.prototype.end = function() {
    var self = this;
    self.command.push({ type: 'end' });
    return self;
};

Agent.prototype.commit = function() {
    return this.end();
};

function prepareValue(value) {

    if (value === undefined)
        return null;

    var type = typeof(value);

    if (type === 'function')
        value = value();

    if (type === 'string')
        value = value.trim();

    return value;
}

Agent.prototype._insert = function(item) {

    var self = this;
    var name = item.name;
    var values = item.values;
    var table = item.table;

    if (values instanceof SqlBuilder)
        values = values._set;

    var keys = Object.keys(values);

    var columns = [];
    var columns_values = [];
    var params = [];
    var index = 1;

    for (var i = 0, length = keys.length; i < length; i++) {
        var key = keys[i];
        var value = values[key];

        if (item.without && item.without.indexOf(key) !== -1)
            continue;

        if (key[0] === '$')
            continue;

        columns.push(key);

        if (value instanceof Array) {

            var helper = [];

            for (var j = 0, sublength = value.length; j < sublength; j++) {
                helper.push('$' + index++);
                params.push(prepareValue(value[j]));
            }

            columns_values.push('(' + helper.join(',') + ')');

        } else {
            columns_values.push('$' + index++);
            params.push(prepareValue(value));
        }
    }

    return { type: item.type, name: name, query: 'INSERT INTO ' + table + ' (' + columns.join(',') + ') VALUES(' + columns_values.join(',') + ') RETURNING ' + (item.id || 'id'), params: params, first: true };
};

Agent.prototype._update = function(item) {

    var name = item.name;
    var values = item.values;

    if (values instanceof SqlBuilder)
        values = values._set;

    var condition = item.condition;
    var table = item.table;
    var keys = Object.keys(values);

    var columns = [];
    var params = [];
    var index = 1;

    for (var i = 0, length = keys.length; i < length; i++) {
        var key = keys[i];
        var value = values[key];

        if (item.without && item.without.indexOf(key) !== -1)
            continue;

        if (key[0] === '$')
            continue;

        if (value instanceof Array) {

            var helper = [];

            for (var j = 0, sublength = value.length; j < sublength; j++) {
                helper.push('$' + (index++));
                params.push(prepareValue(value[j]));
            }

            columns.push(key + '=(' + helper.join(',') + ')');

        } else {
            columns.push(key + '=$' + (index++));
            params.push(prepareValue(value));
        }
    }

    return { type: item.type, name: name, query: 'UPDATE ' + table + ' SET ' + columns.join(',') + condition.toString(this.id), params: params, first: true };
};

Agent.prototype._select = function(item) {
    return { name: item.name, query: item.query + item.condition.toString(this.id), params: null, first: item.condition._take === 1 };
};

Agent.prototype._delete = function(item) {
    return { name: item.name, query: item.query + item.condition.toString(this.id), params: null, first: true };
};

Agent.prototype.insert = function(name, table, values, id, without) {

    var self = this;

    if (typeof(table) !== 'string') {
        without = id;
        id = values;
        values = table;
        table = name;
        name = self.index++;
    }

    if (id instanceof Array) {
        without = id;
        id = undefined;
    }

    var is = false;
    if (!values) {
        is = true;
        values = new SqlBuilder();
    }

    self.command.push({ type: 'insert', table: table, name: name, id: id || 'id', values: values, without: without });
    return is ? values : self;
};

Agent.prototype.select = function(name, table, schema, without, skip, take) {

    var self = this;
    if (typeof(table) !== 'string') {
        take = skip;
        skip = without;
        without = schema;
        schema = table;
        table = name;
        name = self.index++;
    }

    if (!schema)
        schema = '*';

    var condition = new SqlBuilder(skip, take);
    var columns;

    if (schema instanceof Array) {
        columns = schema;
    } else if (typeof(schema) === 'string') {
        columns = [schema];
    } else {
        var arr = Object.keys(schema);
        for (var i = 0, length = arr.length; i < length; i++) {
            if (without && without.indexOf(arr[i]) !== -1)
                continue;
            if (arr[i][0] === '$')
                continue;
            columns.push(SqlBuilder.column(arr[i]));
        }
    }

    self.command.push({ type: 'select', query: 'SELECT ' + columns.join(',') + ' FROM ' + table, name: name, without: without, condition: condition });
    return condition;
};

Agent.prototype.updateOnly = function(name, table, values, only) {

    var model = {};

    if (values instanceof SqlBuilder)
        values = values._set;

    for (var i = 0, length = only.length; i < length; i++) {
        var key = only[i];
        model[key] = values[i] === undefined ? null : values[i];
    }

    return this.update(name, table, model, null);
};

Agent.prototype.update = function(name, table, values, without) {

    var self = this;

    if (typeof(table) !== 'string') {
        without = values;
        values = table;
        table = name;
        name = self.index++;
    }

    var condition;

    if (values instanceof SqlBuilder)
        condition = values;
    else
        condition = new SqlBuilder();

    if (!values)
        values = condition;

    self.command.push({ type: 'update', table: table, name: name, values: values, without: without, condition: condition });
    return condition;
};

Agent.prototype.delete = function(name, table) {

    var self = this;

    if (typeof(table) !== 'string') {
        table = name;
        name = self.index++;
    }

    var condition = new SqlBuilder();
    self.command.push({ type: 'delete', query: 'DELETE FROM ' + table, name: name, condition: condition });
    return condition;
};

Agent.prototype.remove = function(name, table) {
    return this.delete(name, table);
};

Agent.prototype.destroy = function(name) {
    var self = this;
    for (var i = 0, length = self.command.length; i < length; i++) {
        var item = self.command[i];
        if (item.name !== name)
            continue;
        self.command.splice(i, 1);
        return true;
    }
    return false;
};

Agent.prototype.close = function() {
    var self = this;
    if (self.done)
        self.done();
    self.done = null;
    return self;
};

Agent.prototype._prepare = function(callback) {

    var results = {};
    var errors = new ErrorBuilder();
    var self = this;
    var rollback = false;
    var isTransaction = false;

    self.command.sqlagent(function(item, next) {

        if (item.type === 'validate') {
            var output = item.fn(errors, results);
            if (!output)
                return next(false);
            return next();
        }

        if (item.type === 'prepare') {
            item.fn(errors, results, function() {
                next();
            });
            return;
        }

        if (item.type === 'unlock') {
            self.isPut = false;
            next();
            return;
        }

        if (item.type === 'put') {
            if (item.disable)
                self.id = null;
            else
                self.id = typeof(item.params) === 'function' ? item.params() : item.params;
            self.isPut = !self.disable;
            next();
            return;
        }

        if (self.skipCount > 0) {
            self.skipCount--;
            next();
            return;
        }

        if (typeof(item.name) === 'string') {
            if (self.skips[item.name] === true) {
                next();
                return;
            }
        }

        var current;

        switch (item.type) {
            case 'update':
                current = self._update(item);
                break;
            case 'insert':
                current = self._insert(item);
                break;
            case 'select':
                current = self._select(item);
                break;
            case 'delete':
                current = self._delete(item);
                break;
            default:
                current = item;
                break;
        }

        if (current.params instanceof SqlBuilder) {
            current.query = current.query + current.params.toString(self.id);
            current.params = undefined;
        } else
            current.params = prepare_params(current.params);

        var query = function(err, result) {
            if (err) {
                errors.push(err.message);
                if (isTransaction)
                    rollback = true;
            } else {
                var rows = result.rows;
                if (self.isPut === false && current.type === 'insert')
                    self.id = rows[0][item.id];
                results[current.name] = current.first ? rows instanceof Array ? rows[0] : rows : rows;
                self.emit('data', current.name, results);
            }
            self.last = item.name;
            next();
        };

        if (item.type !== 'begin' && item.type !== 'end') {
            if (!current.first)
                current.first = isFIRST(current.query);
            self.emit('query', current.name, current.query, current.params);
            self.db.query({ text: current.query }, current.params, query);
            return;
        }

        if (item.type === 'begin') {
            self.db.query('BEGIN', function(err) {
                if (err) {
                    errors.push(err.message);
                    self.command = [];
                    next();
                    return;
                }
                isTransaction = true;
                rollback = false;
                next();
            });
            return;
        }

        if (item.type === 'end') {
            isTransaction = false;
            if (rollback) {
                self.db.query('ROLLBACK', function(err) {
                    if (!err)
                        return next();
                    self.command = [];
                    self.push(err.message);
                    next();
                });
                return;
            }

            self.db.query('COMMIT', function(err) {
                if (!err)
                    return next();
                errors.push(err.message);
                self.command = [];
                self.db.query('ROLLBACK', function(err) {
                    if (!err)
                        return next();
                    errors.push(err.message);
                    next();
                });
            });
            return;
        }

    }, function() {
        self.index = 0;
        if (self.done)
            self.done();
        self.done = null;
        var err = errors.hasError() ? errors : null;
        self.emit('end', err, results);
        if (callback)
            callback(err, self.returnIndex !== undefined ? results[self.returnIndex] : results);
    });

    return self;
};

Agent.prototype.exec = function(callback, returnIndex) {

    var self = this;

    if (returnIndex !== undefined && typeof(returnIndex) !== 'boolean')
        self.returnIndex = returnIndex;
    else
        delete self.returnIndex;

    if (self.command.length === 0) {
        if (callback)
            callback.call(self, null, {});
        return self;
    }

    database.connect(self.options, function(err, client, done) {

        if (err) {
            callback.call(self, err, null);
            return;
        }

        self.done = done;
        self.db = client;
        self._prepare(callback);
    });

    return self;
};

Agent.prototype.$$exec = function(returnIndex) {
    var self = this;
    return function(callback) {
        return self.exec(callback, returnIndex);
    }
};

// Author: https://github.com/segmentio/pg-escape
// License: MIT
function pg_escape(val){
    if (val === null)
        return 'NULL';
    var backslash = ~val.indexOf('\\');
    var prefix = backslash ? 'E' : '';
    val = val.replace(/'/g, "''").replace(/\\/g, '\\\\');
    return prefix + "'" + val + "'";
};

function dateToString(dt) {
    var arr = [];
    arr.push(dt.getFullYear().toString());
    arr.push((dt.getMonth() + 1).toString());
    arr.push(dt.getDate().toString());
    arr.push(dt.getHours().toString());
    arr.push(dt.getMinutes().toString());
    arr.push(dt.getSeconds().toString());

    for (var i = 1, length = arr.length; i < length; i++) {
        if (arr[i].length === 1)
            arr[i] = '0' + arr[i];
    }

    return arr[0] + '-' + arr[1] + '-' + arr[2] + ' ' + arr[3] + ':' + arr[4] + ':' + arr[5];
}

function prepare_params(params) {
    if (!params)
        return params;
    for (var i = 0, length = params.length; i < length; i++) {
        var param = params[i];
        if (typeof(param) === 'function')
            params[i] = param(params);
    }
    return params;
}

function isFIRST(query) {
    return query.substring(query.length - 7).toLowerCase() === 'limit 1';
}

if (Array.prototype.sqlagent) {
    Array.prototype.sqlagent = function(onItem, callback) {

        var self = this;
        var item = self.shift();

        if (item === undefined) {
            if (callback)
                callback();
            return self;
        }

        onItem.call(self, item, function(val) {

            if (val === false) {
                self.length = 0;
                if (callback)
                    callback();
                return;
            }

            setImmediate(function() {
                self.sqlagent(onItem, callback);
            });
        });

        return self;
    };
}

exports.create = function(conn) {
    return new Agent(conn);
};

exports.SqlBuilder = SqlBuilder;
exports.Agent = Agent;
exports.query = Agent.query;
exports.init = function(conn) {
    F.database = function() {
        return new Agent(conn);
    };
};