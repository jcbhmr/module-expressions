import esmbody from "./esmbody.js";
import createContentURL from "#/internal/createContentURL.js";

/**
 * @param {ImportMeta} importMeta
 * @param {function} function_
 * @returns {string}
 */
function esmurl(importMeta, function_) {
  const body = esmbody(importMeta, function_);
  return createContentURL(body, "text/javascript");
}

export default esmurl;
export { esmbody };
