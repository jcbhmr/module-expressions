import { defineConfig } from "vite";
import dts from "vite-plugin-dts";
import noBundle from "vite-plugin-no-bundle";
import { minify } from "terser";
// @ts-ignore
import virtual from "vite-plugin-virtual/dist/index.mjs";
import { readFile } from "node:fs/promises";

export default defineConfig(async () => {
  const raw = await readFile("src/module-template.js", "utf8");
  const minified = await minify(raw, {
    module: true,
    compress: {
      unused: false,
    },
    mangle: {
      reserved: ["__import", "__exports", "__then"],
    },
  });
  const text = `export default ${JSON.stringify(minified.code)}`;

  return {
    build: {
      lib: {
        entry: ["src/index.ts", "src/polyfill.ts"],
        formats: ["es"],
        fileName: "index",
      },
    },
    plugins: [
      noBundle(),
      virtual({ "virtual:module-template": text }),
      // dts(),
    ],
  };
});
