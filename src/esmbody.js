import template from "./internal/template.txt.js";

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
  f = f.replaceAll(/(\W)import\(/g, "$1__import__(");
  f = f.replace(/(\W)import\.meta(\W)/g, "$1__importMeta__$2");

  let t = template;
  t = t.replaceAll("TEMPLATE_MODULE_ID", JSON.stringify(id));
  t = t.replaceAll("TEMPLATE_MODULE_URL", JSON.stringify(importMeta.url));
  t = t.replaceAll("TEMPLATE_FUNCTION_TEXT", f);

  return t;
}
