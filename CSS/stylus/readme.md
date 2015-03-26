# Stylus module

- install npm stylus
- copy **stylus.js** to __/your-totaljs-website/modules/__

All files with .CSS and .STYL extension will compiled via stylus. In release mode will compiled files cached in temporary directory.

## Views

Example:

@{stylus('default.styl')}

or

@{css('default.css')}


## IMPORTANT

This module does not support compiling of dynamic CSS - supports only compiling of files.
