/**
 * Fuses the `import.meta`-like object that was provided into all the `import()`
 * and `import.meta` module-specific functions/properties.
 *
 * For instance, inside the example (below), the `import.meta.url` is the same
 * as the parent! It's not `data:`, it's `file:///index.js` (or similar). The
 * `import()` calls are also replaced with a custom `__import__()` hook that we
 * use to resolve the imports _relative to the `import.meta.url` of the
 * user-provided object_.
 *
 * This function creates the raw ESM source text that could be written to a
 * file, used in a `data:` URL, or further transformed.
 *
 * 🛑 Only Node.js is supported right now! Track implementation progress on
 * GitHub in [#5](https://github.com/jcbhmr/esmurl/issues/5).
 *
 * - [x] Node.js (no bundler)
 * - [ ] Node.js + Vite
 * - [ ] Browser + Vite (HTML)
 * - [ ] Browser + esm.sh CDN
 * - [ ] Vitest (Node.js + Vite SSR)
 *
 * @example
 *   import { esmbody } from "@jcbhmr/esmurl";
 *   const t = esmbody(import.meta, async () => {
 *     const { hello } = await import("./greetings.js");
 *     return hello("George");
 *   });
 *   console.log(t);
 *   //=> 'var __import__ = ...; var __importMeta__ = ....;\n' +
 *   //   'export default await (async () => { ... });'
 */
function esmbody(importMeta: ImportMeta, function_: (...a: any) => any): string;
export default esmbody;
