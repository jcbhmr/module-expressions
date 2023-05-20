import createModuleURL from "./createModuleURL";

const sourceText = new WeakMap<Module, string>();
const importMeta = new WeakMap<Module, ImportMeta>();
const dataURL = new WeakMap<Module, string>();
class Module {
  constructor() {
    throw new TypeError("Illegal constructor");
  }

  [Symbol.toPrimitive](hint: "string" | "number" | "default"): any {
    // The hint will be "string" when it's coerced in 'import(myModule)'
    // operations. We want to custom-prepare a data: URL for that case.
    if (hint === "string") {
      if (!dataURL.get(this)) {
        dataURL.set(this, createModuleURL(importMeta, sourceText.get(this)!));
      }
      return dataURL.get(this)!;
    }

    return sourceText.get(this)!;
  }

  toString(): string {
    return sourceText.get(this)!;
  }
}

function createModule(importMeta_: ImportMeta, sourceText_: string): Module {
  const o = Object.create(Module.prototype);
  importMeta.set(o, importMeta_);
  sourceText.set(o, sourceText_);
  return o;
}

export default Module;
export { createModule };
