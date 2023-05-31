declare var TEMPLATE_ID: string;
declare var TEMPLATE_URL: string | undefined;
// declare var TEMPLATE_VITE_ROOT: string | undefined;
declare var TEMPLATE_BODY: () => Promise<unknown> | unknown;
declare var TEMPLATE_RESOLVE_PONYFILL_URL: string | undefined;

declare var __resolvers:
  | Record<string, (specifier: string) => string>
  | undefined;

let __import: (specifier: string) => Promise<{}>;
// let __viteImport: (specifier: string) => Promise<{}>;
let __rawExports: unknown;
let __then: (r: (value: any) => unknown) => any;

{
  const url = TEMPLATE_URL;
  if (url) {
    import.meta.url = url;
  }

  const id = TEMPLATE_ID;
  const resolvePonyfillURL = TEMPLATE_RESOLVE_PONYFILL_URL;
  let nativeResolve: ((specifier: string) => string) | undefined;
  if (typeof __resolvers !== "undefined" && id in __resolvers) {
    nativeResolve = __resolvers[id];
  } else if (url && resolvePonyfillURL) {
    const { resolve } = (await import(
      resolvePonyfillURL
    )) as typeof import("import-meta-resolve");
    nativeResolve = (s: string) => resolve(s, url);
  }

  const resolve = import.meta.resolve;
  if (import.meta.resolve) {
    import.meta.resolve = (specifier: string): string => {
      specifier = `${specifier}`;

      if (typeof __resolvers !== "undefined" && id in __resolvers) {
        return __resolvers[id](specifier);
      } else if (
        specifier.startsWith("./") ||
        specifier.startsWith("../") ||
        specifier.startsWith("/")
      ) {
        return `${new URL(specifier, url)}`;
      } else {
        // @ts-ignore
        return nativeResolve(specifier);
      }
    };
  }

  __import = (specifier: string): Promise<{}> => {
    specifier = `${specifier}`;

    if (typeof __resolvers !== "undefined" && id in __resolvers) {
      return import(__resolvers[id](specifier));
    } else if (
      specifier.startsWith("./") ||
      specifier.startsWith("../") ||
      specifier.startsWith("/")
    ) {
      return import(`${new URL(specifier, url)}`);
    } else if (nativeResolve) {
      // @ts-ignore
      return import(nativeResolve(specifier));
    } else {
      return import(specifier);
    }
  };

  __viteImport = (specifier: string): Promise<{}> => {
    specifier = `${specifier}`;

    if (specifier.startsWith("/")) {
      return import(viteRoot + specifier);
    } else {
      return __import(specifier);
    }
  };
}

__rawExports = await TEMPLATE_BODY();

{
  function isESMNamespaceObject(
    exports: unknown
  ): exports is Record<string, unknown> {
    if (!exports) {
      return false;
    }
    if ((exports as { __esModule?: boolean } | null | undefined)?.__esModule) {
      return true;
    }
    if (
      Object.getPrototypeOf(exports) === null &&
      Object.prototype.toString.call(exports).slice(8, -1) !== "Module"
    ) {
      return true;
    }
    return false;
  }

  let ns: Record<string, unknown>;
  if (isESMNamespaceObject(__rawExports)) {
    ns = __rawExports;
  } else {
    ns = Object.create(null);
    ns.__esModule = true;
    ns.default = __rawExports;
  }

  __then = (r) => r(ns);
}

export { __then as then, __rawExports as default };
