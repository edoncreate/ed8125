"use client";

import { usePlayer } from "@/components/player/PlayerProvider";
import type { PlayerItem } from "@/components/player/state";
import { formatDuration, type PlayableTrack } from "@/lib/content";
import { IconPlay } from "@/components/ui/icons";
import { RowNum } from "./RowNum";
import styles from "./TrackList.module.css";

type Row = PlayableTrack & { n?: string; meta?: string };

/** Numbered track list; a row plays from there through the rest of the list. */
export function TrackList({ tracks, label }: { tracks: Row[]; label: string }) {
  const { playFrom, status } = usePlayer();
  const queue: PlayerItem[] = tracks.map((track) => ({ type: "audio", track }));

  return (
    <ol className={styles.list} aria-label={label}>
      {tracks.map((t, i) => {
        const st = status(queue[i]);
        return (
          <li key={t.key} className={styles.row} data-status={st}>
            <button
              type="button"
              className={styles.btn}
              onClick={() => playFrom(queue, i)}
              aria-label={`${st === "playing" ? "Pause" : "Play"} ${t.title}`}
            >
              <RowNum n={t.n ?? String(i + 1).padStart(2, "0")} status={st} className={styles.n} />
              <span className={styles.title}>{t.title}</span>
              {t.meta && <span className={styles.meta}>{t.meta}</span>}
              <span className={styles.dur}>{formatDuration(t.duration)}</span>
            </button>
          </li>
        );
      })}
    </ol>
  );
}

/** "Play all" for a list of tracks, or for ready-made player items (e.g. a video series: audio where there is some). */
export function PlayAll({
  tracks,
  items,
  children = "Play all",
}: {
  tracks?: PlayableTrack[];
  items?: PlayerItem[];
  children?: React.ReactNode;
}) {
  const { playFrom } = usePlayer();
  const queue: PlayerItem[] = items ?? (tracks ?? []).map((track) => ({ type: "audio", track }));
  if (!queue.length) return null;
  return (
    <button type="button" className={styles.playAll} onClick={() => playFrom(queue, 0)}>
      <IconPlay /> {children}
    </button>
  );
}
