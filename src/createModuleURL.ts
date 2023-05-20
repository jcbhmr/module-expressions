function createImportMetaPreludeCode(importMeta: ImportMeta): string {
  const url = importMeta.url;
  return `
    const import_meta_resolve$ = import.meta.resolve;
    Object.assign(import.meta, {
      url: ${JSON.stringify(url)},
      resolve(specifier) {
        if (
          specifier.startsWith("./") ||
          specifier.startsWith("../") ||
          specifier.startsWith("/")
        ) {
          return new URL(specifier, ${JSON.stringify(url)}).href;
        } else {
          return import_meta_resolve$.call(this, ...arguments);
        }
      },
    });
  `;
}

function createModuleURL(importMeta: ImportMeta, sourceText: string): string {
  const url = importMeta.url;
  const resolve =
    importMeta.resolve ?? ((specifier: string) => `${new URL(specifier, url)}`);

  function replacer(match: string, specifierString: string): string {
    const specifier = specifierString.slice(1, -1);
    const resolved = resolve(specifier);
    return match.replace(specifierString, '"' + resolved + '"');
  }

  let c = sourceText;
  c = c.replaceAll(/import\s+[\w$\s]*?\s+from\s+(["'].*?["'])/dg, replacer);
  c = c.replaceAll(/import\s+(["'].*?["'])/dg, replacer);
  c = c.replaceAll(/export\s+[\w$\s]*?\s+from\s+(["'].*?["'])/dg, replacer);
  c = c.replaceAll(/import\(/g, "__import(");
  c = "const __import=s=>import(import.meta.resolve(s));\n" + c;
  c = createImportMetaPreludeCode(importMeta) + ";\n" + c;

  return URL.createObjectURL(new Blob([c], { type: "text/javascript" }));
}

export default createModuleURL;
