#!/usr/bin/env node
import module from "./index.js";

const mod = module(import.meta, async () => {
  const { promisify } = await import("node:util");
  const { default: module } = await import("./index.js");

  return { __esModule: true, promisify, module, importMeta: import.meta };
});
console.log("import(mod)", await import(mod));
