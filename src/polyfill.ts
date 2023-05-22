/**
 * 🛑 It's highly recommended to use the regular index entry point so that you
 * don't have to deal with a global `module` variable potentially conflicting
 * with the Node.js `typeof module !== "undefined"` checks!
 *
 * @file
 */

import module_ from "./module_";
import Module_ from "./Module";

declare global {
  type Module = Module_;
  var Module: typeof Module_;
  // @ts-ignore
  var module: typeof module_;
}

globalThis.Module = Module;
// @ts-ignore
globalThis.module = module_;
