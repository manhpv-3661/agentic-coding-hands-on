import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pin the workspace root to this project. A stray parent-directory lockfile
  // (~/package-lock.json) otherwise makes Turbopack infer the wrong root, which
  // breaks module resolution during `next build`.
  turbopack: {
    root: __dirname,
  },
  // Use a fresh build dir (already gitignored) instead of the default .next.
  // Avoids a corrupted .next manifest when build + dev outputs get mixed.
  // Overridable via NEXT_DIST_DIR so E2E can produce a second, independent
  // build with different NEXT_PUBLIC_* values baked in (see playwright.config.ts —
  // those vars are inlined at build time, so two servers sharing one build
  // cannot actually differ on them at runtime).
  distDir: process.env.NEXT_DIST_DIR || "build",
};

export default nextConfig;
