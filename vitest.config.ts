import { fileURLToPath } from "node:url";
import { mergeConfig, defineConfig, configDefaults } from "vitest/config";
import viteConfig from "./vite.config";

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      globals: true,
      environment: "jsdom",
      exclude: [...configDefaults.exclude, "e2e/**"],
      root: fileURLToPath(new URL("./", import.meta.url)),
      // https://vitest.dev/guide/coverage.html
      coverage: {
        provider: "v8",
        reporter: ["html", "text"],
        skipFull: true,
        thresholds: {
          lines: 100,
          functions: 100,
          statements: 100,
          branches: 100,
        },
        cleanOnRerun: false,
        include: ["src/**/*"],
        exclude: ["src/*.ts", "src/types/**/*", "src/**/*.d.ts"],
      },
    },
  }),
)
