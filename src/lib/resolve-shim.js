import { Worker as NodeWorker, receiveMessageOnPort } from "node:worker_threads";

const workerCode = `
import { workerData } from "node:worker_threads";

const { port } = workerData;
port.onmessage = async (e) => {
  /** @type {[Int32Array, string, string | undefined]} */
  const [lockBuffer, specifier, parentURL] = e.data;
  const lock = new Int32Array(lockBuffer);
  /** @type {[string] | [void, any]} */
  // @ts-ignore
  let r = [];
  try {
    r[0] = await import.meta.resolve(specifier, parentURL);
  } catch (e) {
    r[1] = e;
  }
  port.postMessage(r);
  Atomics.store(lock, 0, 1);
  Atomics.notify(lock, 0);
};
`;

/** @type {{ worker: NodeWorker; port: MessagePort } | null | undefined} */
let cache;

/** @returns {MessagePort} */
function getPort() {
  if (!cache) {
    const { port1, port2 } = new MessageChannel();
    // @ts-ignore
    port1.unref();
    // @ts-ignore
    port2.unref();
    const u =
      "data:text/javascript;base64," +
      Buffer.from(workerCode).toString("base64");
    const worker = new NodeWorker(`import(${JSON.stringify(u)})`, {
      eval: true,
      execArgv: process.execArgv.includes("--experimental-import-meta-resolve")
        ? process.execArgv
        : process.execArgv.concat("--experimental-import-meta-resolve"),
      name: "import-meta-resolve",
      workerData: { port: port2 },
      // @ts-ignore
      transferList: [port2],
    });
    worker.unref();
    cache = { worker, port: port1 };
  }
  return cache.port;
}


/**
 * @param {string} specifier
 * @param {string | URL} [parentURL]
 * @returns {string}
 * @this {ImportMeta}
 */
function resolve(specifier, parentURL = undefined) {
  if (
    this.resolve &&
    // @ts-ignore
    this.resolve !== resolve &&
    !this.resolve("data:,").then
  ) {
    // @ts-ignore
    return this.resolve(specifier, parentURL);
  }
  specifier = `${specifier}`;
  if (parentURL === undefined) {
    parentURL = this.url;
  }
  parentURL = `${parentURL}`;

  const port = getPort();

  const lockBuffer = new SharedArrayBuffer(4);
  const lock = new Int32Array(lockBuffer);
  port.postMessage([lockBuffer, specifier, parentURL]);
  Atomics.wait(lock, 0, 0);
  // @ts-ignore
  const r = receiveMessageOnPort(port).message;

  if (r.length == 1) {
    return r[0];
  } else {
    throw r[1];
  }
}

export default resolve;
