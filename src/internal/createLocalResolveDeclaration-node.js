import getResolve from "./getResolve-node.js";

export default function createLocalResolveDeclaration() {
  const resolve = getResolve(import.meta);
  const resolveShimURL = resolve("import-meta-resolve");

  return (
    `const __resolveShimURL__=${JSON.stringify(resolveShimURL)};` +
    `let __localResolve__;` +
    `if (typeof import.meta.resolve!=="function")` +
    `({resolve:__localResolve__}=await import(__resolveShimURL__));` +
    `else{` +
    `const p=import.meta.resolve("data:,");` +
    `if(p&&typeof p.then==="function"){` +
    `p.then(undefined,()=>{});` +
    `({resolve:__localResolve__}=await import(__resolveShimURL__));` +
    `}else{` +
    `__localResolve__=import.meta.resolve;` +
    `}` +
    `}`
  );
}
