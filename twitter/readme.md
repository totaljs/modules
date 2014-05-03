# Simple Twitter Api

- copy **twitter.js** to __/your-totaljs-website/modules/__

## How to obtain keys?

1. Open <https://apps.twitter.com/app/>
2. Create your application
3. Click to the application

![Twitter API](http://www.totaljs.com/github/module-twitter.png)

## Functions

```javascript
var twitter = framework.module('twitter').create('apiKey', 'apiSecret', 'accessToken', 'accessSecret');

/**
 * Create a request to Twitter
 * @param  {String}   method   HTTP method
 * @param  {String}   url      Url address
 * @param  {Object}   params   Custom parameters
 * @param  {Function} callback Callback ()
 * @param  {String}   redirect Redirect URL address (currently not work)
 */
twitter.request('GET', 'https://api.twitter.com/1.1/search/tweets.json', { q: '#nodejs', count: 4 }, function(err, data) {

    console.log(data);

});
```