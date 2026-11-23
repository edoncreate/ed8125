import type { NextConfig } from "next";

const root = import.meta.dirname;
/** "/ed8125" on GitHub Pages (edoncreate.github.io/ed8125), "" on a custom domain. */
const basePath = (process.env.NEXT_PUBLIC_BASE_PATH ?? "").replace(/\/$/, "");

const nextConfig: NextConfig = {
  // Static site for GitHub Pages: `next build` writes ./out.
  output: "export",
  trailingSlash: true,
  basePath: basePath || undefined,
  images: { unoptimized: true },
  // Pin the workspace root (a stray package.json/lockfile exists higher up the tree).
  turbopack: { root },
  outputFileTracingRoot: root,
};

export default nextConfig;
