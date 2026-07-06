import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    globals: true,
    include: [
      "app/**/*.test.{ts,tsx}",
      "lib/**/*.test.ts",
      "tests/unit/**/*.test.{ts,tsx}",
    ],
    exclude: [".claude/**", "node_modules/**", "e2e/**", "build/**"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      include: ["app/**/*.{ts,tsx}", "lib/**/*.ts"],
      exclude: [
        "app/**/*.test.{ts,tsx}",
        "lib/**/*.test.ts",
        "**/*.d.ts",
        "node_modules/**",
      ],
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./"),
    },
  },
});
