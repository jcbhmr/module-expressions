import module from "./src/index";

const mod = module(import.meta, () =>
  globalThis.addEventListener("message", async ({ data }) => {
    if (data?.type === "call") {
      const { module, arguments: args } = data;
      const { default: f } = await import(module as string);
      const [result] = await Promise.allSettled([
        Promise.resolve().then(() => f(...args)),
      ]);
      globalThis.postMessage({ type: "settle", ...result });
    }
  })
);

let release: (w: Worker) => void;
let n = 0;
const stream = new ReadableStream<Worker>(
  {
    start: (c) => (release = (w) => c.enqueue(w)),
    async pull(c) {
      if (n >= navigator.hardwareConcurrency) {
        return;
      }
      // @ts-ignore
      c.enqueue(new Worker(mod, { type: "module" }));
      n++;
    },
  },
  { highWaterMark: 0 }
);
const reader = stream.getReader();
const nextWorker = () => reader.read().then(({ value }) => value!);

function greenlet<A extends any[], R>(
  module: Module<{ default: (...args: A) => R }>
): (...args: A) => Promise<R> {
  return async (...args: A): Promise<R> => {
    const worker = await nextWorker();
    worker.postMessage({ type: "call", module, arguments: args });
    return await new Promise((resolve, reject) => {
      const controller = new AbortController();
      const { signal } = controller;
      worker.addEventListener(
        "message",
        ({ data }) => {
          if (data?.type === "settle") {
            const { status, value, reason } = data;
            if (status === "fulfilled") {
              resolve(value);
            } else {
              reject(reason);
            }
            controller.abort();
          }
        },
        { signal }
      );
      worker.addEventListener(
        "error",
        ({ error }) => {
          reject(error);
          controller.abort();
        },
        { signal }
      );
      worker.addEventListener(
        "messageerror",
        ({ data }) => {
          reject(data);
          controller.abort();
        },
        { signal }
      );
    });
  };
}

export default greenlet;
