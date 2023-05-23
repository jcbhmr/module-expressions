import { test, expect, assert } from "vitest";
import Module, { createModule } from "../src/Module";

test("Module can't be constructed", () => {
  // @ts-ignore
  expect(() => new Module()).toThrow(TypeError);
});

test("Module returns data: URL when coerced to string", () => {
  const mod = createModule("", "data:text/javascript,");
  expect(`${mod}`).toBe("data:text/javascript,");
});

test("Module returns source text when coerced", () => {
  const mod = createModule("console.log(1)", "");
  expect(mod.toString()).toBe("console.log(1)");
  expect("" + mod).toBe("console.log(1)");
});

test("Module is importable", async () => {
  const mod = createModule("", "data:text/javascript,");
  // @ts-ignore
  const m = await import(mod);
});
