import getResolve from "#/internal/getResolve.js";
import createLocalResolveDeclaration from "#/internal/createLocalResolveDeclaration.js";

/**
 * @param {ImportMeta} importMeta
 * @param {(...a: any) => any} function_
 * @returns {string}
 */
export default function esmbody(importMeta, function_) {
  if (!importMeta || typeof importMeta !== "object") {
    throw new TypeError(`${importMeta} is not an object`);
  }
  const url = importMeta.url;
  if (typeof url !== "string") {
    throw new TypeError(`${url} is not a string`);
  }
  const resolve = getResolve(importMeta);

  const e = `${function_}`;
  const id = Math.random().toString(36).slice(2, 6);

  const ef = ($0, $1, $2, $3) => {
    const specifier = JSON.parse($2.replaceAll("'", '"'));
    const resolved = resolve(specifier, url);
    return $1 + JSON.stringify(resolved) + $3;
  };
  e = e.replaceAll(/(\Wimport\s[\s\S]*?from\s+)(['"].*?['"])(\W)/g, ef);
  e = e.replaceAll(/(\Wimport\s+)(['"].*?['"])(\W)/g, ef);
  e = e.replaceAll(/(\Wexport\s[\s\S]*?from\s+)(['"].*?['"])(\W)/g, ef);

  e = e.replaceAll(/(\W)import\(/g, "$1__import__(");
  e = e.replace(/(\W)import\.meta(\W)/g, "$1__importMeta__$2");

  let b = "";
  b += `const __moduleId__=${JSON.stringify(id)};`;
  b += `const __moduleURL__=${JSON.stringify(url)};`;

  globalThis.__originalResolveMap__ ??= new Map();
  __originalResolveMap__.set(id, resolve);
  b +=
    `const __originalResolve__=` +
    `(globalThis.__originalResolveMap__??=new Map())` +
    `.get(__moduleId__);`;

  b += createLocalResolveDeclaration();

  b +=
    `const __bestResolve__=(s,p=__moduleURL__)=>{` +
    `if(__originalResolve__)return __originalResolve__(s,p);` +
    `if(s.startsWith("./")||s.startsWith("../")||s.startsWith("/")){` +
    `const r=new URL(s,p).href;` +
    `if(__localResolve__)return __localResolve__(r,p);` +
    `else return r;` +
    `}else if(__localResolve__)return __localResolve__(s,p);` +
    `else return new URL(s).href;` +
    `};`;

  b += "const __import__=async(s,a)=>import(__bestResolve__(`${s}`),a);";
  b += `const __importMeta__=Object.create(null);`;
  b += `__importMeta__.url=${JSON.stringify(url)};`;
  b += "__importMeta__.resolve=(s,p=void 0)=>__bestResolve__(`${s}`,p);";

  b += `export default await (${e})();`;

  return b;
}
