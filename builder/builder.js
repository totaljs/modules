exports.install = function() {
	if (DEBUG) {
		ROUTE('GET /_build/', function() {
			this.file('~' + PATH.builds('app.build'), null, { 'content-type': 'application/json' });
		});
		ROUTE('POST /_build/', function() {
			require('fs').writeFile(PATH.builds('app.build'), this.body, this.done());
		}, ['raw'], 1024);
		ROUTE('GET /builder/', function() {
			this.proxy('https://cdn.totaljs.com/appbuilder.html');
		});
	}
};