import "@jcbhmr/module-expressions";
import "whatwg-worker";

const mod1 = module(import.meta, async () => {
  const { readFile } = await import("node:fs/promises");

  // This is the same as "export default". You can also export an object with
  // an '__esModule: true' property to define multiple named exports!
  return async () => JSON.parse(await readFile("package.json", "utf8"));
});
// Use the mod1 as though it were a data: URL.
const { default: fetchPackage } = await import(mod1);
console.log(await fetchPackage());

// We can write our own web worker code without using a separate file!
const mod3 = module(import.meta, async () => {
  globalThis.addEventListener("message", async ({ data }) => {
    const { default: fn } = await import(data.mod);
    globalThis.postMessage(await fn(...data.args));
  });
});
function greenlet(mod) {
  return async (...args) => {
    const worker = new Worker(mod3);
    worker.postMessage({ mod, args });
    return await new Promise((resolve, reject) => {
      worker.addEventListener("message", ({ data }) => resolve(data));
      worker.addEventListener("error", ({ error }) => reject(error));
    }).finally(() => worker.terminate());
  };
}
// And then we can pass in a module block to our greenlet() function that will
// then be executed in the other worker scope! 😱
const fetchPackageGreenlet = greenlet(mod1);
console.log(await fetchPackageGreenlet());
