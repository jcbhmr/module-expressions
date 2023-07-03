import test from "node:test";
import assert from "node:assert";
import { Worker } from "node:worker_threads";
import esmbody from "../src/esmbody-node.js";

async function esval(b) {
  const m = await import("data:text/javascript," + encodeURIComponent(b));
  return m.default;
}
async function weval(b) {
  const js = `
    const { parentPort } = require("node:worker_threads");
    parentPort.on("message", async (data) => {
      const m = await import("data:text/javascript," + encodeURIComponent(data));
      parentPort.postMessage(m.default);
    });
  `;
  const w = new Worker(js, { eval: true });
  w.postMessage(b);
  return new Promise((resolve, reject) => {
    w.on("message", (data) => {
      w.terminate();
      resolve(data);
    });
    w.on("error", (e) => {
      w.terminate();
      reject(e);
    });
    setTimeout(() => {
      w.terminate();
      reject(new Error("timeout"));
    }, 1000);
  });
}

test("works with no imports", async () => {
  const b = esmbody(import.meta, () => {
    return 42;
  });
  delete globalThis.__originalResolveMap__;
  assert.equal(await esval(b), 42);
});

test("works with 'node:' imports", async () => {
  const b = esmbody(import.meta, async () => {
    const url = await import("node:url");
    return url.pathToFileURL("/").href;
  });
  delete globalThis.__originalResolveMap__;
  assert.equal(await esval(b), "file:///");
});

test("works with relative imports", async () => {
  const b = esmbody(import.meta, async () => {
    const { default: x } = await import("./stub.js");
    return x;
  });
  delete globalThis.__originalResolveMap__;
  assert.equal(await esval(b), 42);
});

test("works with npm package imports", async () => {
  const b = esmbody(import.meta, async () => {
    const { default: isOdd } = await import("is-odd");
    return isOdd(42);
  });
  delete globalThis.__originalResolveMap__;
  assert.equal(await esval(b), false);
});

test("works in Worker threads with no imports", async () => {
  const b = esmbody(import.meta, () => {
    return 42;
  });
  assert.equal(await weval(b), 42);
});

test("works in Worker threads with 'node:' imports", async () => {
  const b = esmbody(import.meta, async () => {
    const url = await import("node:url");
    return url.pathToFileURL("/").href;
  });
  assert.equal(await weval(b), "file:///");
});

test("works in Worker threads with relative imports", async () => {
  const b = esmbody(import.meta, async () => {
    const { default: x } = await import("./stub.js");
    return x;
  });
  assert.equal(await weval(b), 42);
});

test("works in Worker threads with npm package imports", async () => {
  const b = esmbody(import.meta, async () => {
    const { default: isOdd } = await import("is-odd");
    return isOdd(42);
  });
  assert.equal(await weval(b), false);
});
