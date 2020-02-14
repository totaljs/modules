# Installation

Directory listing. This module uses wildcard routing.

- download and copy `directorylisting.js` into the `/modules/` directory __or create a definition with:__

```javascript
var options = {};

// URL from which should be enabled directory listing:
// Default value:
options.url = '/';

INSTALL('module', 'https://modules.totaljs.com/latest/directorylisting.js', options);
```