exports.install = function() {
	var url = CONF.monitor_url || '/$monitor/';
	ROUTE('GET ' + url, send);
};

function send($) {

	if (!F.is5)
		$ = this;

	F.Fs.readFile(process.mainModule.filename + '.json', 'utf8', function(err, response) {
		var json = response ? response : 'null';
		if (F.is5)
			$.jsonstring(json);
		else
			$.content(json, 'text/json');
	});
}