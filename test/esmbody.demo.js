#!/usr/bin/env node
import esmbody from "../src/esmbody-node.js";

/**
 * @param {string} text
 * @returns {object}
 */
async function esmEval(text) {
  const url = "data:text/javascript," + encodeURIComponent(text);
  return await import(url);
}

const t1 = esmbody(import.meta, () => {
  return 42;
});
console.log(t1);
console.log(await esmEval(t1));

const t2 = esmbody(import.meta, async () => {
  const url = await import("node:url");
  return url.pathToFileURL("/").href;
});
console.log(t2);
console.log(await esmEval(t2));

const t3 = esmbody(import.meta, async () => {
  const { default: x } = await import("./stub.js");
  return x;
});
console.log(t3);
console.log(await esmEval(t3));

const t4 = esmbody(import.meta, async () => {
  const prettier = await import("prettier");
  return prettier.format("const  x      =  42;", { parser: "babel" });
});
console.log(t4);
console.log(await esmEval(t4));
