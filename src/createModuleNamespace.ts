export default function createModuleNamespace(exportsObject: any): object {
  const moduleNamespace = Object.create(null);
  Object.defineProperty(moduleNamespace, Symbol.toStringTag, {
    value: "Module",
  });

  if (exportsObject?.__esModule) {
    for (const [name, value] of Object.entries(exportsObject)) {
      Object.defineProperty(moduleNamespace, name, {
        get: () => value,
        enumerable: true,
      });
    }
  } else {
    Object.defineProperty(moduleNamespace, "default", {
      get: () => exportsObject,
      enumerable: true,
    });
  }

  return moduleNamespace;
}
