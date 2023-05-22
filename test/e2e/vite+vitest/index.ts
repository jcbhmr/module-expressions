import module from "@jcbhmr/module-expressions";

const log = document.getElementById("log")! as HTMLPreElement;
const mod = module(import.meta, async () => {
  const { default: isOdd } = await import("is-odd");
  const { default: hello } = await import("./hello");

  log.append(hello("world") + "\n");
  log.append(isOdd(1) + "\n");
});
// No top-level await in default Vite target
import(mod);
