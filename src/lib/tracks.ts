import { getCollabs, getProjects, getVolumes, albumTrackToPlayable, beatToPlayable, lostTapeToPlayable, releaseTrackToPlayable, type BeatAudio, type PlayableTrack } from "./content";
import { trackSlug } from "./share";
import type { Video } from "./youtube";

/** What a track's own page needs: the track, where it comes from, and the list it plays on in. */
export type TrackPage = {
  slug: string;
  track: PlayableTrack;
  /** Cover art: a site path (/media/...) or a full URL (YouTube thumbnail). Lost Tapes have none. */
  image?: string;
  /** YouTube thumbnails are 16:9 with the square art in the middle. */
  imageKind?: "square" | "youtube";
  from: { label: string; href: string };
  /** The release the track belongs to, in order; Play starts at `index` and carries on. */
  queue: PlayableTrack[];
  index: number;
};

export function getTrackPages(videos: Video[], audio?: BeatAudio): TrackPage[] {
  const pages: TrackPage[] = [];
  const add = (queue: PlayableTrack[], extra: Omit<TrackPage, "slug" | "track" | "queue" | "index">) =>
    queue.forEach((track, index) => pages.push({ slug: trackSlug(track.key), track, queue, index, ...extra }));

  const beats = [...videos]
    .sort((a, b) => b.published.localeCompare(a.published))
    .flatMap((v) => {
      const t = beatToPlayable(v, audio);
      return t ? [t] : [];
    });
  beats.forEach((track, index) =>
    pages.push({
      slug: trackSlug(track.key),
      track,
      queue: beats,
      index,
      image: track.video?.thumbnail,
      imageKind: "youtube",
      from: { label: "One week one beat", href: "/beats" },
    }),
  );

  for (const p of getProjects()) {
    if (p.kind !== "album") continue;
    add(
      p.tracks.map((t) => albumTrackToPlayable(p, t)),
      { image: p.cover, imageKind: "square", from: { label: p.title, href: `/projects/${p.slug}` } },
    );
  }

  for (const c of getCollabs()) {
    for (const r of c.releases ?? []) {
      const queue = r.tracks.flatMap((t, i) => releaseTrackToPlayable(c, r, t, i) ?? []);
      add(queue, { image: r.cover, imageKind: "square", from: { label: `${c.title} · ${r.title}`, href: `/collabs#${c.slug}-${r.id}` } });
    }
  }

  for (const v of getVolumes()) {
    add(
      v.tracks.map((t) => lostTapeToPlayable(v, t)),
      { from: { label: `Lost Tapes ${v.label}`, href: `/lost-tapes/${v.id}` } },
    );
  }

  return pages;
}
