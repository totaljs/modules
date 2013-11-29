# Markdown parser

- __partial.js version +v1.3.0__
- copy **markdown.js** to __/your-partialjs-website/modules/__

## Using

```js

var markdown = framework.module('markdown').init();

// or

var markdown = controller.module('markdown').init();

// Look up to delegates
// ...
// ...
// ...
// ...

var output = markdown.load(text, [id]);

console.log(output);

```

### markdown.onBreak(type)

```js
markdown.onBreak = function(type) {

	switch (type) {
		case '\n':
			return '<br />';
		case '***':
		case '---':
			return '<hr />';
	}

	return '';
};
```

### markdown.onEmbedded(type, lines)

Markdown:

```
TEXT TEXT TEXT TEXT TEXT TEXT TEXT TEXT TEXT TEXT TEXT TEXT TEXT TEXT TEXT
TEXT TEXT TEXT TEXT TEXT TEXT TEXT TEXT TEXT TEXT TEXT TEXT TEXT TEXT TEXT
TEXT TEXT TEXT TEXT TEXT TEXT TEXT TEXT TEXT TEXT TEXT TEXT TEXT TEXT TEXT

=== javascript
alert('1');
alert('2');
alert('3');
===

TEXT TEXT TEXT TEXT TEXT TEXT TEXT TEXT TEXT TEXT TEXT TEXT TEXT TEXT TEXT
TEXT TEXT TEXT TEXT TEXT TEXT TEXT TEXT TEXT TEXT TEXT TEXT TEXT TEXT TEXT
TEXT TEXT TEXT TEXT TEXT TEXT TEXT TEXT TEXT TEXT TEXT TEXT TEXT TEXT TEXT
```

Parsing:

```js
markdown.onEmbedded = function(type, lines) {

	switch (type) {
		case 'javascript':
			return '<script type="text/javascript">' + lines.join('\n') + '</script>';
		case 'html':
			return lines.join('\n');
	}

	return '';
};
```

### markdown.onFormat(type, value)

Markdown:

```
TEXT TEXT TEXT *ITALIC* TEXT TEXT TEXT TEXT _BOLD_ TEXT TEXT TEXT TEXT TEXT TEXT
TEXT TEXT TEXT TEXT TEXT TEXT __STRONG__ TEXT TEXT TEXT TEXT TEXT TEXT TEXT TEXT
TEXT TEXT TEXT TEXT TEXT TEXT TEXT TEXT TEXT TEXT TEXT TEXT **EM** TEXT TEXT
```

Parsing:

```js
markdown.onFormat = function(type, value) {

	switch (type) {
		case '*':
			return '<i>' + value + '</i>';
		case '**':
			return '<em>' + value + '</em>';
		case '_':
			return '<b>' + value + '</b>';
		case '__':
			return '<strong>' + value + '</strong>';
	}

	return '';
};
```

### markdown.onImage(alt, src, [width], [height], [url])

```
TEXT TEXT TEXT ![Image description](http://www.partialjs.com/upload/logo-black.png#309x94) TEXT TEXT
TEXT TEXT TEXT TEXT TEXT TEXT __STRONG__ TEXT TEXT TEXT TEXT TEXT TEXT TEXT TEXT
TEXT [![Image description](http://www.partialjs.com/upload/logo-black.png)](http://www.partialjs.com)
```

Parsing:

```js
markdown.onImage = function(alt, src, width, height, url) {
    var tag = '<img src="' + src + '"' + (width ? ' width="' + width + '"' : '') + (height ? ' height="' + height + '"' : '') + ' alt="' + alt +'" border="0" />';

    if (url)
        return '<a href="' + url + '">' + tag + '</a>';

    return tag;
};
```

### markdown.onKeyValue(items)

Markdown:

```
NAME     : VALUE
NAME     : VALUE
NAME     : VALUE
```

Parsing:

```js
markdown.onKeyValue = function(items) {
    var length = items.length;
    var output = '';

    for (var i = 0; i < length; i++) {
        var item = items[i];
        output += '<dt>' + item.key + '</dt><dd>' + item.value + '</dd>';
    }

    return '<dl>' + output + '</dl>';
};
```

### markdown.onKeyword(type, value)

Markdown:

```
TEXT TEXT TEXT [KEYWORD] TEXT TEXT TEXT TEXT TEXT TEXT TEXT TEXT TEXT
TEXT TEXT TEXT TEXT TEXT TEXT TEXT {KEYWORD} TEXT TEXT TEXT TEXT TEXT
```

Parsing:

```js
markdown.onKeyword = function(type, value) {
	switch (name) {
		case '{}':
		case '[]':
			return '<span>' + value + '</span>';
	}
	return '';
};
```

### markdown.onLine(line)

Markdown:

```
TEXT TEXT TEXT TEXT TEXT TEXT TEXT TEXT TEXT TEXT TEXT TEXT TEXT
TEXT TEXT TEXT TEXT TEXT TEXT TEXT TEXT TEXT TEXT TEXT TEXT TEXT
```

Parsing:

```js
markdown.onLine = function(value) {
	return '<p>' + value + '</p>';
};
```

### markdown.onLink(text, url)

Markdown:

```
TEXT TEXT TEXT [partial.js](http://www.partialjs.com) TEXT TEXT TEXT TEXT TEXT
TEXT TEXT TEXT www.github.com TEXT TEXT TEXT TEXT TEXT TEXT <www.google.com> TEXT TEXT
```

Parsing:

```js
markdown.onLink = function(text, url) {
    if (url.substring(0, 7) !== 'http://' && url.substring(0, 8) !== 'https://')
        url = 'http://' + url;

    return '<a href="' + url + '">' + text + '</a>';
};
```

### markdown.onList(type, lines)

   
Markdown:

```
- li item
- li item
- li item
- li item
- li item

+ li item
+ li item
+ li item
+ li item
+ li item

x li item
x li item
x li item
x li item
x li item
```

Parsing:

```js
markdown.onList = function(items) {
    var length = items.length;
    var output = '';

    for (var i = 0; i < length; i++) {
        var item = items[i];

        // if (item.type === '+')

        output += '<li>' + item.value + '</li>';
    }

    return '<ul>' + output + '</ul>';
};
```

### markdown.onParagraph(type, lines)

Markdown:

```
// Paragraph line 1
// Paragraph line 2
// Paragraph line 3

| Paragraph line 1
| Paragraph line 2
| Paragraph line 3

> Paragraph line 1
> Paragraph line 2
> Paragraph line 3
```

Parsing:

```js
markdown.onParagraph = function(type, lines) {

	switch (type) {
		case '//':
		case '>':
		case '|':
			return '<p>' + lines.join('<br />') + '</p>';
	}

	return '';
};
```

### markdown.onTitle(type, value)

Markdown:

```
H1
==

H2
--

# H1

## H2

### H3

#### H4

##### H5
```

Parsing:

```js
markdown.onParagraph = function(type, lines) {
	switch (type) {
	    case '#':
	        return '<h1>' + text + '</h1>'
	    case '##':
	        return '<h2>' + text + '</h2>'
	    case '###':
	        return '<h3>' + text + '</h3>'
	    case '####':
	        return '<h4>' + text + '</h4>'
	    case '#####':
	        return '<h5>' + text + '</h5>'
	}
	return '';
};
```