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
