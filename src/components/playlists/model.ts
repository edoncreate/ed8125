import type { CatalogSource, CatalogTrack } from "@/lib/catalog";
import type { PlayableTrack } from "@/lib/content";

/** A listener playlist as stored in Supabase: an ordered list of catalog keys. */
export type Playlist = { id: string; name: string; tracks: string[]; updated_at?: string };

export function addKey(tracks: string[], key: string): string[] {
  return tracks.includes(key) ? tracks : [...tracks, key];
}

export function removeAt(tracks: string[], index: number): string[] {
  return tracks.filter((_, i) => i !== index);
}

/** Move the track at `index` by `delta` places (−1 up, +1 down); stops at the ends. */
export function moveKey(tracks: string[], index: number, delta: number): string[] {
  const to = index + delta;
  if (to < 0 || to >= tracks.length) return tracks;
  const next = [...tracks];
  [next[index], next[to]] = [next[to], next[index]];
  return next;
}

export function resolveTracks(keys: string[], catalog: Map<string, PlayableTrack>): PlayableTrack[] {
  return keys.map((k) => catalog.get(k)).filter((x): x is PlayableTrack => Boolean(x));
}

export function cleanName(name: string): string {
  return name.replace(/\s+/g, " ").trim().slice(0, 80);
}

export type LengthBand = "short" | "mid" | "long";
export type CatalogSort = "catalog" | "newest" | "oldest" | "az" | "shortest" | "longest";
/** Empty or missing lists mean "no filter"; several values in one list mean "any of these". */
export type CatalogFilter = {
  q?: string;
  sources?: CatalogSource[];
  years?: number[];
  /** short < 2 min ≤ mid ≤ 4 min < long */
  lengths?: LengthBand[];
  sort?: CatalogSort;
  /** Keys to leave out (e.g. what's already in the playlist). */
  exclude?: string[];
};

const fold = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();

export function lengthBand(seconds = 0): LengthBand {
  return seconds < 120 ? "short" : seconds <= 240 ? "mid" : "long";
}

/** The Discography list after search, filters and sort. Ties keep catalog order. */
export function filterCatalog(tracks: CatalogTrack[], f: CatalogFilter): CatalogTrack[] {
  const needle = f.q ? fold(f.q.trim()) : "";
  const skip = new Set(f.exclude ?? []);
  const any = <T,>(list: T[] | undefined, v: T) => !list?.length || list.includes(v);
  const out = tracks.filter(
    (t) =>
      any(f.sources, t.source) &&
      any(f.years, t.year) &&
      any(f.lengths, lengthBand(t.duration)) &&
      !skip.has(t.key) &&
      (!needle || fold(`${t.title} ${t.subtitle}`).includes(needle)),
  );
  const by: Record<CatalogSort, ((a: CatalogTrack, b: CatalogTrack) => number) | null> = {
    catalog: null,
    newest: (a, b) => b.year - a.year,
    oldest: (a, b) => a.year - b.year,
    az: (a, b) => a.title.localeCompare(b.title, "pt"),
    shortest: (a, b) => (a.duration ?? 0) - (b.duration ?? 0),
    longest: (a, b) => (b.duration ?? 0) - (a.duration ?? 0),
  };
  const cmp = by[f.sort ?? "catalog"];
  return cmp ? [...out].sort(cmp) : out;
}
