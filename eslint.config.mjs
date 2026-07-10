import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Stray/alternate Next.js build dirs (e2e's per-project builds, e.g.
    // `build-authless/`, `build-prelaunch/`, or a leftover `build-<pid>/`
    // from a manual `next build`) — build output, never source. The
    // `build/**` default above only matches the literal name "build".
    "build-*/**",
    // Claude Code tooling (hooks, skills) — intentionally CommonJS scripts
    // outside the Next.js app's TypeScript/ESLint project, not app source.
    ".claude/**",
    // Generated vitest/istanbul coverage report (HTML + instrumented JS) —
    // build output, not source.
    "coverage/**",
  ]),
]);

export default eslintConfig;
