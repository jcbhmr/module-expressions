import esmbody from "#/esmbody.js";

/**
 * Creates a `data:` or `blob:` URL from a function and an `import.meta` object.
 * `blob:` URLs are preferred, falling back to `data:` URLs if the browser does
 * not support `URL.createObjectURL`.
 *
 * ⚠️ On Node.js this will _always_ use `data:` URLs! Node.js doesn't currently
 * support cross-thread `blob:` URLs. 😭
 *
 * This URL can then be used _directly_ in `import()` and other contexts as
 * though it were a full-fat ES module! All `import()` statements inside the
 * function are properly rewritten to be self-contained.
 *
 * For instance, if you use `import("./foo.js")` inside the function, we will
 * rewrite it to `__import__("./foo.js")` and then provide a shim for
 * `__import__` that uses some resolution huristic magic ✨ to resolve the module
 * URL relative to the user-provided `importMeta.url`.
 *
 * If you're looking for a function that just gives you the raw ESM body text
 * and doesn't wrap it in an `import()`-able URL, see `esmbody()`. That's where
 * all the real magic happens.
 *
 * @example
 *   import esmurl from "@jcbhmr/esmurl";
 *   const u = esmurl(import.meta, async () => {
 *     const { default: isOdd } = await import("is-odd");
 *     return isOdd(42);
 *   });
 *   const m = await import(u);
 *   console.log(m.default);
 *   //=> false
 *
 * @param {ImportMeta} importMeta
 * @param {(...a: any) => any} function_
 * @returns {string}
 * @see https://github.com/nodejs/node/issues/46557
 * @see {@link esmbody}
 */
function esmurl(importMeta, function_) {
  const body = esmbody(importMeta, function_);
  if (URL.createObjectURL) {
    return URL.createObjectURL(new Blob([body], { type: "text/javascript" }));
  } else {
    return "data:text/javascript," + encodeURIComponent(body);
  }
}

export default esmurl;
export { esmbody };
