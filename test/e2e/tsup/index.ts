import "@jcbhmr/module-expressions/polyfill.js";
import "whatwg-worker";

const mod1 = module(import.meta, async () => {
  const util = await import("node:util");
  const { default: isOdd } = await import("is-odd");
  const { default: hello } = await import("./hello");
  console.log("util.types.isDate(new Date())", util.types.isDate(new Date()));
  console.log("isOdd(1)", isOdd(1));
  console.log('hello("George")', hello("George"));
});
await import(mod1);

const mod2 = module(import.meta, async () => {
  globalThis.addEventListener("message", async ({ data }) => {
    const e = await import(data);
    console.log(e);
  });
});
const worker = new Worker(mod2, { type: "module" });
worker.postMessage(mod1);
