import esmbody from "./esmbody-node.js";

/**
 * @param {ImportMeta} importMeta
 * @param {function} function_
 * @returns {string}
 */
function esmurl(importMeta, function_) {
  const body = esmbody(importMeta, function_);
  // https://github.com/nodejs/node/issues/46557
  return "data:text/javascript," + encodeURIComponent(body);
}

export default esmurl;
export { esmbody };
