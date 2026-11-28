import { collabs, type Collab, type CollabRelease, type ReleaseTrack } from "@content/collabs";
import beatAudioJson from "@content/beat-audio.json";
import lostTapesJson from "@content/lost-tapes.json";
import { projects, type AlbumTrack, type AudioProject, type Project, type VideoProject } from "@content/projects";
import type { PlayerItem } from "@/components/player/state";
import { asset } from "./asset";
import { cleanTrackTitle, slugify } from "./lost-tapes";
import { cleanTitle, type Video } from "./youtube";

export type LostTape = {
  slug: string;
  title: string;
  year: number | null;
  date: string | null;
  note: string | null;
  instrumental: boolean;
  duration: number;
  file: string;
  source: string;
};

export type Volume = {
  id: string;
  label: string;
  /** Year span shown to visitors, from the tracks themselves (e.g. "2020–2021"). */
  span: string;
  from: number;
  to: number;
  tracks: LostTape[];
};

/** A track the player can play: audio file + display info. */
export type PlayableTrack = {
  key: string;
  title: string;
  subtitle: string;
  src: string;
  duration?: number;
  href?: string;
  /** One week one beat: the YouTube video this audio comes from. */
  video?: Video;
};

/**
 * Lost Tapes audio is not in git. Locally it is served from public/media/lost-tapes;
 * in production NEXT_PUBLIC_LOST_TAPES_BASE points at the audio host.
 */
export const LOST_TAPES_BASE = (process.env.NEXT_PUBLIC_LOST_TAPES_BASE ?? asset("/media/lost-tapes")).replace(/\/$/, "");

type RawVolume = Omit<Volume, "span">;

export function getVolumes(): Volume[] {
  return (lostTapesJson as RawVolume[]).map((v) => {
    const years = v.tracks.map((t) => t.year).filter((y): y is number => y != null);
    const from = years.length ? Math.min(v.from, ...years) : v.from;
    const to = years.length ? Math.max(v.to, ...years) : v.to;
    return { ...v, from, to, span: from === to ? String(from) : `${from}–${to}` };
  });
}

export function getVolume(id: string): Volume | undefined {
  return getVolumes().find((v) => v.id === id);
}

export function lostTapeToPlayable(volume: Volume, t: LostTape): PlayableTrack {
  return {
    key: `lt:${volume.id}/${t.slug}`,
    title: t.title,
    subtitle: [`Lost Tapes ${volume.label}`, t.date?.slice(0, 4) ?? t.year].filter(Boolean).join(" · "),
    src: `${LOST_TAPES_BASE}/${t.file}`,
    duration: t.duration,
    href: `/lost-tapes/${volume.id}`,
  };
}

export function totalLostTapes(): number {
  return getVolumes().reduce((n, v) => n + v.tracks.length, 0);
}

export function getProjects(): Project[] {
  return projects;
}

export function getProject(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug);
}

/** The videos of a video project, newest first ("channel" = every upload). */
export function projectVideos(project: VideoProject, all: Video[]): Video[] {
  if (project.videos === "channel") return all;
  const ids = new Set(project.videos);
  return all.filter((v) => ids.has(v.id));
}

export type CollabWithTracks = Collab & { tracks: { volume: Volume; track: LostTape }[] };

export function getCollabs(): CollabWithTracks[] {
  const volumes = getVolumes();
  return collabs.map((c) => {
    const tracks: CollabWithTracks["tracks"] = [];
    for (const volume of volumes) {
      for (const track of volume.tracks) {
        const prefix = c.match?.titlePrefix;
        const byTitle = prefix ? track.title.toLowerCase().startsWith(prefix) : false;
        const byNote = c.match?.notes && track.note ? c.match.notes.includes(track.note.toLowerCase()) : false;
        if (byTitle || byNote) tracks.push({ volume, track });
      }
    }
    return { ...c, tracks };
  });
}

/** An album track (e.g. Brasil com amor) as a player item. */
export function albumTrackToPlayable(project: AudioProject, t: AlbumTrack): PlayableTrack {
  const n = String(t.n).padStart(2, "0");
  return {
    key: `album:${project.slug}/${t.n}`,
    title: t.title,
    subtitle: `${project.title} · ${n}`,
    src: asset(t.src),
    duration: t.duration,
    href: `/projects/${project.slug}`,
  };
}

/** A collab release track as a player item; null until its audio file exists. */
export function releaseTrackToPlayable(
  collab: Pick<Collab, "slug" | "title">,
  release: CollabRelease,
  track: ReleaseTrack,
  index: number,
): PlayableTrack | null {
  if (!track.file) return null;
  const n = String(index + 1).padStart(2, "0");
  return {
    key: `collab:${collab.slug}/${release.id}/${n}`,
    title: track.title,
    subtitle: [`${collab.title} · ${release.label} ${release.title}`, track.producer ? `prod. ${track.producer}` : release.year].join(
      " · ",
    ),
    src: asset(`/media/audio/${collab.slug}/${track.file}`),
    duration: track.duration,
    href: `/collabs#${collab.slug}`,
  };
}

/**
 * Audio for the One week one beat videos (scripts/build-beat-audio.ts), keyed by YouTube id.
 * `episode` is the number on the cover art (01 = the first upload).
 */
export type BeatAudio = Record<string, { file: string; duration: number; episode: number }>;
const beatAudio = beatAudioJson as BeatAudio;

/** Slug of a beat's title: "ED8125 - Vida f€dida #owob" → "vida-f-dida". */
export function beatSlug(title: string): string {
  return slugify(cleanTrackTitle(cleanTitle(title)).title);
}

/** mp3 name for an episode, keeping the cover number: (1, "Temes") → "01-temes.mp3". */
export function beatFileName(episode: number, title: string): string {
  return `${String(episode).padStart(2, "0")}-${beatSlug(title)}.mp3`;
}

/**
 * Reads a yt-dlp download name: "ED8125 - Temes [_CZF_9reLJI].mp3" → id + title;
 * "01 - Clássico [94920601].mp3" (SoundCloud set) → id + title + track number.
 */
export function parseDownloadName(name: string): { id: string; title: string; n?: number } | null {
  const m = /^(.*?)\s*\[([A-Za-z0-9_-]+)\]\.[a-z0-9]+$/i.exec(name);
  if (!m) return null;
  let title = cleanTitle(m[1]).trim();
  const num = /^(\d{1,3})\s*-\s*(.+)$/.exec(title);
  if (num) title = num[2].trim();
  return num ? { id: m[2], title, n: Number(num[1]) } : { id: m[2], title };
}

/** A YouTube beat as an audio track, once its audio is in. */
export function beatToPlayable(video: Video, audio: BeatAudio = beatAudio): PlayableTrack | null {
  const a = audio[video.id];
  if (!a) return null;
  return {
    key: `beat:${video.id}`,
    title: video.title,
    subtitle: `One week one beat #${String(a.episode).padStart(2, "0")} · ${video.published.slice(0, 4)}`,
    src: asset(`/media/beats/${a.file}`),
    duration: a.duration,
    href: "/beats",
    video,
  };
}

/** What the player gets for a beat: its audio when there is some, else the video. */
export function toPlayerItem(video: Video, audio: BeatAudio = beatAudio): PlayerItem {
  const track = beatToPlayable(video, audio);
  return track ? { type: "audio", track } : { type: "video", video };
}

export const RADIO_SIZE = 20;

/** The default "Radio" playlist: the latest beats by release date, as audio where there is some. */
export function radio(videos: Video[], audio: BeatAudio = beatAudio): PlayerItem[] {
  return [...videos]
    .sort((a, b) => b.published.localeCompare(a.published))
    .slice(0, RADIO_SIZE)
    .map((v) => toPlayerItem(v, audio));
}

/** "214" → "3:34" */
export function formatDuration(seconds: number | undefined): string {
  if (!seconds || !Number.isFinite(seconds) || seconds < 0) return "–:––";
  const s = Math.round(seconds);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}
