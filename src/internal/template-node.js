// @ts-nocheck
{
  const moduleId = TEMPLATE_MODULE_ID;
  const moduleURL = TEMPLATE_MODULE_URL;
  const resolveShimURL = TEMPLATE_RESOLVE_SHIM_URL;

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

  var __import__ = async (specifier, options = undefined) =>
    import(resolve(specifier), options);

  var __importMeta__ = Object.create(null);
  __importMeta__.url = moduleURL;
  if ("resolve" in import.meta) {
    __importMeta__.resolve = resolve;
  }
}

const __function__ = TEMPLATE_FUNCTION_TEXT;
export default await __function__();
