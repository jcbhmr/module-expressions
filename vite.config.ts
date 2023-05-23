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
      reserved: ["__import", "__viteSSRImport", "__exports", "__then"],
    },
  });
  return `export default ${JSON.stringify(minified.code!)}`;
}

export default defineConfig(async () => {
  for (const n of ["module-template-vite.js", "module-template-vitest.js"])
  await $`terser src/internal/${}`

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
