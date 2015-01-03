# Simple translation support for views

- copy **translation.js** to __/your-totaljs-website/modules/__
- create **translation.cache** file with JSON containing translations in __/your-totaljs-website/databases/__
- translations can be chained and dynamic translations made

# Example of translation.cache file

```js
{"en":{"default":{"great_someone":"@@{great} @{name}","great":"Hello","name":"Martin"}}}
```

# Example of usage in template

```js
@{translate('great')}

// Will output "Hello"

@{translate('great_someone', null, null, {name: "John"})}

// Will output "Hello Martin"

@{translate('great_someone', null, null, {name: "@@{name}"})}
// Will output "Hello Martin"
```