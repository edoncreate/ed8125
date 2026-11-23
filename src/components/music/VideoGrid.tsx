"use client";

import { usePlayer } from "@/components/player/PlayerProvider";
import type { PlayerItem } from "@/components/player/state";
import { formatDay } from "@/lib/time";
import type { Video } from "@/lib/youtube";
import styles from "./VideoGrid.module.css";

type Props = {
  videos: Video[];
  /** Show the newest first as a larger tile. */
  feature?: boolean;
};

/** Grid of one-minute beat videos; clicking plays them in order in the site player. */
export function VideoGrid({ videos, feature = false }: Props) {
  const { playFrom, status } = usePlayer();
  const queue: PlayerItem[] = videos.map((video) => ({ type: "video", video }));

  return (
    <ul className={`${styles.grid} ${feature ? styles.feature : ""}`}>
      {videos.map((v, i) => {
        const st = status(queue[i]);
        return (
          <li key={v.id} className={styles.cell} data-status={st}>
            <button
              type="button"
              className={styles.tile}
              onClick={() => playFrom(queue, i)}
              aria-label={`${st === "playing" ? "Pause" : "Play"} ${v.title}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- remote YouTube thumbnail, sized by CSS */}
              <img src={v.thumbnail} alt="" loading="lazy" className={styles.thumb} />
              <span className={styles.badge} aria-hidden="true">
                {st === "playing" ? "❚❚" : "▶"}
              </span>
            </button>
            <p className={styles.title}>{v.title}</p>
            <p className={styles.date}>{formatDay(v.published)}</p>
          </li>
        );
      })}
    </ul>
  );
}
