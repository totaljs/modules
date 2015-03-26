# Stylus module

- install `$ npm install stylus`
- copy **stylus.js** to __/your-totaljs-website/modules/__

All files with .CSS and .STYL extension will compiled via stylus. In release mode will compiled files cached in temporary directory.

## Views

Example:

```javascript
@{stylus('default.styl')}
```

or

```javascript
@{css('default.css')}
```

or by style tag in view

```javascript
<style>
    h1
        color: blue
        &:hover
            color: red
</style>
```
## IMPORTANT

This module does not support compiling of dynamic CSS - supports only compiling of files.
