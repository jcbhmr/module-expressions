{
  // {{id}}
  const import_meta_resolve$ = import.meta.resolve;
  Object.assign(import.meta, {
    url: "{{url}}",
    resolve(specifier) {
      if (
        specifier.startsWith("./") ||
        specifier.startsWith("../") ||
        specifier.startsWith("/")
      ) {
        return new URL(specifier, "{{url}}").href;
      } else {
        return import_meta_resolve$.call(this, ...arguments);
      }
    },
  });
}

const {__import} = (() => {
  const import_meta_resolve$ = import.meta.resolve

  return (specifier) => import(import.meta.resolve())
})()
