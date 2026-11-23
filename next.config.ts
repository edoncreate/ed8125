import type { NextConfig } from "next";

const root = import.meta.dirname;

const nextConfig: NextConfig = {
  // Pin the workspace root (a stray package.json/lockfile exists higher up the tree).
  turbopack: { root },
  outputFileTracingRoot: root,
  images: {
    remotePatterns: [{ protocol: "https", hostname: "i.ytimg.com" }],
  },
};

export default nextConfig;
