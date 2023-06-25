export default function bindFromFunction(importMeta, function_) {
  if (typeof function_ !== "function") {
    throw  new TypeError(`${function_} is not a function`)
  }

  // Even block-declared functions can be used as expressions.
  const functionExpression = Function.prototype.toString.call(function_);

  let x = functionExpression;
  x = `export default await (${x})()`
  x = replaceAllDynamicImportWithHook(x, importMeta, id);
  x = replaceAllImportMetaWithHook(x, importMeta, id);
  x = injectBestResolve(x, importMeta, id);
  x = resolveDynamicImports(x, importMeta, id);
  x = resolveImportMetaResolve(x, importMeta, id);
  x = injectImportHook(x, importMeta, id);
  x = injectImportMetaHook(x, importMeta, id);
  x = injectExportWrapper(x, importMeta, id);
  return x;
}
