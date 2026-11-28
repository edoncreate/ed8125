"use client";

import { usePlayer } from "@/components/player/PlayerProvider";
import type { PlayerItem } from "@/components/player/state";
import styles from "./PlaylistsView.module.css";

const titleOf = (it: PlayerItem) => (it.type === "audio" ? it.track.title : it.video.title);
const subOf = (it: PlayerItem) =>
  it.type === "audio" ? it.track.subtitle : `One week one beat · ${it.video.published.slice(0, 4)} · video`;

/** Radio: the latest beats as one queue, playable from any row. */
export function RadioView({ queue }: { queue: PlayerItem[] }) {
  const { playFrom, status } = usePlayer();
  return (
    <section className={`${styles.view} ${styles.block}`} aria-label="Radio">
      <div className={styles.row2}>
        <p className={styles.muted}>{queue.length} beats, newest first. Updates with every release.</p>
        <button type="button" className={styles.solid} onClick={() => playFrom(queue, 0)}>
          {queue[0] && status(queue[0]) === "playing" ? "❚❚ Pause" : "▶ Play radio"}
        </button>
      </div>
      <ol className={styles.tracks}>
        {queue.map((it, i) => {
          const st = status(it);
          return (
            <li key={i} data-status={st}>
              <button type="button" className={styles.track} onClick={() => playFrom(queue, i)}>
                <span className={styles.n}>{st === "playing" ? "❚❚" : String(i + 1).padStart(2, "0")}</span>
                <span className={styles.t}>{titleOf(it)}</span>
                <span className={styles.s}>{subOf(it)}</span>
              </button>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
