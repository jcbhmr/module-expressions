#!/usr/bin/env tsx
import { readFile } from "node:fs/promises";
import { minify } from "terser";

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

