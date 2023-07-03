import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    target: "esnext",
    ssr: true,
    lib: {
      entry: "./src/index.ts",
      formats: ["es"],
      fileName: "index",
    },
  },
});
