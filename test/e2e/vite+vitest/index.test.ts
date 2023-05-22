import { test, expect, assert } from "vitest";
import module from "@jcbhmr/module-expressions/polyfill";

test("works", async () => {
  const mod = module(import.meta, async () => {
    const { log } = await import("node:util");
    const { default: isOdd } = await import("is-odd");
    const { hello } = await import("./hello");

    log(hello("world"));
    log(isOdd(1));
  });
  await import(mod);
});
