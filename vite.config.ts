/// <reference types="vitest" />

import { resolve } from "path";
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";
import { doctest } from "vite-plugin-doctest";

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      name: "tsbuilder",
    },
  },
  plugins: [dts({ rollupTypes: true }), doctest()],
  test: {
    includeSource: ["./src/**/*.test.ts", "./README.md"],
    typecheck: {
      include: ["src/**/*.test.ts"],
    },
  },
});
