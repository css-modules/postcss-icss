postcss-icss
============

A CSS Modules parser to extract tokens from the css file. Provides opportunity to process multiple files.

## API

In order to use it you should provide a `fetch` function which should load contents of files and process it with the PostCSS instance.
`fetch` function should return  promise object which will resolve into tokens.

```js
const ICSS = require('postcss-icss');

function fetch(importee, importerDir, processor) {
  // load content
  return processor.process(css, { from: filename })
    .then(result => result.messages.find(d => d.type === "icss").exportTokens);
}

postcss([ ICSS({ fetch }) ]);
```
