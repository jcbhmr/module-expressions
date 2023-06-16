import Module from "./Module.js";
import createSourceText from "./internal/createSourceText.js";

export default function module<R>(importMeta: ImportMeta, function_: () => Promise<R> | R): Module<R extends { __esModule: true } ? R : { default: R }> {
  if (!importMeta || typeof importMeta !== "object") {
    throw new TypeError(`${importMeta} is not an object`);
  }
  if (!("url" in importMeta)) {
    if (typeof process !== "undefined") {
      process.emitWarning("import.meta.url is recommended");
    } else {
      console.warn("import.meta.url is recommended");
    }
  }

  let expression: string;
  if (typeof function_ === 'function') {
    expression = `await (${Function.prototype.toString.call(function_)})()`;
  } else if (typeof function_  === "string") {
    expression = `(${function_})`;
  } else {
    if (typeof process !== "undefined") {
      process.emitWarning(`${function_} is not a function or a string`);
    }  else {
      console.warn(`${function_} is not a function or a string`);
    }
    expression = `(${function_})`
  }

  console.debug(expression)
  const sourceText = createSourceText(importMeta, expression)
  console.debug(sourceText)
  return new Module(sourceText);
}
