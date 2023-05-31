#!/usr/bin/env tsx
import { mkdir, readFile, writeFile } from "node:fs/promises";
import * as Terser from "terser";
import TS from "typescript";

function transpile(ts: string): string {
  const compilerOptions = {
    removeComments: true,
    target: TS.ScriptTarget.ESNext,
    module: TS.ModuleKind.ESNext,
  } satisfies TS.CompilerOptions;

  const result = TS.transpileModule(ts, { compilerOptions });
  return result.outputText;
}

async function minify(js: string, reserved?: string[]): Promise<string> {
  const options = {
    module: true,
    compress: { unused: false },
    mangle: { reserved },
  } satisfies Terser.MinifyOptions;
  const result = await Terser.minify(js, options);
  return result.code!;
}

const ts = await readFile("src/module-template-node.ts", "utf8");
const js1 = transpile(ts);
const reserved = [...js1.matchAll(/__\w+|TEMPLATE_\w+/g)].map((m) => m[0]);
const js2 = await minify(js1, reserved);
const js3 = `export default ${JSON.stringify(js2)};`;
await writeFile("src/module-template-node.txt.ts", js3);
