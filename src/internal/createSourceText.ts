import preprocess from "./preprocess.js";

let resolve: ((specifier: string, parent: string) => string) | null | undefined;
if (!import.meta.resolve) {
  ({ resolve } = await import("import-meta-resolve"));
} else if (typeof import.meta.resolve(import.meta.url) === "object") {
  ({ resolve } = await import("import-meta-resolve"))
}

let pathToFileURL: ((path: string) => URL) | null | undefined;
if (typeof process !== "undefined") {
  ({ pathToFileURL } = await import("node:url"));
}

export default function createSourceText(importMeta: ImportMeta, expression: string): string {
  const id = `${Math.random()}`

  expression = preprocess(importMeta, expression, id)

  let header = ""
  header += `const __importMeta__ = {};`
  if ("url" in importMeta) {
    header += `
      const __importMetaURL__ = ${JSON.stringify(importMeta.url)};
      __importMeta__.url = __importMetaURL__;
    `
  } else {
    if (typeof location !== "undefined") {
      header += `__importMetaURL__ = ${JSON.stringify(location.href)};`
    } else if (typeof process !== "undefined") {
      header += `__importMetaURL__ = ${JSON.stringify(pathToFileURL!(process.cwd()).href)};`
    } else {
      throw new ReferenceError("Cannot determine import.meta.url")
    }
  }
  if ("main" in importMeta) {
    header += `__importMeta__.main = ${JSON.stringify(importMeta.main)};`
  }
  let nodeImportMetaResolvePolyfillURL: string | null | undefined;
  if (Object.getOwnPropertySymbols(globalThis.EventTarget ?? {}).length)  {
    if (import.meta.resolve) {
      const r = import.meta.resolve("import-meta-resolve");
      if (typeof r === "object") {
        nodeImportMetaResolvePolyfillURL = resolve!("import-meta-resolve", import.meta.url);
      } else {
        nodeImportMetaResolvePolyfillURL = r;
      }
    } else {
      nodeImportMetaResolvePolyfillURL = resolve!("import-meta-resolve", import.meta.url);
    }
  }
  header += `
    const __importMetaResolveLocal__ = import.meta.resolve;
    let __importMetaResolveBest__;
    if (
      typeof __importMetaResolveOriginalMap__ !== "undefined" &&
      ${JSON.stringify(id)} in __importMetaResolveOriginalMap__
    ) {
      __importMetaResolveBest__ =
        __importMetaResolveOriginalMap__[${JSON.stringify(id)}];
    } else if (Object.getOwnPropertySymbols(globalThis.EventTarget ?? {}).length) {
      if (__importMetaResolveLocal__) {
        __importMetaResolveBest__ = (specifier, parent = __importMetaURL__) =>
          __importMetaResolveLocal__(specifier, parent);
      } else {
        const { resolve } = await import(
          ${JSON.stringify(nodeImportMetaResolvePolyfillURL ?? "")}
        );
        __importMetaResolveBest__ = (specifier, parent = __importMetaURL__) =>
          resolve(specifier, parent);
      }
    } else if (__importMetaResolveLocal__) {
      __importMetaResolveBest__ = (specifier) => {
        specifier = \`\${specifier}\`;
        if (
          specifier.startsWith("/") ||
          specifier.startsWith("./") ||
          specifier.startsWith("../")
        ) {
          return new URL(specifier, __importMetaURL__).href;
        } else {
          return __importMetaResolveLocal__(specifier);
        }
      }
    } else {
      __importMetaResolveBest__ = (specifier) => {
        specifier = \`\${specifier}\`;
        if (
          specifier.startsWith("/") ||
          specifier.startsWith("./") ||
          specifier.startsWith("../")
        ) {
          return new URL(specifier, __importMetaURL__).href;
        } else {
          return new URL(specifier).href;
        }
      }
    }
  `
  if ("resolve" in importMeta) {
    header += `__importMeta__.resolve = __importMetaResolveBest__;`
  }
  header += `
    const __import__  = (specifier, $2 = undefined) => {
      let resolved;
      try {
        resolved = __importMetaResolveBest__(specifier, __importMetaURL__);
      } catch {}
      return import(resolved ?? specifier, $2);
    }
  `

  return `
    ${header}
    const __rawValue__ = ((((${expression}))));
    let __exports__;
    if (__rawValue__?.__esModule) {
      __exports__ = __rawValue__;
    } else {
      __exports__ = { default: __rawValue__ };
    }
    const __then__ = (r) => r(__exports__);
    export { __then__ as then };
  `
}
