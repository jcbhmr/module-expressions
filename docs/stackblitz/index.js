import esmurl from "@jcbhmr/esmurl";

const url = esmurl(import.meta, async () => {
  const url = await import("node:url");
  const { default: isOdd } = await import("is-odd");
  const { hello } = await import("./greetings.js");

  console.log("/ as a file: URL => %s", url.pathToFileURL("/").href);
  console.log(hello("George"));
  console.log("Is 100 odd? %s", isOdd(100));

  return 42;
});

const m = await import(url);
console.log("Return value is exposed as default export: %s", m.default);
