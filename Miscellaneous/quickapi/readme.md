# Installation

__QuickAPI__ is a simple tool for showing internal API.

- this module reads informations from routes
- supports schemas
- you can add a route description into the route flags as `F.route('/api/something/', action, ['post', '// description']`

---

- download and copy `quickapi.package` into the `/packages/` directory __or create a definition with:__

```javascript
var options = {};

// ====================================
// COMMON (OPTIONAL)
// ====================================

// options.url = '/docs/';
// options.description = 'A simple description of QuickAPI.';

// ====================================
// CONTROLLERS (OPTIONAL)
// ====================================

// options.controllers = { api: true, manager: true };

INSTALL('package', 'https://cdn.totaljs.com/2017xc9db052e/quickapi.package', options);

// OR UpToDate mechanism:
UPTODATE('package', 'https://cdn.totaljs.com/2017xc9db052e/quickapi.package', options, '1 week');
```