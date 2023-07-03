import esmbody from "./esmbody-deno.js";

/**
 * @param {ImportMeta} importMeta
 * @param {(...a: any) => any} function_
 * @returns {string}
 */
export default function esmurl(importMeta, function_) {
  const body = esmbody(importMeta, function_);
  return URL.createObjectURL(new Blob([body], { type: "text/javascript" }));
}
