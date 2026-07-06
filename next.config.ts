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
  distDir: "build",
};

export default nextConfig;
