https://github.com/tc39/proposal-module-expressions
https://github.com/whatwg/html/issues/6911

```js
const mod = module {
  export default () => 42
}
console.log(await import(mod))
```

```js
const mod = module(import.meta, async () => {
  return {
    __esModule: true,
    default: () => 42
  }
})
console.log(await import(mod))
```

```js
const mod = "data:text/javascript," + encodeURIComponent(`
  // ...
  const exports = await (async () => {
    return {
      __esModule: true,
      default: () => 42
    }
  })()
  export const then = r => r(exports)
`)
console.log(await import(mod))
```
