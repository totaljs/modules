# Installation

This is a simple __HelpDesk__ mini application.

- you and your customer can create unlimited count of issues (NoSQL embedded limit)
- __admin mode__ is enabled when you perform a double-click on the `bug` icon

---

- download and copy `helpdesk.package` into the `/packages/` directory __or create a definition with:__

```javascript
var options = {};

// ====================================
// COMMON (OPTIONAL)
// ====================================

// options.url = '/$helpdesk/';

// ====================================
// Security (OPTIONAL)
// ====================================

// options.auth = ['admin:admin', 'name:password'];
// options.auth = true; // HelpDesk uses "authorize" flag
// options.restrictions = ['127.0.0.1', '138.201', '172.31.33'];

// ====================================
// Email notifications (OPTIONAL)
// ====================================

// options.customer = 'EMAIL ADDRESS';
// options.support = 'EMAIL ADDRESS';

INSTALL('package', 'https://cdn.totaljs.com/2017xc9db052e/helpdesk.package', options);

// OR UpToDate mechanism:
UPTODATE('package', 'https://cdn.totaljs.com/2017xc9db052e/helpdesk.package', options, '1 week');
```