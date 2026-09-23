# Actions to MCP

- download and copy `mcp.js` into the `/modules/` directory __or create a definition with:__
- MCP endpoint `POST /mcp/`
- requirements: Total.js `v5`

```javascript
INSTALL('mcp', 'https://cdn.totaljs.com/modules/mcp.js');
```

__Usage__:

```javascript
NEWACTION('ActionName', {
	mcp: true, // IMPORTANT
	input: '*name',
	action: function($) {
		$.success();
	}
});
```

## Global functionality

- `CONF.mcp_token {String}` - a value to compare with the authorization header
- `MAIN.mcp {Object}` - contains internal MCP data
- `MAIN.mcp.token {String}` - an alternative to `CONF.mcp_token`
- `MAIN.mcp.refresh() {Function}` - reloads all actions with `mcp: true`