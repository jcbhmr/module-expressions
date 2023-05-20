import templateCode from "./template.js?raw";

let nextId = 1;
function module(
  importMeta: ImportMeta,
  bodyBlock: () => PromiseLike<any> | any
): string {
  const bodyBlockCode = `${bodyBlock}`;
  const id = nextId;
  nextId++;

  let b = bodyBlockCode;
  b = b.replaceAll("import(", "__import(");

  globalThis.__moduleResolvers ??= {};
  __moduleResolvers[id] = importMeta.resolve;

  // MODULE_ID
  // IMPORT_META_URL
  // PROCESSED_BODY_BLOCK_CODE
  let m = templateCode;
  m = m.replaceAll("MODULE_ID", JSON.stringify(id));
  m = m.replaceAll("IMPORT_META_URL", JSON.stringify(importMeta.url));
  m = m.replaceAll("PROCESSED_BODY_BLOCK_CODE", b);

  return URL.createObjectURL(new Blob([m], { type: "text/javascript" }));
}
