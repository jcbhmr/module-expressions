// @ts-nocheck
{
  const moduleId = TEMPLATE_MODULE_ID;
  const moduleURL = TEMPLATE_MODULE_URL;

  const resolve =
    globalThis.__originalResolversMap__?.get(moduleId) ??
    ((specifier) =>
      /^\.?\.?\//.test(specifier)
        ? import.meta.resolve(new URL(specifier, moduleURL).href)
        : import.meta.resolve(specifier));

  var __import__ = async (specifier, options = undefined) =>
    /^\.?\.?\//.test(specifier)
      ? import(new URL(specifier, moduleURL).href, options)
      : import(specifier, options);

  var __importMeta__ = Object.create(null);
  __importMeta__.url = moduleURL;
  __importMeta__.resolve = resolve;
}

const __function__ = TEMPLATE_FUNCTION_TEXT;
export default await __function__();
