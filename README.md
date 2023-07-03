![🚧 Under construction 👷‍♂️](https://i.imgur.com/LEP2R3N.png)

# Bound ESM URLs

🎁 Create a self-contained ESM `blob:` URL from a function

<div align="center">

![](https://i.imgur.com/ZvvtnCH.png)

</div>

## Installation

```sh
npm install esmurl
```

```js
import esmurl from "https://esm.sh/esmurl";
```

## Usage

```js
import esmurl from "esmurl";

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
```
