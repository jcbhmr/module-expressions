_It's recommended to have use this document as a reference when editing code
that uses these steps. This is the centralized documentation that explains how
each of the steps interact with each other._

## 1. Replace all `import()` calls with a custom `__import__()` function

```js
x.replaceAll(/(\W)import\(/g, "$1__import__(");
```

### 1.1. Handle Vite-specific post-compilation `import()` calls

This is more complicated. Vite uses a custom import hook in HTML mode to add a
`<link rel="modulepreload">` for any statically determined dependencies of an
`import()` call. We want to avoid this (for now). Just replace the complex call
with a dead-simple `import()` call.

## 2. Replace all `import.meta` with a custom `__importMeta__` object

```js
x.replaceAll(/(\W)import\.meta(\W)/g, "$1__importMeta__$2");
```

## 3. Figure out the best possible resolution algorithm

### Node.js

### Deno

### Browser

## 4. Preemptively resolve static `import` statements to absolute URLs (optional)

```js
x.replaceAll(/(\W)import(\s+[\s\S]*?)(?:("[\s\S]*?")|('[\s\S]*?'))/g, () => {
  // ...
});
```

⚠️ It's highly possible that non-replaced `import` statments will error at
import-time! Make sure that this regex captures 90%+ of all `import` statements!

💡 Take inspiration from [Rich-Harris/shimport]

🚄 Only import this complicated static analysis **if needed**. Don't do it if
everything can just be hooked into at runtime.

## 5. Preemptively resolve analyzable `import()` calls to absolute URLs (optional)

This helps with specifiers that are resolvable in the current
`import.meta.resolve()` scope, but might not be available in, say, a web
`Worker` thread. If you are using import maps, this is probably a thing that you
want! Hence, we support it.

## 6. Preemptively resolve analyzable `import.meta.resolve()` calls to absolute URLs (optional)

Same as the `import()` static analysis, but for `import.meta.resolve()`. This
helps with things that the current scope's import map can resolve, but couldn't
be resolved in a different realm (e.g. a web `Worker` thread).

## 7. Insert the dynamic module metadata prelude

All top-level vars that are accessible by user code should be `__var__` instead
of `var`. This is to avoid any potential name collisions with user code.

### 7.1. Create the `__import__` function

```js
const __import__ = async (specifier) => {
  // ...
};
```

### 7.2. Create the `__importMeta__` object

```js
const __importMeta__ = Object.create(null)
__importMeta__.url = ...;
__importMeta__.resolve = ...;
```

**Optional:** If possible (i.e. the native `import.meta` object is not frozen),
we can apply all properties from our custom `__importMeta__` object to the
native `import.meta` object.

### 7.3. Add any additional `import.meta` metadata

To do this, the simplest way is `JSON.stringify(importMeta)` (which will exclude
all the functions and such) and then
`Object.assign(importMeta, JSON.parse(stringifiedImportMeta))` on the other
side!

## 8. Add the export wrapper (optional)

⚠️ This should only be used with dynamic IIFE modules, not static ESM module
text.

1. `await` the return value of the module expression.
2. Export the result as the `default` export.
3. Export a `then` function that resolves to:
   1. If the result has a `__esModule` property and it's `true`, then return the
      result as-is.
   2. If the result is determined to be a module namespace object, then return
      the result as-is.
   3. Otherwise, use CommonJS interop logic to convert the plain object to a
      module namespace object.

CommonJS module interop logic is basically:

1. Expose the object itself as the default export.
2. Copy all own properties from the object to the module namespace.

In the future, we may use regex static-ish analysis magic to extract unchanging
(non-code-generated) exports from the module text and use that to generate a
static export wrapper. This is what Node.js does.

## 9. Insert the module body

[Rich-Harris/shimport]: https://github.com/Rich-Harris/shimport#readme
