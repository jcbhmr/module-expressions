import assert from "node:assert"
import { test } from "node:test"
import module  from  "../src/index"

test("works", async () => {
  const mod = module(import.meta, async () => {
    const { inspect } = await import("node:util")
    const { default: isOdd } = await import("is-odd")
    const { default: hello } = await import("./hello")

    console.log(hello("world"))
    console.log(isOdd(1))
  })
  await import(mod)
})
