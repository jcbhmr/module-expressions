import { test, assert } from "vitest";
import esmurl from "esmurl";

// @ts-ignore
// console.log("__vitest_worker__", __vitest_worker__);

test("works in vitest", async () => {
  const url = esmurl(import.meta, async () => {
    const { default: isOdd } = await import("is-odd");
    // TODO: Make it possible to 'import("./greetings.ts")'
    const { hello } = await import("./greetings.js");

    console.log(hello("George"));
    console.log("Is 100 odd? %s", isOdd(100));

    return 42;
  });

  const m = await import(url);
  console.log("Return value is exposed as default export: %s", m.default);
});
