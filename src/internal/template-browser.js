{
  const moduleId = TEMPLATE_MODULE_ID;
  const moduleURL = TEMPLATE_MODULE_URL;

  /** @type {(specifier: string, parentURL?: string) => string} */
  let resolve;
  if (globalThis.__originalResolversMap__?.has(moduleId)) {
    resolve = __originalResolversMap__.get(moduleId);
  } else if (import.meta.resolve) {
    resolve = (specifier, parentURL = moduleURL) =>
      /^\.?\.?\//.test(specifier)
        ? import.meta.resolve(new URL(specifier, parentURL).href)
        : import.meta.resolve(specifier);
  } else {
    resolve = (specifier) =>
      /^\.?\.?\//.test(specifier)
        ? new URL(specifier, moduleURL).href
        : new URL(specifier).href;
  }

  async function importHook(specifier, options = undefined) {
    return await import(resolve(specifier), options);
  }

  /** @type {(specifier: string, options?: ImportCallOptions) => object} */
  var __import__ = importHook;

  /** @type {ImportMeta} */
  /** @type {ImportMeta} */
  var __importMeta__ = Object.create(null);
  __importMeta__.url = moduleURL;
  if ("resolve" in import.meta) {
    __importMeta__.resolve = resolve;
  }
}

// prettier-ignore
export default await (TEMPLATE_FUNCTION_TEXT)();
