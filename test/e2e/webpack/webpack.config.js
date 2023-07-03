import url from "node:url";

export default {
  entry: "./src/index.js",
  mode: "development",
  output: {
    filename: "main.js",
    path: url.fileURLToPath(new URL("dist", import.meta.url)),
  },
};
