/**
 * @param {ImportMeta} importMeta
 * @param {() => PromiseLike<any> | any} bodyBlock
 * @returns {string}
 */
export default function module(importMeta, bodyBlock) {
  let b = `${bodyBlock}`;
  b = b.replaceAll("import(", "__import(");
  b = b.replaceAll("__vite_ssr_dynamic_import__(", "__import(");
  b = b.replaceAll("__vite_ssr_import_meta__", "import.meta");

  globalThis.__resolvers ??= [];
  __resolvers.push(importMeta.resolve);
  const id = __resolvers.length - 1;

  // prettier-ignore
  const m = `{let u=${JSON.stringify(importMeta.url)},r=globalThis.__resolvers?.[${id}]||import.meta.resolve;import.meta.url=u;if(r)import.meta.resolve=s=>{s=\`\${s}\`;return s.startsWith('./')||s.startsWith('../')||s.startsWith('/')?\`\${new URL(s,u)}\`:r(s)};var __import=s=>{s=\`\${s}\`;return s.startsWith('./')||s.startsWith('../')||s.startsWith('/')?import(\`\${new URL(s,u)}\`):r?import(r(s)):import(s)}}var __exports=await(${b})();{let e=__exports?.__esModule?__exports:{__esModule:true,default:__exports};var __then=y=>y(e)};export{__then as then}`;

  // https://github.com/nodejs/node/issues/47573
  if (typeof process === "undefined") {
    return URL.createObjectURL(new Blob([m], { type: "text/javascript" }));
  } else {
    return "data:text/javascript," + encodeURIComponent(m);
  }
}
