await import("./polyfill");

if (
  (typeof WorkerGlobalScope !== "undefined" &&
    globalThis instanceof WorkerGlobalScope) ||
  (typeof process !== "undefined" &&
    !(await import("node:worker_threads")).isMainThread) ||
  typeof onmessage !== "undefined"
) {
  await import("./message-event-polyfill");
}

export {};
