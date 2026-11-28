"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { formatDuration } from "@/lib/content";
import { usePlayer } from "./PlayerProvider";
import { current, itemKey } from "./state";
import { AddToPlaylist } from "@/components/playlists/AddToPlaylist";
import { IconClose, IconNext, IconPause, IconPlay, IconPrev } from "@/components/ui/icons";
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
  const href = item.type === "audio" ? item.track.href : "/beats";
  const subtitle = item.type === "audio" ? item.track.subtitle : `One-minute beat · ${item.video.published.slice(0, 4)}`;
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
          {state.playing ? <IconPause /> : <IconPlay className={styles.playGlyph} />}
        </button>

        <div className={styles.meta}>
          <b className={styles.title}>{title}</b>
          {failed ? (
            <span className={styles.sub}>Couldn&apos;t play this one — try the next.</span>
          ) : href ? (
            <Link href={href} className={`${styles.sub} ${styles.subLink}`}>
              {subtitle}
            </Link>
          ) : (
            <span className={styles.sub}>{subtitle}</span>
          )}
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
          ) : null}
        </div>

        <div className={styles.ctrls}>
          {item.type === "audio" && <AddToPlaylist trackKey={item.track.key} title={item.track.title} />}
          <button
            type="button"
            className={`icon-btn ${styles.prev}`}
            onClick={() => dispatch({ type: "prev" })}
            disabled={!canPrev}
            aria-label="Previous"
            title="Previous"
          >
            <IconPrev />
          </button>
          <button
            type="button"
            className="icon-btn"
            onClick={() => dispatch({ type: "next" })}
            disabled={!canNext}
            aria-label="Next"
            title="Next"
          >
            <IconNext />
          </button>
          <button type="button" className="icon-btn" onClick={() => dispatch({ type: "close" })} aria-label="Close player" title="Close">
            <IconClose />
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
