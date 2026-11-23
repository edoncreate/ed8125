import { collabs, type Collab } from "@content/collabs";
import lostTapesJson from "@content/lost-tapes.json";
import { projects, type Project, type VideoProject } from "@content/projects";
import type { Video } from "./youtube";

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
};

/**
 * Lost Tapes audio is not in git. Locally it is served from public/media/lost-tapes;
 * in production NEXT_PUBLIC_LOST_TAPES_BASE points at the audio host.
 */
export const LOST_TAPES_BASE = (process.env.NEXT_PUBLIC_LOST_TAPES_BASE ?? "/media/lost-tapes").replace(/\/$/, "");

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
    subtitle: `Lost Tapes ${volume.label} · ${t.date?.slice(0, 4) ?? t.year ?? ""}`.trim(),
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

/** "214" → "3:34" */
export function formatDuration(seconds: number | undefined): string {
  if (!seconds || !Number.isFinite(seconds) || seconds < 0) return "–:––";
  const s = Math.round(seconds);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}
