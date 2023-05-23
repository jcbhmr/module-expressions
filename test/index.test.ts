import { test, expect, assert } from "vitest";
import "../src/polyfill";
import "whatwg-worker";
import { pEvent } from "p-event";

test("new Worker() works", async () => {
  const mod = module(import.meta, () => {});
  const worker = new Worker(mod, { type: "module" });
});

test("able to pass Module to .postMessage()", async () => {
  const mod = module(import.meta, () => {});
  const worker = new Worker(mod, { type: "module" });
  worker.postMessage(mod);
});

test("it's as close as possible to a Module in the worker", async () => {
  const mod = module(import.meta, () => {
    onmessage = ({ data }) => postMessage(data);
  });
  const worker = new Worker(mod, { type: "module" });
  const p = pEvent(worker, "message");
  worker.postMessage(mod);
  const { data } = await p;
  console.log(data);
  expect(data).toBeTypeOf("string");
});
