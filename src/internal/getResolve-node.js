import { resolve as resolveShim } from "import-meta-resolve";

/**
 * @param {ImportMeta} importMeta
 * @returns {(specifier: string, parentURL?: string) => string}
 */
export default function getResolve(importMeta) {
  if (!importMeta || typeof importMeta !== "object") {
    throw new TypeError(`${importMeta} is not an object`);
  }
  const { resolve } = importMeta;
  if (typeof resolve !== "function") {
    return resolveShim;
  }

  const p = resolve("data:,");
  if (p && typeof p.then === "function") {
    p.then(undefined, () => {});
    return resolveShim;
  }

  return resolve;
}
