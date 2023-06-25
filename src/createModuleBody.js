function replaceDynamicImportsWithHook(e) {
  e = e.replaceAll(/(\W)import\(/g, "$1__import__(");
  return e;
}

function replaceImportMetasWithHook(e) {
  e = e.replace(/(\W)import\.meta(\W)/g, "$1__importMeta__$2");
  return e;
}

function createOriginalResolveDeclaration(id, resolve) {
  globalThis.__originalResolveMap__ ??= new Map();
  __originalResolveMap__.set(id, resolve);
  return (
    `const __originalResolve__=` +
    `(globalThis.__originalResolveMap__??=new Map())` +
    `.get(__moduleId__);`
  );
}

function createImportMetaHookDeclaration(url, importMeta) {
  /** @type {string} */
  let initialImportMetaJSON;
  try {
    initialImportMetaJSON = JSON.stringify(importMeta);
  } catch (error) {
    if (typeof process !== "undefined" && process.emitWarning) {
      process.emitWarning(error);
    } else {
      console.warn(error);
    }
    initialImportMetaJSON = "{}";
  }
  if (!initialImportMetaJSON.startsWith("{")) {
    throw new TypeError();
  }

  let d = "";
  if (Object.getPrototypeOf(importMeta) == null) {
    d += `const __importMeta__=Object.create(null);`;
    d += `Object.assign(__importMeta__,${initialImportMetaJSON});`;
  } else {
    d += `const __importMeta__=${initialImportMetaJSON};`;
  }
  d += `__importMeta__.url=${JSON.stringify(url)};`;
  d += "__importMeta__.resolve=(s,p=void 0)=>__bestResolve(`${s}`,p);";
  return d;
}

function ensureResolve(resolve) {
  if (typeof resolve !== "function") {
    throw new TypeError();
  }

  let p;
  try {
    p = resolve("");
  } catch {}

  if (p && typeof p.then === "function") {
    p.then(undefined, () => {});
    throw new TypeError();
  }

  return resolve;
}

function createBestResolveDeclaration(url, id) {
  return (
    `const __bestResolve__=(s,p=__moduleURL__)=>{`
    + `if(__originalResolve__)return __originalResolve__(s,p);`
    + `if(s.startsWith("./")||s.startsWith("../")||s.startsWith("/")){`
    + `const r=new URL(s,p).href;`
    + `try{return import.meta.resolve(r)}catch{return r}`
    + `}else return import.meta.resolve(r);`
    + `};`
  )
}

function createModuleBody(importMeta, function_) {
  if (!importMeta || typeof importMeta !== "object") {
    throw new TypeError();
  }
  const url = importMeta.url;
  if (typeof url !== "string") {
    throw new TypeError();
  }
  const resolve = ensureResolve(importMeta.resolve);

  const expression =
    typeof function_ === "function"
      ? Function.prototype.toString.call(function_)
      : function_;

  const id = Math.random().toString(36).slice(2, 6);

  let e = expression;
  e = replaceDynamicImportsWithHook(e);
  e = replaceImportMetasWithHook(e);
  // e = preemptDynamicImports(e, resolve);
  // e = preemptImportMetaResolves(e, resolve);

  let b = "";
  b += `const __moduleId__=${JSON.stringify(id)};`;
  b += `const __moduleURL__=${JSON.stringify(url)};`;
  b += createOriginalResolveDeclaration(id, resolve);
  b += createBestResolveDeclaration(url, id);
  b += "const __import__=async(s,a)=>import(__bestResolve__(`${s}`),a);";
  b += createImportMetaHookDeclaration(url, importMeta);
  b += `export default await (${e})();`;

  return b;
}

export default createModuleBody;
