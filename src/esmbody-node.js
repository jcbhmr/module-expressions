import template from "./internal/template-node.txt.js";

/**
 * @param {ImportMeta} importMeta
 * @param {(...a: any) => any} function_
 * @returns {string}
 */
export default function esmbody(importMeta, function_) {
  const id = Math.random().toString(36).slice(2, 6);
  const resolveShimURL = new URL("internal/resolve-shim.js", import.meta.url);

  globalThis.__originalResolveMap__ ??= new Map();
  __originalResolveMap__.set(id, importMeta.resolve);

  let f = `${function_}`;

  const r = ($0, $1, $2, $3) => {
    const specifier = JSON.parse($2.replaceAll("'", '"'));
    const resolved = importMeta.resolve(specifier, url);
    return $1 + JSON.stringify(resolved) + $3;
  };
  f = f.replaceAll(/(\Wimport\s[\s\S]*?from\s+)(['"].*?['"])(\W)/g, r);
  f = f.replaceAll(/(\Wimport\s+)(['"].*?['"])(\W)/g, r);
  f = f.replaceAll(/(\Wexport\s[\s\S]*?from\s+)(['"].*?['"])(\W)/g, r);

  f = f.replaceAll(/(\W)import\(/g, "$1__import__(");
  f = f.replace(/(\W)import\.meta(\W)/g, "$1__importMeta__$2");

  let t = template;
  t = t.replaceAll("TEMPLATE_MODULE_ID", JSON.stringify(id));
  t = t.replaceAll("TEMPLATE_MODULE_URL", JSON.stringify(importMeta.url));
  t = t.replaceAll("TEMPLATE_RESOLVE_SHIM_URL", JSON.stringify(resolveShimURL));
  t = t.replaceAll("TEMPLATE_FUNCTION_TEXT", f);

  return t;
}
