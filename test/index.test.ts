import { test, expect, assert } from "vitest";
import { module, Module } from "../src/index";

test("is a module object", () => {
  const mod = module(import.meta)`
    1 + 1;
  `;
  expect(mod).toBeInstanceOf(Module);
});

test("works with imports", async () => {
  const mod = module(import.meta)`
    import {} from "node:http";
  `;
  expect(await import(mod)).toBeDefined();
});

test("works with exports", async () => {
  const mod = module(import.meta)`
    export const a = 45;
    export const b = "Hi!";
  `;
  expect(await import(mod)).toMatchObject({ a: 45, b: "Hi!" });
});

test("works with npm packages", async () => {
  const mod = module(import.meta)`
    import {} from "vite";
    import {} from "vitest";
  `;
  expect(await import(mod)).toBeDefined();
});
