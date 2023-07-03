/** @type {(s: string, p?: string) => string} */
let resolve;
if (import.meta.resolve && !import.meta.resolve("data:,").then) {
  // @ts-ignore
  resolve = import.meta.resolve;
} else {
  const { resolve: resolveShim } = await import("import-meta-resolve");
  resolve = (specifier, parentURL = import.meta.url) =>
    resolveShim(specifier, parentURL);
}

const template = `
  {
    const moduleId = TEMPLATE_MODULE_ID;
    const moduleURL = TEMPLATE_MODULE_URL;
    const resolveShimURL = TEMPLATE_RESOLVE_SHIM_URL;
    const vitestRoot = TEMPLATE_VITEST_ROOT;

    let vitestRootURL;
    if (vitestRoot) {
      const url = await import("node:url");
      vitestRootURL = url.pathToFileURL(vitestRoot + "/").href;
    }

    let resolve;
    if (globalThis.__originalResolversMap__?.get(moduleId)) {
      resolve = __originalResolversMap__.get(moduleId);
    } else if (import.meta.resolve && !import.meta.resolve("data:,").then) {
      resolve = (specifier, parentURL = moduleURL) => {
        specifier = \`\${specifier}\`;
        if (vitestRootURL && specifier.startsWith("/")) {
          specifier = new URL("." + specifier, vitestRootURL).href;
        }
        return import.meta.resolve(specifier, parentURL);
      };
    } else {
      const { resolve: resolveShim } = await import(resolveShimURL);
      resolve = (specifier, parentURL = moduleURL) => {
        specifier = \`\${specifier}\`;
        if (vitestRootURL && specifier.startsWith("/")) {
          specifier = new URL("." + specifier, vitestRootURL).href;
        }
        return resolveShim(specifier, parentURL);
      };
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
`;

/**
 * @param {ImportMeta} importMeta
 * @param {(...a: any) => any} function_
 * @returns {string}
 */
export default function esmbody(importMeta, function_) {
  const id = Math.random().toString(36).slice(2, 6);
  const resolveShimURL = resolve("import-meta-resolve");

  // @ts-ignore
  globalThis.__originalResolveMap__ ??= new Map();
  // @ts-ignore
  __originalResolveMap__.set(id, importMeta.resolve);

  /** @type {string | undefined} */
  // @ts-ignore
  const vitestRoot = globalThis.__vitest_worker__?.config.root;

  let f = `${function_}`;
  f = f.replaceAll(/(\W)import\(/g, "$1__import__(");
  f = f.replaceAll(/(\W)__vite_ssr_dynamic_import__\(/g, "$1__import__(");
  f = f.replaceAll(/(\W)import\.meta(\W)/g, "$1__importMeta__$2");

  let t = template;
  t = t.replaceAll("TEMPLATE_MODULE_ID", JSON.stringify(id));
  t = t.replaceAll("TEMPLATE_MODULE_URL", JSON.stringify(importMeta.url));
  t = t.replaceAll("TEMPLATE_RESOLVE_SHIM_URL", JSON.stringify(resolveShimURL));
  t = t.replaceAll("TEMPLATE_FUNCTION_TEXT", f);
  t = t.replaceAll("TEMPLATE_VITEST_ROOT", JSON.stringify(vitestRoot));

  return t;
}
