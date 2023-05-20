import.meta.url = IMPORT_META_URL;
const __resolve = import.meta.resolve;
import.meta.resolve = (specifier) => {
  specifier = `${specifier}`;
  if (typeof __resolvers !== "undefined" && __resolvers[MODULE_ID]) {
    return __resolvers[MODULE_ID](specifier);
  }
  if (
    specifier.startsWith("./") ||
    specifier.startsWith("../") ||
    specifier.startsWith("/")
  ) {
    return `${new URL(specifier, import.meta.url)}`;
  }
  return __resolve(specifier);
};
const __import = (specifier) => import(import.meta.resolve(specifier));
const __rawExportsObject = await (0, PROCESSED_BODY_BLOCK_CODE)();
const __exports = __rawExportsObject?.__esModule
  ? __rawExportsObject
  : { default: __rawExportsObject };
const __then = (handleResolve, handleReject) => {
  if (typeof handleResolve === "function") {
    handleResolve(__exports);
  }
};
export { __then as then };
