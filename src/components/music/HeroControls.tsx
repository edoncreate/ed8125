"use client";

import { usePlayer } from "@/components/player/PlayerProvider";
import { current, type PlayerItem } from "@/components/player/state";
import type { PlayableTrack } from "@/lib/content";

/** "▶ Play radio": the Radio playlist (latest beats), newest first. */
export function PlayRadio({ queue, className }: { queue: PlayerItem[]; className?: string }) {
  const { playFrom, status } = usePlayer();
  if (queue.length === 0) return null;
  const playing = status(queue[0]) === "playing";
  return (
    <button type="button" className={className} onClick={() => playFrom(queue, 0)}>
      {playing ? "❚❚ Pause" : "▶ Play radio"}
    </button>
  );
}

/** "((•)) Enter with sound": a toggle for one featured track from the archive. */
export function SoundToggle({ track, className }: { track: PlayableTrack; className?: string }) {
  const { playFrom, status } = usePlayer();
  const item: PlayerItem = { type: "audio", track };
  const on = status(item) === "playing";
  return (
    <button type="button" className={className} aria-pressed={on} onClick={() => playFrom([item], 0)}>
      <b aria-hidden="true">((•))</b> {on ? "Sound on" : "Enter with sound"}
    </button>
  );
}

/** "Now · <title>": what's playing, else the newest upload. */
export function NowCell({ fallback }: { fallback: string }) {
  const { state } = usePlayer();
  const item = current(state);
  const title = item ? (item.type === "audio" ? item.track.title : item.video.title) : fallback;
  return (
    <span aria-live="polite">
      {item && state.playing ? "Playing" : "Latest"} · {title}
    </span>
  );
}
