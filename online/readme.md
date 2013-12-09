# Online counter

> partial.js analytic tool :-) for counting of visitors without using of client-side script and registration.

- __partial.js version +v1.3.0__
- copy **online.js** to __/your-partialjs-website/modules/__
- the module counts requests into the controller
- this module counts online users (according the cookies)
- reads statistics for the period (daily, monthly, yearly)
- easy use in views
- module stores data into the database directory as plain text
- module is resists at the restart app
- __IMPORTANT:__ this module does not work with the cluster
- auto-read _utm_medium_ param for adverts
- robots (according the user-agent string) are skipped
- [__DEMO__ on www.partialjs.com](http://www.partialjs.com/stats/)

## Using

```js
var online = framework.module('online');

// or

var online = controller.module('online');
```

## What are statistics from the module?

```js
var online = framework.module('online');

online.on('change', function(count) {
    console.log('online:', count);
});

// or

console.log(online.online);

// EXAMPLE:
online.daily(function(arr) {
    arr.forEach(function(stats) {
        stats.hits;       // page hits per day (impressions)
        stats.unique;     // unique users per day
        stats.count;      // users count per day
        stats.search;     // search traffic (according the referer header or utm_medium param) per day
        stats.social;     // social network traffic (according the referer header or utm_medium param) per day
        stats.direct;     // direct traffic per day
        stats.advert;	  // advert traffict per day
        stats.unknown;    // other traffic per day
        stats.mobile;     // mobile devices per day (unique)
        stats.desktop;    // desktops per day (unique)
    });
});
```

## Properties

### online.online

> Count of online users.

```js
var online = framework.module('online');
console.log(online.online);
```

```html
Online: <b>@{online}</b>
```

### online.today

> Today statistisc.

```js
var online = framework.module('online');
var today = online.today;

today.hits;       // page hits per day (impressions)
today.unique;     // unique users per day
today.count;      // users count per day
today.search;     // search traffic (according the referer header or utm_medium param) per day
today.social;     // social network traffic (according the referer header or utm_medium param) per day
today.direct;     // direct traffic per day
today.advert;     // advert traffic per day
today.unknown;    // other traffic per day
today.mobile;     // mobile devices per day (unique)
today.desktop;    // desktops per day (unique)
today.last;       // a last visit date
```

### online.allowXHR

> Allow XHR requests for stats. Default: __true__.

```js
var online = framework.module('online');

online.allowXHR = false;
```

### online.allowIP

> Allow IP storing of online visitors for GEO IP. Default: __false__.

```js
var online = framework.module('online');

online.allowIP = false;
```

### online.ip

> Online IP collections.

```js
var online = framework.module('online');

console.log(online.ip);
```

### online.social

> Collection of social networks for stats.

```js
var online = framework.module('online');

// default: ['plus.google', 'twitter', 'facebook', 'linkedin', 'tumblr', 'flickr', 'instagram']
online.social.push('stackoverflow');
```

### online.search

> Collection of search engines for stats.

```js
var online = framework.module('online');

// default: ['google', 'bing', 'yahoo']
online.search.push('seznam');
```

## Methods

### online.daily(callback)

> Daily stats.

```js
var online = framework.module('online');

online.daily(function(stats) {

	// collection of stats
	console.log(stats);

});

```

### online.monthly(callback)

> Monthly stats.

```js
online.monthly(function(stats) {

	// object of stats
	// Object.keys(stats);
	console.log(stats);

});
```

### online.yearly(callback)

> Yearly stats.

```js
online.yearly(function(stats) {

	// object of stats
	// Object.keys(stats);
	console.log(stats);

});
```

## Delegates

### online.onValid(req);

> Validation of request. If return false then is request skipped. This delegate must return Boolean.

```js
var online = framework.module('online');

// default settings
online.onValid = function(req) {
	return true;
};
```

### online.isAdvert(req);

> Is click from an advert? This delegate must return Boolean.

```js
var online = framework.module('online');

online.isAdvert = function(req) {
    // default
	return (req.headers['utm_medium'] || '').length > 0;
};
```

## Events

### online.on('online')

> New online user.

```js
var online = framework.module('online');

online.on('online', function(req) {

});
```

### online.on('change')

> Online count is changed.

```js
online.on('change', function(count, ip) {
	// count === online visitors
	// ip    === online IP and URL collections (if allowIP is true (default: false))

    var first = ip[0];
    if (!first)
        return;

    console.log(first.ip);
    console.log(first.url);

});
```
