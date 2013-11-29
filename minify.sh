ECHO "[COMPILING]"

ECHO "....... authorization.js"
uglifyjs authorization/authorization-debug.js -o authorization/authorization.js
node minify.js authorization/authorization.js

ECHO "....... facebook.js"
uglifyjs facebook/facebook-debug.js -o facebook/facebook.js
node minify.js facebook/facebook.js

ECHO "....... jade.js"
uglifyjs jade/jade-debug.js -o jade/jade.js
node minify.js jade/jade.js

ECHO "....... less.js"
uglifyjs less/less-debug.js -o less/less.js
node minify.js less/less.js

ECHO "....... markdown.js"
uglifyjs markdown/markdown-debug.js -o markdown/markdown.js
node minify.js markdown/markdown.js

ECHO "....... session.js"
uglifyjs session/session-debug.js -o session/session.js
node minify.js session/session.js

ECHO "....... storage.js"
uglifyjs storage/storage-debug.js -o storage/storage.js
node minify.js storage/storage.js