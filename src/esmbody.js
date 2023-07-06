const moduleCodeTemplate = `
{
  const moduleId = TEMPLATE_MODULE_ID;
  const moduleURL = TEMPLATE_MODULE_URL;

  const resolve =
    globalThis.__originalResolversMap__?.get(moduleId) ??
    ((specifier) => {
      specifier = \`\${specifier}\`;
      return /^\\.?\\.?\\//.test(specifier)
        ? import.meta.resolve(new URL(specifier, moduleURL).href)
        : import.meta.resolve(specifier);
    });

  var __import__ = async (specifier, options = undefined) => {
    specifier = \`\${specifier}\`;
    return /^\\.?\\.?\\//.test(specifier)
      ? import(new URL(specifier, moduleURL).href, options)
      : import(specifier, options);
  };

  var __importMeta__ = Object.create(null);
  __importMeta__.url = moduleURL;
  __importMeta__.resolve = resolve;
}

const __function__ = TEMPLATE_FUNCTION_TEXT;
export default await __function__();
`;

/**
 * @param {ImportMeta} importMeta
 * @param {(...a: any) => any} function_
 * @returns {string}
 */
export default function esmbody(importMeta, function_) {
  const id = Math.random().toString(36).slice(2, 6);

  // @ts-ignore
  globalThis.__originalResolveMap__ ??= new Map();
  // @ts-ignore
  __originalResolveMap__.set(id, importMeta.resolve);

  let f = `${function_}`;
  f = f.replaceAll(
    /(\W)\w\(\(\)=>(import\(".*?"\)(?:\.then\(.*?\))?),\[.*?\]\)(\W)/g,
    "$1$2$3"
  );
  f = f.replaceAll(/(\W)import\(/g, "$1__import__(");
  f = f.replaceAll(/(\W)import\.meta(\W)/g, "$1__importMeta__$2");

  let t = moduleCodeTemplate;
  t = t.replaceAll("TEMPLATE_MODULE_ID", JSON.stringify(id));
  t = t.replaceAll("TEMPLATE_MODULE_URL", JSON.stringify(importMeta.url));
  t = t.replaceAll("TEMPLATE_FUNCTION_TEXT", f);

  return t;
}
