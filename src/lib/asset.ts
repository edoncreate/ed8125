/**
 * GitHub Pages serves the site from a sub-path (edoncreate.github.io/ed8125) until
 * ed8125.com points at it. next/link adds the base path itself; plain file URLs
 * (audio, images, icons) go through asset().
 */
export const BASE_PATH = (process.env.NEXT_PUBLIC_BASE_PATH ?? "").replace(/\/$/, "");

export function asset(path: string): string {
  return path.startsWith("/") ? `${BASE_PATH}${path}` : path;
}
