import Image from "next/image";
import type { Collab, CollabRelease } from "@content/collabs";
import { asset } from "@/lib/asset";
import { formatDuration, releaseTrackToPlayable, type PlayableTrack } from "@/lib/content";
import { PlayAll, TrackList } from "./TrackList";
import listStyles from "./TrackList.module.css";
import styles from "./Release.module.css";

/** A released volume: cover, facts, tracklist. Plays here once every track has its audio file. */
export function Release({ collab, release }: { collab: Pick<Collab, "slug" | "title">; release: CollabRelease }) {
  const playable = release.tracks.map((t, i) => releaseTrackToPlayable(collab, release, t, i));
  const ready = playable.every(Boolean) ? (playable as PlayableTrack[]) : null;

  return (
    <article className={styles.release} aria-labelledby={`${collab.slug}-${release.id}`}>
      <Image
        src={asset(release.cover)}
        alt={`${collab.title} ${release.label}: ${release.title} cover`}
        width={500}
        height={500}
        sizes="(max-width: 767px) 100vw, 22rem"
        className={styles.cover}
      />
      <div className={styles.body}>
        <p className="label">
          {release.label} · {release.year} · {release.tracks.length} tracks
        </p>
        <h3 id={`${collab.slug}-${release.id}`} className={styles.title}>
          {release.title}
        </h3>
        {release.description && <p className={styles.desc}>{release.description}</p>}
        {release.credits && <p className={styles.credits}>{release.credits}</p>}
        {ready && (
          <div className={styles.actions}>
            <PlayAll tracks={ready}>Play {release.title}</PlayAll>
          </div>
        )}
        {ready ? (
          <TrackList
            label={`${release.title} tracks`}
            tracks={ready.map((t, i) => ({ ...t, meta: release.tracks[i].producer }))}
          />
        ) : (
          <ol className={listStyles.list} aria-label={`${release.title} tracklist`}>
            {release.tracks.map((t, i) => (
              <li key={t.title} className={`${listStyles.row} ${styles.static}`}>
                <span className={listStyles.n}>{String(i + 1).padStart(2, "0")}</span>
                <span className={listStyles.title}>{t.title}</span>
                {t.producer && <span className={listStyles.meta}>{t.producer}</span>}
                <span className={listStyles.dur}>{t.duration ? formatDuration(t.duration) : ""}</span>
              </li>
            ))}
          </ol>
        )}
      </div>
    </article>
  );
}
