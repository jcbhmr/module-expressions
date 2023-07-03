import assert from "node:assert";
import esmbody from "../src/esmbody.js";

async function esval(b) {
  const m = await import("data:text/javascript," + encodeURIComponent(b));
  return m.default;
}
async function weval(b) {
  const js = `
    globalThis.onmessage = async ({ data }) => {
      const m = await import("data:text/javascript," + encodeURIComponent(data));
      postMessage(m.default);
    };
  `;
  const w = new Worker("data:text/javascript," + encodeURIComponent(js), {
    type: "module",
  });
  w.postMessage(b);
  return new Promise((resolve, reject) => {
    w.onmessage = ({ data }) => {
      w.terminate();
      resolve(data);
      clearTimeout(id);
    };
    w.onerror = (e) => {
      w.terminate();
      reject(e);
      clearTimeout(id);
    };
    const id = setTimeout(() => {
      w.terminate();
      reject(new Error("timeout"));
    }, 1000);
  });
}

Deno.test("works with no imports", async () => {
  const b = esmbody(import.meta, () => {
    return 42;
  });
  delete globalThis.__originalResolveMap__;
  assert.equal(await esval(b), 42);
});

Deno.test("works with 'node:' imports", async () => {
  const b = esmbody(import.meta, async () => {
    const url = await import("node:url");
    return url.pathToFileURL("/").href;
  });
  delete globalThis.__originalResolveMap__;
  assert.equal(await esval(b), "file:///");
});

Deno.test("works with relative imports", async () => {
  const b = esmbody(import.meta, async () => {
    const { default: x } = await import("./stub.js");
    return x;
  });
  delete globalThis.__originalResolveMap__;
  assert.equal(await esval(b), 42);
});

// TODO: Fix this test
// Deno.test("works with 'npm:' imports", async () => {
//   const b = esmbody(import.meta, async () => {
//     const { default: isOdd } = await import("npm:is-odd");
//     return isOdd(42);
//   });
//   delete globalThis.__originalResolveMap__;
//   assert.equal(await esval(b), false);
// });

Deno.test("works in Worker threads with no imports", async () => {
  const b = esmbody(import.meta, () => {
    return 42;
  });
  assert.equal(await weval(b), 42);
});

Deno.test("works in Worker threads with 'node:' imports", async () => {
  const b = esmbody(import.meta, async () => {
    const url = await import("node:url");
    return url.pathToFileURL("/").href;
  });
  assert.equal(await weval(b), "file:///");
});

Deno.test("works in Worker threads with relative imports", async () => {
  const b = esmbody(import.meta, async () => {
    const { default: x } = await import("./stub.js");
    return x;
  });
  assert.equal(await weval(b), 42);
});
