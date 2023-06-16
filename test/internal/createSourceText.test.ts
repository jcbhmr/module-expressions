import test from "node:test";
import assert from "node:assert";
import createSourceText from "../../src/internal/createSourceText.js";

async function esmEval(s: string): Promise<any> {
  const js = `export default ((((${s}))));`;
  const u = "data:text/javascript," + encodeURIComponent(js);
  const m = await import(u);
  return m.default;
}

async function esmEval2(s: string): Promise<any> {
  const u = "data:text/javascript," + encodeURIComponent(s);
  const m = await import(u);
  return m;
}

esmEval2(createSourceText(import.meta, `(async () => {
  const fsPromises = await import("node:fs/promises");
  const $42 = await import("./42.js");
  const $100 = await import("data:text/javascript,export default 100;");
  const isOdd = await import("is-odd");
  console.log(fsPromises, $42, $100, isOdd);
})()`))
