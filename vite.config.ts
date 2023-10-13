/// <reference types="vitest" />

import { resolve } from "path";
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      name: "tsbuilder",
    },
  },
  plugins: [dts({ rollupTypes: true })],
  test: {
    typecheck: {
      include: ["src/**/*.test.ts"],
    },
  },
});
