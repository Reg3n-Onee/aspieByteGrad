import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: { tsconfigPaths: true }, // so tests can use the same "@/..." imports as the app
  test: {
    environment: "node",
    env: {
      // An in-memory database per test run — nothing touches dev.db, nothing to clean up after.
      DATABASE_PATH: ":memory:",
      JWT_SECRET: "test-only-secret",
    },
    setupFiles: ["./src/test/setup.ts"],
  },
});
