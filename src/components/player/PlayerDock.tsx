"use client";

import { useEffect, useRef, useState } from "react";
import { formatDuration } from "@/lib/content";
import { usePlayer } from "./PlayerProvider";
import { current, itemKey } from "./state";
import { AddToPlaylist } from "@/components/playlists/AddToPlaylist";
import { YouTubeMini } from "./YouTubeMini";
import styles from "./PlayerDock.module.css";

/** Bottom player bar (audio) + floating mini window (YouTube). Hidden until something plays. */
export function PlayerDock() {
  const { state, dispatch } = usePlayer();
  const item = current(state);
  const key = item ? itemKey(item) : null;
  const audio = useRef<HTMLAudioElement>(null);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [failedKey, setFailedKey] = useState<string | null>(null);
  const failed = failedKey !== null && failedKey === key;

  const isAudio = item?.type === "audio";
  const src = item?.type === "audio" ? item.track.src : null;

  useEffect(() => {
    document.documentElement.dataset.dock = String(Boolean(item));
  }, [item]);

  // The reducer is the source of truth; the <audio> element follows it.
  useEffect(() => {
    const el = audio.current;
    if (!el || !isAudio) return;
    if (state.playing) {
      el.play().catch((e: unknown) => {
        if (!(e instanceof DOMException && e.name === "AbortError")) dispatch({ type: "pause" });
      });
    } else {
      el.pause();
    }
  }, [state.playing, isAudio, src, dispatch]);

  if (!item) return null;

  const title = item.type === "audio" ? item.track.title : item.video.title;
  const subtitle = item.type === "audio" ? item.track.subtitle : `One-minute beat · ${item.video.published.slice(0, 4)}`;
  /** A beat playing as audio can switch to its video in place. */
  const watch = item.type === "audio" ? item.track.video : undefined;
  const canPrev = state.index > 0;
  const canNext = state.index < state.queue.length - 1;

  return (
    <aside className={styles.dock} aria-label="Player">
      {item.type === "video" && (
        <div className={styles.video}>
          <YouTubeMini
            videoId={item.video.id}
            playing={state.playing}
            onPlay={() => dispatch({ type: "play" })}
            onPause={() => dispatch({ type: "pause" })}
            onEnded={() => dispatch({ type: "ended" })}
            onError={() => setFailedKey(key)}
          />
        </div>
      )}

      <div className={styles.bar}>
        <button
          type="button"
          className={styles.play}
          onClick={() => dispatch({ type: "toggle" })}
          aria-label={state.playing ? "Pause" : "Play"}
        >
          {state.playing ? "❚❚" : "▶"}
        </button>

        <div className={styles.meta}>
          <b className={styles.title}>{title}</b>
          <span className={styles.sub}>{failed ? "Couldn't play this one — try the next." : subtitle}</span>
        </div>

        <div className={styles.progress}>
          {isAudio ? (
            <>
              <input
                type="range"
                className={styles.seek}
                min={0}
                max={duration || 0}
                step={1}
                value={Math.min(time, duration || 0)}
                onChange={(e) => {
                  if (audio.current) audio.current.currentTime = Number(e.target.value);
                }}
                aria-label="Seek"
                aria-valuetext={`${formatDuration(time)} of ${formatDuration(duration)}`}
                style={{ "--p": `${duration ? (time / duration) * 100 : 0}%` } as React.CSSProperties}
              />
              <span className={styles.time}>
                {formatDuration(time)} / {formatDuration(duration)}
              </span>
            </>
          ) : (
            item.type === "video" && (
              <a href={item.video.url} target="_blank" rel="noopener noreferrer" className={styles.yt}>
                Watch on YouTube ↗
              </a>
            )
          )}
          {watch && (
            <button type="button" className={styles.watch} onClick={() => dispatch({ type: "replace", item: { type: "video", video: watch } })}>
              Watch video
            </button>
          )}
        </div>

        <div className={styles.ctrls}>
          {item.type === "audio" && <AddToPlaylist trackKey={item.track.key} title={item.track.title} />}
          <button type="button" className={styles.prev} onClick={() => dispatch({ type: "prev" })} disabled={!canPrev} aria-label="Previous">
            ⏮
          </button>
          <button type="button" onClick={() => dispatch({ type: "next" })} disabled={!canNext} aria-label="Next">
            ⏭
          </button>
          <button type="button" onClick={() => dispatch({ type: "close" })} aria-label="Close player">
            ✕
          </button>
        </div>
      </div>

      {src && (
        <audio
          key={src}
          ref={audio}
          src={src}
          preload="auto"
          onPlay={() => dispatch({ type: "play" })}
          onPause={(e) => {
            if (!e.currentTarget.ended) dispatch({ type: "pause" });
          }}
          onEnded={() => dispatch({ type: "ended" })}
          onTimeUpdate={(e) => setTime(e.currentTarget.currentTime)}
          onLoadedMetadata={(e) => {
            setTime(0);
            setDuration(e.currentTarget.duration);
            setFailedKey(null);
            if (state.playing) e.currentTarget.play().catch(() => {});
          }}
          onError={() => {
            setFailedKey(key);
            dispatch({ type: "pause" });
          }}
        />
      )}
    </aside>
  );
}
