## How it works

```js
const mod = module(import.meta, async () => {
  const { hello } = await import("./hello.js");
  return () => hello("world");
});
```

We are able to use the `Function#toString()` function to get the source code of
a particular JS function. We can then use some fancy string manipulation to
replace all the `import()` calls with a custom `__import()` function that we
define. This shim `__import()` will delegate to the _real_ `import()` after
resolving the given specifier (like `./hello.js`) to a URL **relative to the
original `import.meta` that was passed in earlier**. If we didn't do this, then
the `import("./hello.js")` call would resolve to a URL relative to the `data:`
URL that we created, which is not what we want! That would default to resolving
relative to the current page's URL, or in Node.js it fails (Node.js requires
absolute URLs when in a `data:` URL context).

As for the template module that is used with `${functionBlockCode}` inserts, we
use a raw `.js` file with a `?raw` import. This is **syntax that's specific to
Vite**. We do this coupled with a `TEMPLATE_*` variable find-and-replace so that
we can use proper syntax highlighting in our editor.

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
