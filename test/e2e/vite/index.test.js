import test from "node:test";
import assert from "node:assert";

test("imports successfully", async () => {
  await import("./dist/index.js");
});
