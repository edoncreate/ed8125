import {
  albumTrackToPlayable,
  beatToPlayable,
  getCollabs,
  getProjects,
  getVolumes,
  lostTapeToPlayable,
  releaseTrackToPlayable,
  type BeatAudio,
  type PlayableTrack,
} from "./content";
import type { Video } from "./youtube";

export type CatalogSource = "beats" | "lost-tapes" | "albums" | "collabs";

/** A playable track plus what the Discography filters need. */
export type CatalogTrack = PlayableTrack & { source: CatalogSource; year: number };

/**
 * Every audio track on the site, the pool listener playlists draw from.
 * Published as /catalog.json; playlists store only the keys.
 */
export function getCatalog(videos: Video[], audio?: BeatAudio): CatalogTrack[] {
  const beats = [...videos]
    .sort((a, b) => b.published.localeCompare(a.published))
    .flatMap((v) => {
      const t = beatToPlayable(v, audio);
      return t ? [{ ...t, source: "beats" as const, year: Number(v.published.slice(0, 4)) }] : [];
    });
  const albums = getProjects().flatMap((p) =>
    p.kind === "album" ? p.tracks.map((t) => ({ ...albumTrackToPlayable(p, t), source: "albums" as const, year: p.year })) : [],
  );
  const releases = getCollabs().flatMap((c) =>
    (c.releases ?? []).flatMap((r) =>
      r.tracks.flatMap((t, i) => {
        const p = releaseTrackToPlayable(c, r, t, i);
        return p ? [{ ...p, source: "collabs" as const, year: r.year }] : [];
      }),
    ),
  );
  const lostTapes = getVolumes().flatMap((vol) =>
    vol.tracks.map((t) => ({
      ...lostTapeToPlayable(vol, t),
      source: "lost-tapes" as const,
      year: Number(t.date?.slice(0, 4) ?? t.year ?? vol.from),
    })),
  );
  return [...beats, ...albums, ...releases, ...lostTapes];
}
