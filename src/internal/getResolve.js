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
    throw new TypeError(`${resolve} is not a function`);
  }

  const p = resolve("data:,");
  if (p && typeof p.then === "function") {
    p.then(undefined, () => {});
    throw new TypeError(`${resolve} is not synchronous`);
  }

  return resolve;
}
