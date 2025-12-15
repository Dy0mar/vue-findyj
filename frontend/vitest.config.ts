import { fileURLToPath, URL } from "node:url";
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
        all: true,
        provider: "v8",
        reporter: ["html", "text", "json-summary"],
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
      setupFiles: ["./vitest.setup.ts"],
      typecheck: {
        exclude: ["**/*.spec.ts"],
        include: ["**/*.spec-d.ts"],
      },
    },
    resolve: {
      alias: {
        test: fileURLToPath(new URL("./test", import.meta.url)),
      },
    },
  }),
);
