# Contextual ESM `data:` URLs

🧙‍♂️ `import.meta` + async function = contextual ESM `data:` URLs

🎉 Create `data:` URLs that are true ESM code from an `async () => {}` block \
🏠 Contextualizes `import()` calls in the body to the provided `import.meta` \
📦 Properly works with Vite, webpack, and more \
🛑 Will become obsolete when/if [Module Expressions] happens

## Usage

```js
import createESMURL from "@jcbhmr/create-esm-url";

const mod = createESMURL(import.meta, async () => {
  const { default: _ } = await import("lodash");
  const camelize = (s) => _.camelCase(s);
  return { __esModule: true, camelize };
});
console.log(mod);
//=> 'data:text/javascript;base64,...'

const { camelize } = await import(mod);
console.log(camelize("foo-bar"));
//=> 'fooBar'
```

## How it works

We use the `import.meta.url` and `import.meta.resolve` to try to preserve the
context provided to us in the spot where the mmodule URL is created. We need to
do this because the `data:` URL that we return must be context independent! It
should be usable in the same file, in a different file, or even in a different
Realm like a web `Worker` thread!

1. We stringify the `async () => {}` function body. This lets us access the raw
   source code of the "module body" at runtime.
2. We check to see if there's any markers like `__vite_ssr_dynamic_import__()`
   that mean we need to do some bundler-specific hacks to work with injected
   code. If there are, we use that bundler's template instead of the default.
3. If it exists, we stash the `import.meta.resolve()` function into the global
   scope under a module ID. This way, if the `import()` to load the module is
   called in the same context, we can just delegate to the actual module
   resolution algorithm of the parent module instead of our shim.
4. We replace any `import()` calls with a call to the `__import__()` function.
   This function is provided by our wrapper template ESM code and will try to
   proxy the imported specifier to the global `import.meta.resolve()` function
   for this module, or else try to resolve it using the `import.meta.url` of the
   module itself. If none of that works, then we'll just fall back to the
   default `import()`.
5. We do the song and dance to encode that source text into a `data:` URL and
   return it.

Here's an example of these transformations in Node.js:

```js
// index.js
createESMURL(import.meta, async () => {
  await import("node:fs/promises");
  await import("is-odd");
  await import("./foo.js");
  return () => "Hello, world!";
});
```

```js
// data: URL contents (unminified)
let __import__;
{
  const url = "file:///path/to/index.js";
  const originalResolve = import.meta.resolve;
  const parentResolve = globalThis.__resolvers__?.[url];
  if (parentResolve) {
    import.meta.resolve = parentResolve;
  }

  __import__ = async (specifier) => {
    // -- snip --
  };
}

const __exports__ = await (async () => {
  await __import__("node:fs/promises");
  await __import__("is-odd");
  await __import__("./foo.js");
  return () => "Hello, world!";
})();

let __then__;
{
  let exports = __exports__;
  exports = exports?.__esModule
    ? exports
    : { ...exports, __esModule: true, default: exports };

  __then__ = (r) => r(exports);
}

export { __then__ as then };
```
