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

/**
 * Every audio track on the site, the pool listener playlists draw from.
 * Published as /catalog.json; playlists store only the keys.
 */
export function getCatalog(videos: Video[], audio?: BeatAudio): PlayableTrack[] {
  const beats = [...videos]
    .sort((a, b) => b.published.localeCompare(a.published))
    .map((v) => beatToPlayable(v, audio))
    .filter((t): t is PlayableTrack => t !== null);
  const albums = getProjects().flatMap((p) => (p.kind === "album" ? p.tracks.map((t) => albumTrackToPlayable(p, t)) : []));
  const releases = getCollabs().flatMap((c) =>
    (c.releases ?? []).flatMap((r) => r.tracks.map((t, i) => releaseTrackToPlayable(c, r, t, i))),
  );
  const lostTapes = getVolumes().flatMap((vol) => vol.tracks.map((t) => lostTapeToPlayable(vol, t)));
  return [...beats, ...albums, ...releases.filter((t): t is PlayableTrack => t !== null), ...lostTapes];
}
