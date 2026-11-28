"use client";

import { usePlayer } from "@/components/player/PlayerProvider";
import type { PlayerItem } from "@/components/player/state";
import { formatDay } from "@/lib/time";
import { IconPause, IconPlay } from "@/components/ui/icons";
import type { Video } from "@/lib/youtube";
import styles from "./VideoGrid.module.css";

type Props = {
  videos: Video[];
  /** What each tile plays (audio when the beat has some, else the video); same order as `videos`. */
  items?: PlayerItem[];
  /** Show the newest first as a larger tile. */
  feature?: boolean;
};

const plays = new Intl.NumberFormat("en-GB");

/** Grid of one-minute beat videos; clicking plays them in order in the site player. */
export function VideoGrid({ videos, items, feature = false }: Props) {
  const { playFrom, status } = usePlayer();
  const queue: PlayerItem[] = items ?? videos.map((video) => ({ type: "video", video }));

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
                {st === "playing" ? <IconPause /> : <IconPlay className={styles.playGlyph} />}
              </span>
            </button>
            <p className={styles.title}>{v.title}</p>
            <p className={styles.meta}>
              <span>{formatDay(v.published)}</span>
              {v.views !== undefined && (
                <span className={styles.plays}>
                  <IconPlay className={styles.playsIcon} /> {plays.format(v.views)}
                  <span className="visually-hidden"> plays</span>
                </span>
              )}
            </p>
          </li>
        );
      })}
    </ul>
  );
}
