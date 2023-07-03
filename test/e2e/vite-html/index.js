import esmurl from "esmurl";

async function main() {
  const url = esmurl(import.meta, async () => {
    const { default: isOdd } = await import("is-odd");
    const { hello } = await import("./greetings.js");

    console.log(hello("George"));
    console.log("Is 100 odd? %s", isOdd(100));

    return 42;
  });

  const m = await import(url);
  console.log("Return value is exposed as default export: %s", m.default);
}
main();
