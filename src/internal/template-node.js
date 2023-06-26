{
  const moduleId = TEMPLATE_MODULE_ID;
  const moduleURL = TEMPLATE_MODULE_URL;
  const resolveShimURL = TEMPLATE_RESOLVE_SHIM_URL;

  /** @type {(specifier: string, parentURL?: string) => string} */
  let resolve;
  if (globalThis.__originalResolversMap__?.has(moduleId)) {
    resolve = __originalResolversMap__.get(moduleId);
  } else if (import.meta.resolve && !import.meta.resolve("data:,").then) {
    resolve = (specifier, parentURL = moduleURL) =>
      import.meta.resolve(specifier, parentURL);
  } else {
    const { resolve: resolveShim } = await import(resolveShimURL);
    resolve = (specifier, parentURL = moduleURL) =>
      resolveShim(specifier, parentURL);
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

const __function__ = TEMPLATE_FUNCTION_TEXT;
export default await __function__();
