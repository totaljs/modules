# CDN downloader

This module downloads UI components from the Componentator CDN, storing them in the `/public/cdn/` directory.

- components can be used on the relative URL address `/cdn/*.html`

__Client-Side usage:__

```js
DEF.fallback = '/cdn/j-{0}.html';
```

__Good to know__:

- How to release cache? `MODULE('cdn').clear((err, removed) => console.log(err, removed))`