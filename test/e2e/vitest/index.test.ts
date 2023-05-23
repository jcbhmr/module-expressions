import { test, expect, assert } from "vitest";
import module from "@jcbhmr/module-expressions";

test("works", async () => {
  console.log(
    __vitest_worker__
    // __vitest_worker__.ctx,
    // __vitest_worker__.current
  );
  // const mod = module(import.meta, async () => {
  //   const { inspect } = await import("node:util");
  //   // const { default: isOdd } = await import("is-odd");
  //   const { default: hello } = await import("./hello");

  //   // console.log(hello("world"));
  //   // console.log(isOdd(1));
  // });
  // await import(mod);
});
