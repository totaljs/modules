# LESS CSS module

- install npm less
- copy **less.js** to __/your-totaljs-website/modules/__

All files with .CSS and .LESS extension will compiled via LESS. In release mode will compiled files cached in temporary directory.

## Views

Example:

@{less('default.less')}

or

@{css('default.css')}


## IMPORTANT

This module does not support compiling of dynamic CSS - supports only compiling of files.
