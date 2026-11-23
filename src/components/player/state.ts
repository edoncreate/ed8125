import type { PlayableTrack } from "@/lib/content";
import type { Video } from "@/lib/youtube";

/** One thing the site can play: an audio file or a YouTube video. */
export type PlayerItem = { type: "audio"; track: PlayableTrack } | { type: "video"; video: Video };

export type PlayerState = { queue: PlayerItem[]; index: number; playing: boolean };

export type PlayerAction =
  | { type: "load"; queue: PlayerItem[]; index: number }
  | { type: "toggle" }
  | { type: "play" }
  | { type: "pause" }
  | { type: "next" }
  | { type: "prev" }
  | { type: "ended" }
  | { type: "close" };

export const initialPlayerState: PlayerState = { queue: [], index: 0, playing: false };

export function current(s: PlayerState): PlayerItem | undefined {
  return s.queue[s.index];
}

export function itemKey(item: PlayerItem): string {
  return item.type === "audio" ? item.track.key : `yt:${item.video.id}`;
}

/** One channel for the whole site: loading anything replaces what was playing. */
export function playerReducer(s: PlayerState, a: PlayerAction): PlayerState {
  switch (a.type) {
    case "load": {
      if (a.queue.length === 0) return initialPlayerState;
      const index = Math.min(Math.max(a.index, 0), a.queue.length - 1);
      return { queue: a.queue, index, playing: true };
    }
    case "toggle":
      return s.queue.length ? { ...s, playing: !s.playing } : s;
    case "play":
      return s.queue.length ? { ...s, playing: true } : s;
    case "pause":
      return { ...s, playing: false };
    case "next":
      return s.index < s.queue.length - 1 ? { ...s, index: s.index + 1, playing: true } : s;
    case "prev":
      return s.index > 0 ? { ...s, index: s.index - 1, playing: true } : s;
    case "ended":
      return s.index < s.queue.length - 1 ? { ...s, index: s.index + 1, playing: true } : { ...s, playing: false };
    case "close":
      return initialPlayerState;
  }
}
