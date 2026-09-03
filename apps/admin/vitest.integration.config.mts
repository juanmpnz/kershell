import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "server-only": new URL("./tests/server-only-shim.ts", import.meta.url)
        .pathname,
    },
    tsconfigPaths: true,
  },
  test: {
    environment: "node",
    include: ["tests/**/*.integration.test.ts"],
    restoreMocks: true,
  },
});
