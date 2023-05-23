/**
 * This file is named "module_.ts" to avoid conflicts on case-insensitive file
 * systems with the "Module.ts" file.
 *
 * @file
 */

// The virtual:module-template is a virtual module that contains the template
// for the module function as a string. It's the contents of module-template.js
// minified and exported as a string. We use Terser to minify the code in the
// vite.config.ts file. Check it out!
// @ts-ignore
import moduleTemplate from "virtual:module-template";
import Module, { createModule } from "./Module";

declare var moduleTemplate: string;
declare global {
  var __resolvers: Record<string, (specifier: string) => string> | undefined;
}

/**
 * We use `Module` objects to track these module blocks. When they get GC'd, we
 * can _reasonably_ assume that no user has held onto the raw `data:` or `blob:`
 * URL that was generated for the module block. This means we can safely remove
 * the resolver function from the `__resolvers` map.
 *
 * Even if they did keep it, or if the `Module` object was copied to another
 * realm (another realm gets the `data:` URL), that's OK since in the module
 * code we don't _need_ the module parent's `import.meta.resolve()` function,
 * it's just _nice to have_. If it's not there, we fall back to the local
 * `import.meta.resolve()` function.
 */
const fr = new FinalizationRegistry((url: string) => {
  if (typeof __resolvers !== "undefined" && url in __resolvers) {
    delete __resolvers[url];
  }
});

/**
 * 🛑 This is a sham! It's not a real API that is standard. This is something to
 * _emulate_ a new ECMAScript feature, but it's not a true polyfill because
 * **you can't polyfill a syntax feature** using just JavaScript. You need to
 * make concessions to get _close_ to the desired behavior. In this case, that
 * means using this module.
 *
 * ⚠️ You can't access closed-over variables in the module block. This is
 * because the function is `.toString()`-ified and then re-parsed, which means
 * any non-global variable references will be lost. This also emulates the way
 * module blocks would work normally; they **cannot** close-over values, they're
 * just another way to represent an ES module without creating a new file.
 *
 * Why do we need `import.meta`? Because we need to know the URL of the module
 * that the given module block (your async function) is syntactically located
 * in. That way, we can properly override the `import.meta.url` of the generated
 * module to match! This also lets us re-use the `import.meta.resolve()`
 * function if your module is imported in the same global scope as the module
 * block was declared in.
 *
 * ℹ The current backend implementation uses `data:` URLs to represent the
 * module's importable URL. Make sure you keep your function body of
 * medium-length to avoid approaching the `data:` URL length limit.
 *
 * @example
 *   // Return a non '__esModule' object and it will be the default export.
 *   const mod1 = module(import.meta, () => (n) => {
 *     if (n <= 1) return 1;
 *     return n * factorial(n - 1);
 *   });
 *   const { default: factorial } = await import(mod1);
 *
 *   // Return an '__esModule' object to have multiple or named exports.
 *   const mod2 = module(import.meta, () => ({
 *     __esModule: true,
 *     factorial: (n) => {
 *       if (n <= 1) return 1;
 *       return n * factorial(n - 1);
 *     },
 *   }));
 *   worker.postMessage(mod2);
 *
 *   // You have the full power of import() at your disposal.
 *   const mod3 = module(import.meta, () => {
 *     const { default: factorial } = await import("./factorial.js");
 *     return (n) => factorial(n + 10);
 *   });
 *   const { default: factorialPlus10 } = await import(mod3);
 *
 * @experimental
 * @see https://github.com/tc39/proposal-module-expressions
 * @see https://github.com/jcbhmr/module-expressions#readme
 */
export default function module<T = any>(
  importMeta: ImportMeta,
  bodyBlock: () => PromiseLike<T> | T
): Module<T extends { __esModule: true } ? T : { default: T }> {
  if (!importMeta?.url) {
    throw new DOMException(
      "import.meta.url is not available",
      "NotSupportedError"
    );
  }
  if (typeof bodyBlock !== "function") {
    throw new TypeError("bodyBlock is not a function");
  }

  const bodyBlockCode = Function.prototype.toString.call(bodyBlock);

  let b = bodyBlockCode;
  b = b.replace(/(\W)import\(/g, "$1__import(");

  // Vitest hooks
  b = b.replace(/(\W)__vite_ssr_dynamic_import__\(/g, "$1__import(");
  b = b.replace(/(\W)__vite_ssr_import_meta__/g, "$1import.meta");

  // Vite HTML preload
  b = b.replace(
    /(\W)h\(\(\)=>import\("(.*?)"\),(\[.*?\])\)/g,
    '$1__import("$2")'
  );

  // Vite import.meta.glob("...", { eager: true })
  if (/__glob__\d+_\d+/g.test(b)) {
    // TODO: Add better warning message
    console.warn("eager glob import");
  }

  if (importMeta.resolve) {
    globalThis.__resolvers ??= {};
    __resolvers![importMeta.url] = importMeta.resolve as unknown as (
      specifier: string
    ) => string;
  }

  let viteRoot: string | undefined;
  // @ts-ignore
  if (typeof __vite_worker__ !== "undefined") {
    // @ts-ignore
    viteRoot = __vite_worker__.config.root;
  }

  let m = moduleTemplate;
  m = m.replaceAll("TEMPLATE_URL", JSON.stringify(importMeta.url));
  m = m.replaceAll("TEMPLATE_ID", JSON.stringify(`${Math.random()}`));
  m = m.replaceAll("TEMPLATE_BODY", `(${b})`);
  m = m.replaceAll("TEMPLATE_VITE_ROOT", JSON.stringify(viteRoot));

  const moduleBodyCode = m;
  const dataURL = "data:text/javascript," + encodeURIComponent(moduleBodyCode);

  const module = createModule<
    T extends { __esModule: true } ? T : { default: T }
  >(`(${bodyBlockCode})()`, dataURL);
  fr.register(module, importMeta.url);

  return module;
}
