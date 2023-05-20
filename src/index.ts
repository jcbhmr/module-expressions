import { createModule, Module } from "./Module";

function module(
  importMeta: ImportMeta
): (strings: TemplateStringsArray) => Module {
  return (strings: TemplateStringsArray): Module =>
    createModule(importMeta, strings[0]);
}

export { module, Module };
