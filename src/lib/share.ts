import { BASE_PATH } from "./asset";

/** URL-safe slug of a catalog key: "lt:vol-2/da-nostalgia" → "lt-vol-2-da-nostalgia". */
export function trackSlug(key: string): string {
  return key.replace(/[:/]+/g, "-");
}

/** Every catalog track has its own page, so a shared link previews that track. */
export function trackPath(key: string): string {
  return `/track/${trackSlug(key)}`;
}

/** Full link for a site path, with the trailing slash the static export serves: "/collabs#x" → ".../collabs/#x". */
export function shareUrl(path: string, origin: string): string {
  const [p, hash] = path.split("#");
  const withSlash = p.endsWith("/") ? p : `${p}/`;
  return `${origin}${BASE_PATH}${withSlash}${hash ? `#${hash}` : ""}`;
}
