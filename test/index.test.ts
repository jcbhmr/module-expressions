import test from "node:test";
import assert from "node:assert";
import { module } from "../src/index";

test("produces a data: URL", () => {
  const m = module(import.meta, () => 42);
  assert(`${m}`.startsWith("data:text/javascript,"));
});

test("produces a module with the correct body", () => {
  const m = module(import.meta, () => 42);
  assert(`${m}`.includes("42"));
});

test("import()-able", async () => {
  const m = module(import.meta, () => 42);
  // @ts-ignore
  const { default: value } = await import(m);
  assert.strictEqual(value, 42);
});

test("import() works with node: URLs", async () => {
  const m = module(import.meta, async () => {
    await import("node:fs");
  });
  // @ts-ignore
  await import(m);
});

test("import.meta.url is set", async () => {
  const m = module(import.meta, () => import.meta.url);
  // @ts-ignore
  const { default: url } = await import(m);
  assert.strictEqual(url, import.meta.url);
});

test("import() works with npm packages", async () => {
  const m = module(import.meta, async () => {
    await import("typescript");
  });
  // @ts-ignore
  await import(m);
});

test("import() works with files", async () => {
  const m = module(import.meta, async () => {
    await import("./blank-a.js");
  });
  // @ts-ignore
  await import(m);
});
