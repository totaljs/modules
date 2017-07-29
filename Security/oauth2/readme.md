# Login with Facebook, Google, LinkedIn, Yahoo, GitHub, DropBox, Live, Instagram, Yandex, VKontakte

- For testing use: [NGROK - proxy tunnel](https://ngrok.com/)
example)
- download and copy `oauth2.js` into the `/modules/` directory __or create a definition with:__

```javascript
INSTALL('module', 'https://cnd.totaljs.com/oauth2.js');
```

```javascript
exports.install = function() {
    F.route('/login/github/', oauth_login, ['unauthorize']);
    F.route('/login/github/callback/', oauth_login_callback, ['unauthorize']);
    F.route('/login/facebook/', oauth_login, ['unauthorize']);
    F.route('/login/facebook/callback/', oauth_login_callback, ['unauthorize']);
    F.route('/login/dropbox/', oauth_login, ['unauthorize']);
    F.route('/login/dropbox/callback/', oauth_login_callback, ['unauthorize']);
    F.route('/login/linkedin/', oauth_login, ['unauthorize']);
    F.route('/login/linkedin/callback/', oauth_login_callback, ['unauthorize']);
    F.route('/login/google/', oauth_login, ['unauthorize']);
    F.route('/login/google/callback/', oauth_login_callback, ['unauthorize']);
    F.route('/login/yahoo/', oauth_login, ['unauthorize']);
    F.route('/login/yahoo/callback/', oauth_login_callback, ['unauthorize']);
    F.route('/login/live/', oauth_login, ['unauthorize']);
    F.route('/login/live/callback/', oauth_login_callback, ['unauthorize']);
    F.route('/login/instagram/', oauth_login, ['unauthorize']);
    F.route('/login/instagram/callback/', oauth_login_callback, ['unauthorize']);
}

// Controller action
function oauth_login() {
    var self = this;
    var type = self.req.path[1];
    
    // config:
    // oauth2.google.key =
    // oauth2.google.secret =
    // oauth2.github.key =
    // oauth2.github.secret =
    // ...

    MODULE('oauth2').redirect(type, CONFIG('oauth2.' + type + '.key'), self.host('/login/' + type + '/callback/'), self);
}

// Controller action
function oauth_login_callback() {
    var self = this;
    var type = self.req.path[1];
    var url = self.host('/login/' + type + '/callback/');

    // config:
    // oauth2.google.key =
    // oauth2.google.secret =
    // oauth2.github.key =
    // oauth2.github.secret =
    // ...

    MODULE('oauth2').callback(type, CONFIG('oauth2.' + type + '.key'), CONFIG('oauth2.' + type + '.secret'), url, self, function(err, profile, access_token) {
        console.log(profile);
        self.json(SUCCESS(true));
    });
}
```

## Register you application

- Facebook - <https://developers.facebook.com/apps/>
- Google - <https://console.developers.google.com>
- Yahoo - <https://developer.yahoo.com>
- LinkedIn - <https://www.linkedin.com/secure/developer>
- DropBox - <https://www.dropbox.com/developers/apps>
- GitHub - <https://github.com/settings/applications>
- Live - <https://account.live.com/developers/applications/>
- Instagram - <https://instagram.com/developer/>
- Yandex - <https://oauth.yandex.com>
- VKontakte - <http://vk.com/apps?act=manage>

## CALLBACK

### GOOGLE

```javascript
{ kind: 'plus#person',
  etag: '"RqKWnRU4WW46-6W3rWhLR9iFZQM/EJnOkqg0s0pcrrs0iKvN73LvCnk"',
  occupation: 'Web developer & Web designer',
  gender: 'male',
  emails: [ { value: 'a@a.com', type: 'account' } ],
  urls: 
   [ { value: 'http://www.facebook.com/PeterSirka',
       type: 'otherProfile',
       label: 'petersirka' },
     { value: 'http://twitter.com/petersirka',
       type: 'otherProfile',
       label: 'petersirka' },
     { value: 'http://www.youtube.com/user/petersirka',
       type: 'otherProfile',
       label: 'http://www.youtube.com/user/petersirka' },
     { value: 'https://profiles.google.com/117275945491270172609/buzz',
       type: 'contributor',
       label: 'Buzz' } ],
  objectType: 'person',
  id: '00000000000',
  displayName: 'Peter Širka',
  name: { familyName: 'Širka', givenName: 'Peter' },
  url: 'https://plus.google.com/+PeterŠirka',
  image: 
   { url: 'https://lh6.googleusercontent.com/-qJtxCwBkVcg/AAAAAAAAAAI/AAAAAAAAAeY/Mn8ABMy5BJE/photo.jpg?sz=50',
     isDefault: false },
  organizations: 
   [ { name: 'Datalan',
       title: '.NET Developer',
       type: 'work',
       startDate: '2014',
       primary: true },
     { name: '858project.com',
       title: 'Web developer & Web designer',
       type: 'work',
       startDate: '2014',
       endDate: '2014',
       primary: false },
     { name: 'Web Site Design s.r.o.',
       title: 'Web developer & Web designer',
       type: 'work',
       startDate: '2006',
       endDate: '2013',
       primary: false } ],
  isPlusUser: true,
  language: 'sk',
  circledByCount: 312,
  verified: false,
  cover: 
   { layout: 'banner',
     coverPhoto: 
      { url: 'https://lh6.googleusercontent.com/-CXhru8AWMjc/VEF47IlEwaI/AAAAAAAAA6U/dGRkNNYNDmI/s630-fcrop64=1,52770000ff78ffff/google.png',
        height: 357,
        width: 940 },
     coverInfo: { topImageOffset: 0, leftImageOffset: 0 } } }
```

### LinkedIn

```javascript
{ emailAddress: 'a@a.com',
  firstName: 'Peter',
  headline: 'Web Developer (node.js, total.js, ASP.NET MVC)',
  id: 'XXXXXX',
  lastName: 'Širka',
  location: { country: { code: 'sk' }, name: 'Slovak Republic' },
  pictureUrl: 'https://media.licdn.com/mpr/mprx/0_2weeFgZ6XEbFwdjBC7UBF0HLkDrQWEjBafycF0VJUHXBnaoc8SZkWxmcE_KZoSpUDeEnHZXfWjW8',
  publicProfileUrl: 'https://www.linkedin.com/pub/peter-%C5%A1irka/64/973/227' }
```

### Dropbox

```javascript
{ referral_link: 'https://db.tt/8u4PMvgb',
  display_name: 'Peter Širka',
  uid: 000000,
  locale: 'en',
  email_verified: true,
  team: null,
  quota_info: 
   { datastores: 0,
     shared: 0,
     quota: 000,
     normal: 000 },
  is_paired: false,
  country: 'SK',
  name_details: { familiar_name: 'Peter', surname: 'Širka', given_name: 'Peter' },
  email: 'a@a.com' }
```

# GitHub

```javascript
{ login: 'petersirka',
  id: 000,
  avatar_url: 'https://avatars.githubusercontent.com/u/2414252?v=3',
  gravatar_id: '',
  url: 'https://api.github.com/users/petersirka',
  html_url: 'https://github.com/petersirka',
  followers_url: 'https://api.github.com/users/petersirka/followers',
  following_url: 'https://api.github.com/users/petersirka/following{/other_user}',
  gists_url: 'https://api.github.com/users/petersirka/gists{/gist_id}',
  starred_url: 'https://api.github.com/users/petersirka/starred{/owner}{/repo}',
  subscriptions_url: 'https://api.github.com/users/petersirka/subscriptions',
  organizations_url: 'https://api.github.com/users/petersirka/orgs',
  repos_url: 'https://api.github.com/users/petersirka/repos',
  events_url: 'https://api.github.com/users/petersirka/events{/privacy}',
  received_events_url: 'https://api.github.com/users/petersirka/received_events',
  type: 'User',
  site_admin: false,
  name: 'Peter Širka',
  company: 'Datalan',
  blog: 'https://bufferwall.com/blogs/?user=peter-sirka',
  location: 'Slovakia (EU), Bratislava',
  email: 'a@a.com',
  hireable: false,
  bio: null,
  public_repos: 29,
  public_gists: 2,
  followers: 121,
  following: 1,
  created_at: '2012-09-24T19:04:19Z',
  updated_at: '2015-03-02T11:06:56Z' }
```

### Facebook

```javascript
{ id: '000',
  birthday: '11/06/1984',
  email: 'a@a.com',
  first_name: 'Peter',
  gender: 'male',
  hometown: { id: '000', name: 'Banská Bystrica, Slovakia' },
  last_name: 'Širka',
  link: 'https://www.facebook.com/000/',
  locale: 'sk_SK',
  name: 'Peter Širka',
  timezone: 1,
  updated_time: '2014-09-15T16:24:13+0000',
  verified: true,
  picture: 'https://graph.facebook.com/000/picture' }
```

### Yahoo

```javascript
{ profile: 
   { guid: 'XXXX',
     ageCategory: 'A',
     created: '2015-03-03T08:21:27Z',
     image: 
      { height: 192,
        imageUrl: 'https://s.yimg.com/dh/ap/social/profile/profile_b192.png',
        size: '192x192',
        width: 192 },
     intl: 'us',
     jurisdiction: 'us',
     lang: 'en-US',
     memberSince: '2015-03-03T07:30:44Z',
     migrationSource: 1,
     nickname: 'Peter',
     notStored: true,
     nux: '0',
     profileMode: 'PUBLIC',
     profileStatus: 'ACTIVE',
     profileUrl: 'http://profile.yahoo.com/5S5G4LKFZJECMAI2IHVD5UTUII',
     isConnected: false,
     profileHidden: false,
     bdRestricted: true,
     profilePermission: 'PRIVATE',
     uri: 'https://social.yahooapis.com/v1/user/5S5G4LKFZJECMAI2IHVD5UTUII/profile',
     cache: true } }
```

### Live

```javascript
{ id: 'XXX',
  name: 'Peter Širka',
  first_name: 'Peter',
  last_name: 'Širka',
  link: 'https://profile.live.com/',
  birth_day: 6,
  birth_month: 11,
  birth_year: 1984,
  gender: null,
  emails: 
   { preferred: 'a@a.com',
     account: 'a@a.com',
     personal: 'a@a.com',
     business: null },
  locale: 'sk_SK',
  updated_time: '2015-03-03T08:38:47+0000' }
```

### Instagram

The response from Instagram __doesn't contain email__!!!

```javascript
{ username: 'petersirka',
  bio: '',
  website: '',
  profile_picture: 'https://instagramimages-a.akamaihd.net/profiles/anonymousUser.jpg',
  full_name: 'Peter Širka',
  id: '1635329562' }
```

### Yandex

You must allow user account information in __Yandex.Passport API__ scope.

```javascript
{ first_name: 'Peter',
  last_name: 'Širka',
  display_name: 'petersirka',
  emails: [ 'petersirka@.....' ],
  default_email: 'petersirka@.....',
  real_name: 'Peter Širka',
  birthday: null,
  default_avatar_id: '0/0-0',
  login: 'petersirka',
  sex: null,
  id: '......' }
```

### VKontakte - VK.com

VK doesn't send back email address and the scope contains requirement for the email address.

```javascript
{ uid: 00000,
  first_name: 'Peter',
  last_name: 'Širka',
  nickname: '',
  screen_name: '....',
  photo_big: 'http://vk.com/images/camera_200.png' }
```
