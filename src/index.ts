import moduleTemplate from "./module-template.txt.js";

const sourceText = new WeakMap<Module<{}>, string>();
const dataURL = new WeakMap<Module<{}>, string>();
function createModule<T extends {}>(
  sourceText_: string,
  dataURL_: string
): Module<T> {
  const module = Object.create(Module.prototype) as Module<T>;

  sourceText.set(module, sourceText_);
  dataURL.set(module, dataURL_);

  return module;
}
class Module<T extends {} = {}> {
  static {
    Object.defineProperty(this, "name", {
      value: "Module",
      configurable: true,
    });
    Object.defineProperty(this.prototype, Symbol.toStringTag, {
      value: "Module",
      configurable: true,
    });
  }

  private constructor() {}

  [Symbol.toPrimitive](hint: "default" | "number" | "string") {
    if (hint === "string") {
      return dataURL.get(this)!;
    } else {
      return sourceText.get(this)!;
    }
  }

  toString() {
    return sourceText.get(this)!;
  }
}

// https://stackoverflow.com/a/50924506
type ModuleExports<T> = T extends Module<infer X> ? X : never;

declare global {
  interface ImportMeta {
    // @ts-ignore
    resolve?: (specifier: string) => string;
  }
}
declare var __resolvers:
  | Record<string, (specifier: string) => string>
  | undefined;
declare var __vite_worker__: any | undefined;

function module<T = unknown>(
  importMeta: ImportMeta,
  bodyBlock: () => PromiseLike<T> | T
): Module<T extends { __esModule: true } ? T : { default: T }> {
  const bodyBlockCode = Function.prototype.toString.call(bodyBlock);

  let b = bodyBlockCode;
  b = b.replace(/(\W)import\(/g, "$1__import(");

  const id = `${Math.random()}`;
  if (importMeta.resolve) {
    // @ts-ignore
    globalThis.__resolvers ??= {};
    __resolvers![id] = importMeta.resolve;
  }

  let viteRoot: string | undefined;
  if (typeof __vite_worker__ !== "undefined") {
    viteRoot = __vite_worker__.config.root;
  }

  let m = moduleTemplate;
  m = m.replaceAll("TEMPLATE_URL", JSON.stringify(importMeta.url));
  m = m.replaceAll("TEMPLATE_ID", JSON.stringify(id));
  m = m.replaceAll("TEMPLATE_BODY", `(${b})`);
  m = m.replaceAll("TEMPLATE_VITE_ROOT", JSON.stringify(viteRoot));

  const moduleBodyCode = m;
  const dataURL = "data:text/javascript," + encodeURIComponent(moduleBodyCode);

  const module = createModule<
    T extends { __esModule: true } ? T : { default: T }
  >(`(${bodyBlockCode})()`, dataURL);

  return module;
}

export { module, Module };
export type { ModuleExports };
