import { test, expect, assert } from "vitest";
import module from "../src/index";

test("returns something that's import()-able", async () => {
  const mod = module(import.meta, async () => {});
  const n = await import(mod);
  expect(n).toBeDefined();
});

test("returns the same thing when imported twice", async () => {
  const mod = module(import.meta, async () => {});
  const n1 = await import(mod);
  const n2 = await import(mod);
  expect(n).toBe(n2);
});

test("can export things", async () => {
  const mod = module(import.meta, () => {
    return { a: 1, b: 2 };
  });
  const n = await import(mod);
  expect(n).toMatchObject({ a: 1, b: 2 });
});

test("can import things", async () => {
  const mod = module(import.meta, async () => {
    const { Readable } = await import("node:stream");
    const { test } = await import("vitest");
  });
  const n = await import(mod);
  expect(n).toBeDefined();
});

test("can import local files", async () => {
  const mod = module(import.meta, async () => {
    const {} = await import("./x.js");
  });
  const n = await import(mod);
  expect(n).toBeDefined();
});

test("import.meta is correct", async () => {
  const mod = module(import.meta, async () => {
    return { default: import.meta };
  });
  const { default: importMeta } = await import(mod);
  expect(importMeta.url).toBe(import.meta.url);
  expect(importMeta.resolve("./x.js")).toBe(import.meta.resolve("./x.js"));
});
