// Total.js Module: QueryBuilder API
// Author: Peter Širka / Total.js
// Readme: https://github.com/totaljs/modules/tree/master/querybuilderapi
// License: MIT

// CONF.querybuilderapi {String}
// CONF.querybuilderapitoken {String}

exports.install = function() {

	ROUTE('POST {0}  *QueryBuilderAPI --> exec'.format(CONF.querybuilderapi || '/db/'));

};

NEWSCHEMA('QueryBuilderAPI', function(schema) {

	schema.define('filter', '[Object]');
	schema.define('table', String);
	schema.define('exec', ['find', 'list', 'check', 'read', 'count', 'insert', 'update', 'remove', 'query', 'truncate', 'command'], true);
	schema.define('query', String);
	schema.define('fields', '[String]');
	schema.define('returning', '[String]');
	schema.define('sort', '[String]');
	schema.define('skip', Number);
	schema.define('take', Number);
	schema.define('payload', Object);
	schema.define('upsert', Boolean);

	schema.action('exec', {
		name: 'Exec QueryBuilder',
		action: function($, model) {

			if (BLOCKED($, 10)) {
				$.invalid(401);
				return;
			}

			if ($.query.token !== CONF.querybuilderapitoken) {
				$.invalid(401);
				return;
			}

			BLOCKED($, -1);

			if (!model.returning.length)
				model.returning = null;

			DATA.load(model).callback(function(err, response) {
				if (err)
					$.invalid(err);
				else
					$.callback(response == undefined ? null : response);
			});
		}
	});

});