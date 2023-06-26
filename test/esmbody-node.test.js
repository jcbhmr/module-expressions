import test from "node:test";
import assert from "node:assert";
import esmbody from "../src/esmbody-node.js";

/**
 * @param {string} text
 * @returns {object}
 */
async function esval(text) {
  const url = "data:text/javascript," + encodeURIComponent(text);
  const m = await import(url);
  return m.default;
}

test("works with no imports", async () => {
  const t1 = esmbody(import.meta, () => {
    return 42;
  });
  console.log(await esval(t1));
});

test("works with 'node:' imports", async () => {
  const t2 = esmbody(import.meta, async () => {
    const url = await import("node:url");
    return url.pathToFileURL("/").href;
  });
  console.log(await esval(t2));
});

test("works with relative imports", async () => {
  const t3 = esmbody(import.meta, async () => {
    const { default: x } = await import("./stub.js");
    return x;
  });
  console.log(await esval(t3));
});

test("works with npm package imports", async () => {
  const t4 = esmbody(import.meta, async () => {
    const { default: isOdd } = await import("is-odd");
    return `isOdd(42) = ${isOdd(42)}`;
  });
  console.log(await esval(t4));
});
