const resolveShimCode = `
import { Worker as NodeWorker, receiveMessageOnPort } from "node:worker_threads";

const workerCode = \`
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
\`;

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
    const worker = new NodeWorker(\`import(\${JSON.stringify(u)})\`, {
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
  specifier = \`\${specifier}\`;
  if (parentURL === undefined) {
    parentURL = this.url;
  }
  parentURL = \`\${parentURL}\`;

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
`;
const resolveShimURL =
  "data:text/javascript;base64," +
  Buffer.from(resolveShimCode).toString("base64");

// @ts-ignore
if (!import.meta.resolve || import.meta.resolve("data:,").then) {
  const { default: resolve } = await import(resolveShimURL);
  // @ts-ignore
  import.meta.resolve = resolve;
}

const moduleCodeTemplate = `
{
  const moduleId = TEMPLATE_MODULE_ID;
  const moduleURL = TEMPLATE_MODULE_URL;
  const resolveShimURL = TEMPLATE_RESOLVE_SHIM_URL;
  const vitestRoot = TEMPLATE_VITEST_ROOT;

  let vitestRootURL;
  if (vitestRoot) {
    const { pathToFileURL } = await import("node:url");
    vitestRootURL = pathToFileURL(vitestRoot + "/").href;
  }

  let resolve;
  if (globalThis.__originalResolversMap__?.get(moduleId)) {
    resolve = __originalResolversMap__.get(moduleId);
  } else if (import.meta.resolve && !import.meta.resolve("data:,").then) {
    resolve = (specifier, parentURL = moduleURL) => {
      specifier = \`\${specifier}\`;
      if (vitestRootURL && specifier.startsWith("/")) {
        specifier = new URL("." + specifier, vitestRootURL).href;
      }
      return import.meta.resolve(specifier, parentURL);
    };
  } else {
    const { default: importMetaResolve } = await import(resolveShimURL);
    resolve = (specifier, parentURL = moduleURL) => {
      specifier = \`\${specifier}\`;
      if (vitestRootURL && specifier.startsWith("/")) {
        specifier = new URL("." + specifier, vitestRootURL).href;
      }
      return importMetaResolve.call(__importMeta__, specifier, parentURL);
    };
  }

  var __import__ = async (specifier, options = undefined) =>
    import(resolve(specifier), options);

  var __importMeta__ = Object.create(null);
  __importMeta__.url = moduleURL;
  if ("resolve" in import.meta) {
    __importMeta__.resolve = resolve;
  }
}

const __function__ = TEMPLATE_FUNCTION_TEXT;
export default await __function__();
`;

/**
 * @param {ImportMeta} importMeta
 * @param {(...a: any) => any} function_
 * @returns {string}
 */
export default function esmbody(importMeta, function_) {
  const id = Math.random().toString(36).slice(2, 6);

  // @ts-ignore
  globalThis.__originalResolveMap__ ??= new Map();
  // @ts-ignore
  __originalResolveMap__.set(id, importMeta.resolve);

  /** @type {string | undefined} */
  // @ts-ignore
  const vitestRoot = globalThis.__vitest_worker__?.config.root;

  let f = `${function_}`;
  f = f.replaceAll(/(\W)import\(/g, "$1__import__(");
  f = f.replaceAll(/(\W)__vite_ssr_dynamic_import__\(/g, "$1__import__(");
  f = f.replaceAll(/(\W)import\.meta(\W)/g, "$1__importMeta__$2");

  let t = moduleCodeTemplate;
  t = t.replaceAll("TEMPLATE_MODULE_ID", JSON.stringify(id));
  t = t.replaceAll("TEMPLATE_MODULE_URL", JSON.stringify(importMeta.url));
  t = t.replaceAll("TEMPLATE_RESOLVE_SHIM_URL", JSON.stringify(resolveShimURL));
  t = t.replaceAll("TEMPLATE_FUNCTION_TEXT", f);
  t = t.replaceAll("TEMPLATE_VITEST_ROOT", JSON.stringify(vitestRoot));

  return t;
}
