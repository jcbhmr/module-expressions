import Module_ from "./Module";

declare global {
  type Module<T extends {}> = Module_<T>;
  var Module: typeof Module_;
}

globalThis.Module = Module;

export { default } from "./module_";
