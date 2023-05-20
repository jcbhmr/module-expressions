export default function module(
  importMeta: ImportMeta,
  bodyBlock: () => PromiseLike<any> | any
): string {
  let bodyBlockCode = `${bodyBlock}`;
  bodyBlockCode = bodyBlockCode.replaceAll("import(", "__import(");

  const moduleCode = `
    // ${Math.random()}
    const import_meta_resolve$ = import.meta.resolve;
    Object.assign(import.meta, {
      url: ${JSON.stringify(importMeta.url)},
      resolve(specifier) {
        if (
          specifier.startsWith("./") ||
          specifier.startsWith("../") ||
          specifier.startsWith("/")
        ) {
          return new URL(specifier, ${JSON.stringify(importMeta.url)}).href;
        } else {
          return import_meta_resolve$.call(this, ...arguments);
        }
      },
    });

    async function __import(specifier) {

    }

    let exports = await (${bodyBlockCode})()
    exports ??= {}
    if (typeof exports !== "object") {
      exports = { default: exports }
    }

    function then(r) {
      r(exports);
    }

    export { then };
  `;

  const blob = new Blob([moduleCode], { type: "text/javascript" });
  return URL.createObjectURL(blob);
}
