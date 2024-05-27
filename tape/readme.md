# Installation

The module can store files in a single file structure with various custom object metadata. The files are stored in order. You can't change meta data because it's required to "reindex" content. You can obtain a file identifier using the "append()" method or the "ls()" method. The file identifier is collected from the file offset, meta data size, and file size. Therefore, modifying files can affect identifiers.

__Requirements__:

- Total.js `+v5.0.0`

---

- download module `tape.js`
- copy it to `yourapp/modules/tape.js`

---

```js
var tape = MODS.tape.create('filename.tape');

// [Append file]:
// tape.append(buffer/filename, {}, callback)
// await tape.append('logo.png', { name: 'logo.png', user: 'petersirka' });

// [Listing]:
// tape.ls(callback);
// var list = await tape.ls();

// [Read file stream]:
// tape.stream(id, callback);
// var stream = await tape.stream('433687X52X152');
// stream.on('data', chunk => console.log(chunk.toString('utf8')));

// [Read file meta data]:
// tape.read(id, callback);
// var meta = await tape.read('433687X52X152');
// console.log(meta);

// [Remove file (soft remove)]:
// tape.remove(id, callback);
// await tape.remove('433687X52X152');

// [Clear removed files]:
// tape.clear(callback);
// await tape.clear();
```