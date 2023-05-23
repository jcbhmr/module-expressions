import { readFile } from "node:fs/promises";
import { minify } from "terser";
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";
import noBundle from "vite-plugin-no-bundle";
// @ts-ignore
import virtual from "vite-plugin-virtual/dist/index.mjs";

async function f(file: string): Promise<string> {
  const raw = await readFile(file, "utf8");
  const minified = await minify(raw, {
    module: true,
    compress: {
      unused: false,
    },
    mangle: {
      reserved: ["__import", "__viteImport", "__exports", "__then"],
    },
  });
  return `export default ${JSON.stringify(minified.code!)}`;
}

export default defineConfig(async () => {
  const virtualModules = {
    "virtual:module-template": await f("src/module-template.js"),
    "virtual:module-template-vite": await f("src/module-template-vite.js"),
    "virtual:module-template-vitest": await f("src/module-template-vitest.js"),
    "virtual:module-template-webpack": await f(
      "src/module-template-webpack.js"
    ),
  } as const;

  return {
    build: {
      lib: {
        entry: ["src/index.ts", "src/polyfill.ts"],
        formats: ["es"],
        fileName: "index",
      },
    },
    plugins: [noBundle(), virtual(virtualModules), dts()],
  };
});
