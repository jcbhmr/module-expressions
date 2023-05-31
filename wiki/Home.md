## How it works

1. A user calls the `module()` function with the `import.meta` context that we
   need, along with the module body in the form of a function expression.

```js
const mod = module(import.meta, async () => {
  const { hello } = await import("./hello.js");
  return () => hello("world");
});
```

2. We are able to use the `Function#toString()` function to get the source code
   of a particular JS function.

```js
`async () => {
  const { hello } = await import("./hello.js");
  return () => hello("world");
}`;
```

3. We can then use some fancy string manipulation to replace all the `import()`
   calls with a custom `__import()` function that we define.

```js
`async () => {
  const { hello } = await __import("./hello.js");
  return () => hello("world");
}`;
```

4. We use a template file to wrap the module body within a larger module context
   with a defined `__import()` function. We also are able to inject a
   stringified `import.meta.url` for the module context to use in the
   `__import()` shim as its base URL.

   This shim `__import()` will delegate to the _real_ `import()` after resolving
   the given specifier (like `./hello.js`) to a URL **relative to the original
   `import.meta` that was passed in earlier**. If we didn't do this, then the
   `import("./hello.js")` call would resolve to a URL relative to the `data:`
   URL that we created, which is not what we want! That would default to
   resolving relative to the current page's URL, or in Node.js it fails (Node.js
   requires absolute URLs when in a `data:` URL context).

   ```js
   const __import = () => {
     /* ... */
   };
   const __exports = await (async () => {
     const { hello } = await __import("./hello.js");
     return () => hello("world");
   })();
   ```

5. We abuse the fact that `.then()` makes _anything_ awaitable! If you
   `import()` something, you get a `Promise`. The if the `Promise` has its
   `.resolve()` called with a _thenable_ (any object with a `.then()` method),
   then it will use wait until that `.then()` function resolves! This means we
   can allow `import()` to return a `Promise`, but then use an exported
   `.then()` method to "fake" a module namespace that we provide! How cool of a
   hack is that?

   ```js
   // ...
   const __then = (r) => r(__exports);
   export { __then as then };
   ```

   ```js
   const js = `export const then = (r) => r(42);`;
   const m = await import("data:text/javascript," + encodeURIComponent(js));
   console.log(m);
   //=> 42
   ```

For the template JavaScript file, we are using a pre-build step that:

1. Minifies the JS contents to remove all the `/** */` comments that document
   how it works. This makes the `data:` URL smaller!
2. Encodes that minified JS into a string literal that we can use as a string,
   not as a `.js` file that we `import`.
3. Writes that `export default ${string}` to a file that we can `import` from.
   Now we have the minified contents of the file as a string at build time!

### Bundlers

We want to support bundlers. That's kinda the reason to use this over something
like [developit/greenlet], right? You get a nice wrapped `Module` object that
has all the preprocessing done to make it contextual to the original
`import.meta` context. To support these bundlers though, we need to make sure
that we are handling _their_ syntax replacements too! For instance, Vite will
replace `import()` calls with `__vite_ssr_dynamic_import__()` calls! We need to
make sure that we are handling these cases too.

Here's a rundown of various quirks in bundlers:

#### Vite

- `import()` can become `__vite_ssr_dynamic_import__()`
- `import.meta` can become `__vite_ssr_import_meta__`
- `import.meta.glob()` can hoist `__glob__0_0` imports to top level `import`
  statements instead of relying on dynamic lazy imports.
- When bundling for HTML, Vite can inject a `h(() => import(...), [...])`
  wrapper around the `import()` call. The `h()` is a
  `<link rel="modulepreload">` hook for that modules dependencies. We need to
  ignore this!

#### webpack

_None found so far..._

[developit/greenlet]: https://github.com/developit/greenlet#readme
