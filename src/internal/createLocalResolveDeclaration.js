export default function createLocalResolveDeclaration() {
  return (
    `if (typeof import.meta.resolve!=="function")` +
    "throw new TypeError(`${import.meta.resolve} is not a function`);" +
    `{` +
    `const p=import.meta.resolve("data:,");` +
    `if(p&&typeof p.then==="function"){` +
    `p.then(undefined,()=>{});` +
    "throw new TypeError(`${import.meta.resolve} is not synchronous`);" +
    `}` +
    `}` +
    `const __localResolve__=import.meta.resolve;`
  );
}
