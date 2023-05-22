import module from "@jcbhmr/module-expressions/polyfill";

const mod = module(import.meta, async () => {
  const { default: isOdd } = await import("is-odd");
  const { default: hello } = await import("./hello");

  document.body.append(hello("world") + "\n");
  document.body.append(isOdd(1) + "\n");
});
import(/* @vite-ignore */ mod);
