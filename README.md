![🚧 Under construction 👷‍♂️](https://i.imgur.com/LEP2R3N.png)

# Bound ESM URLs

🎁 Create a self-contained ESM `blob:` URL using a function & local
`import.meta`

<div align="center">

![](https://user-images.githubusercontent.com/61068799/248665651-7a5a82a9-e82e-4592-87b6-b3142952a951.png)

</div>

## Installation

```sh
npm install @jcbhmr/esmurl
```

🛑 Currently only Node.js is supported. Check [#5] for more details.

## Usage

```js
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
```

[#5]: https://github.com/jcbhmr/esmurl/issues/5
