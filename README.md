https://github.com/tc39/proposal-module-expressions

```js
const mod = module(import.meta, async () => {
  const message = await import("./message.js");

  function main(s) {
    console.log(message, s)
    return import.meta.url;
  }

  return { main }
})
// BECOMES
const mod = "data:text/javascript;base64," + btoa(`
  const __import_meta = { url: "about:blank", __id: 1 }
  // id increments on each call so that module() over and over is different each time,
  // even if same function https://github.com/tc39/proposal-module-expressions/issues/45

  async function __import(specifier) {
    let resolved;
    if (specifier.startsWith("./") || specifier.startsWith("../") || specifier.startsWith("/")) {
      resolved = "" + new URL(specifier, __import_meta.url)
    } else {
      resolved = specifier;
    }
    return await import(resolved)
  }

  const exports = await (async () => {
    const message = await __import("./message.js");

    function main(s) {
      console.log(message, s)
      return __import_meta.url;
    }

    return { main }
  })()

  export function then(resolve) {
    resolve?.(exports)
  }
`)

// this await unrolls the then()
// since we cant use the generated data: url anywhere meaningfully non-promisebased its OK to
// rely on that .then() resolving to the namespace as a hack for this shim
const m = await import(mod);
const url = m.main("hello");
console.log(url);

// works
new Worker(mod, { type: "module" })

// https://github.com/tc39/proposal-module-expressions
// https://github.com/whatwg/html/issues/6911
```
