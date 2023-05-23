// @ts-check
/**
 * This is the file that is used as the template for all of the modules that we
 * create. This file is preprocessed and minified using Terser.
 *
 * We have three `TEMPLATE_*` variables that are replaced by the preprocessor:
 *
 * 1. `TEMPLATE_ID` is replaced with a unique ID for each module. This ID is
 *    generated on each new invocation of `module()`. We use this ID to get a
 *    same-realm `import.meta.resolve` function if it's available.
 * 2. `TEMPLATE_URL` is replaced with the URL of this file's parent. We need this
 *    so that we can properly resolve relative imports to the _syntactic
 *    location_ of this file instead of the _runtime location_ of this module
 *    (which is always a `data:` or `blob:` URL).
 * 3. `TEMPLATE_BODY` is replaced with the body of the module function. This is the
 *    raw function code that is pasted in. It's usually an async function, but
 *    it could be anything. This function has already been preprocessed by our
 *    other code to use `__import()` instead of `import()` so we can hook into
 *    it.
 *
 * @file
 * @example
 *   const raw = await readFile("src/module-template.js", "utf8");
 *   const minified = await minify(raw, {
 *     module: true,
 *     compress: {
 *       unused: false,
 *     },
 *     mangle: {
 *       reserved: ["__import", "__exports", "__then"],
 *     },
 *   });
 *   const text = `export default ${JSON.stringify(minified.code)}`;
 */

// We are using these {} blocks to isolate the scope of our variables like "url"
// so that they don't become minified short vars like "a", "b", etc. in the
// minified code that could potentially interfere with code in the function
// block that we are pasting in.
{
  /** @type {string} */
  // @ts-ignore
  const id = TEMPLATE_ID;
  /** @type {string} */
  // @ts-ignore
  const url = TEMPLATE_URL;
  /** @type {string} */
  // @ts-ignore
  const viteRoot = TEMPLATE_VITE_ROOT;

  import.meta.url = url;

  const resolve = import.meta.resolve;
  if (import.meta.resolve) {
    /**
     * @param {string} specifier
     * @returns {string}
     */
    // @ts-ignore
    import.meta.resolve = (specifier) => {
      specifier = `${specifier}`;

      // @ts-ignore
      if (typeof __resolvers !== "undefined" && url in __resolvers) {
        // @ts-ignore
        return __resolvers[url](specifier);
      } else if (
        specifier.startsWith("./") ||
        specifier.startsWith("../") ||
        specifier.startsWith("/")
      ) {
        return `${new URL(specifier, url)}`;
      } else {
        // @ts-ignore
        return resolve(specifier);
      }
    };
  }

  // Remember, var escapes the {} block scope! __import is also one of the vars
  // that won't be renamed. We've also congifured terser to not drop unused
  // variables, so this __import function will be available in the rest of the
  // module body for the actual body function to use.
  /**
   * @param {string} specifier
   * @returns {Promise<object>}
   */
  var __import = (specifier) => {
    specifier = `${specifier}`;

    // @ts-ignore
    if (typeof __resolvers !== "undefined" && url in __resolvers) {
      // @ts-ignore
      return import(__resolvers[url](specifier));
    } else if (
      specifier.startsWith("./") ||
      specifier.startsWith("../") ||
      specifier.startsWith("/")
    ) {
      return import(`${new URL(specifier, url)}`);
    } else if (resolve) {
      // @ts-ignore
      return import(resolve(specifier));
    } else {
      return import(specifier);
    }
  };

  /**
   * @param {string} specifier
   * @returns {Promise<object>}
   */
  var __viteImport = (specifier) => {
    specifier = `${specifier}`;

    if (specifier.startsWith("/")) {
      return import(viteRoot + specifier);
    } else {
      return __import(specifier);
    }
  };
}

/** @type {object} */
// @ts-ignore
var __exports = await TEMPLATE_BODY();

{
  /** @type {object} */
  const exports =
    __exports?.__esModule ||
    Object.prototype.toString.call(__exports).slice(8, -1) === "Module"
      ? __exports
      : { ...__exports, __esModule: true, default: __exports };

  // This needs to be var so that it escapes the {} block scope. We also keep
  // the __then name so that it doesn't get renamed to a "a", "b", etc. short
  // name.
  // TODO: Promises/A+ compliance?
  /** @type {Promise["then"]} */
  // @ts-ignore
  var __then = (handleResolve) => handleResolve(exports);
}

// This defines a .then() function on the module namespace object that gets
// returned by calls to import(). Thus, we can tap into the object that we want
// to return to our caller! We also export the stuff directly too just in case.
export { __then as then, __exports };
