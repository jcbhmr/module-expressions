import esmbody from "#/esmbody.js";

/**
 * @param {ImportMeta} importMeta
 * @param {(...a: any) => any} function_
 * @returns {string}
 */
function esmurl(importMeta, function_) {
  const body = esmbody(importMeta, function_);
  if (URL.createObjectURL) {
    return URL.createObjectURL(new Blob([body], { type: "text/javascript" }));
  } else {
    return "data:text/javascript," + encodeURIComponent(body);
  }
}

export default esmurl;
export { esmbody };
