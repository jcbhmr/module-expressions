import Module from "./Module.js";
import createSourceText from "./internal/createSourceText.js";

export default function module(importMeta, function_) {
  const moduleBody = createModuleBody(importMeta, expression);
  const contentURL = createContentURL(moduleBody, "text/javascript");
  return new Module(moduleBody);
}
