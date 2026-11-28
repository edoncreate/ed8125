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
  // Changes every build, so the browser never reuses a cached /catalog.json from an older deploy.
  env: { NEXT_PUBLIC_BUILD_ID: process.env.GITHUB_SHA?.slice(0, 7) ?? String(Date.now()) },
};

export default nextConfig;
