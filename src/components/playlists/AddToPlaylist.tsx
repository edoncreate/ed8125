"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { IconAddToList, IconCheck } from "@/components/ui/icons";
import { usePlaylists } from "./PlaylistsProvider";
import styles from "./AddToPlaylist.module.css";

/** Add-to-playlist button next to the player: put the current track in one of your playlists, or start a new one. */
export function AddToPlaylist({
  trackKey,
  title,
}: {
  trackKey: string;
  title: string;
}) {
  const { enabled, email, playlists, addTrack, create } = usePlaylists();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  // A note belongs to the track it was about, so it disappears when the track changes.
  const [noteFor, setNoteFor] = useState<{ key: string; text: string } | null>(
    null,
  );
  const note = noteFor?.key === trackKey ? noteFor.text : "";
  const setNote = (text: string) => setNoteFor({ key: trackKey, text });
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    const onDown = (e: PointerEvent) => {
      if (box.current && !box.current.contains(e.target as Node))
        setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onDown);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onDown);
    };
  }, [open]);

  if (!enabled) return null;

  return (
    <div className={styles.wrap} ref={box}>
      <button
        type="button"
        className={`icon-btn ${styles.trigger}`}
        onClick={() => {
          setOpen((o) => !o);
          setNoteFor(null);
        }}
        aria-expanded={open}
        aria-label={`Add ${title} to a playlist`}
        title="Add to playlist"
      >
        <IconAddToList />
      </button>
      {open && (
        <div className={styles.pop} role="dialog" aria-label="Add to playlist">
          <p className={styles.head}>Add to playlist</p>
          {email === undefined ? (
            <p className={styles.muted}>…</p>
          ) : email === null ? (
            <p className={styles.muted}>
              <Link href="/playlists" onClick={() => setOpen(false)}>
                Sign in with your email
              </Link>{" "}
              to make playlists.
            </p>
          ) : (
            <>
              {playlists.length > 0 && (
                <ul className={styles.list}>
                  {playlists.map((p) => {
                    const has = p.tracks.includes(trackKey);
                    return (
                      <li key={p.id}>
                        <button
                          type="button"
                          disabled={has}
                          onClick={async () => {
                            const r = await addTrack(p.id, trackKey);
                            setNote(r.error ?? `Added to ${p.name}.`);
                          }}
                        >
                          <span>{p.name}</span>
                          <span className={has ? styles.inIt : styles.muted}>
                            {has ? (
                              <>
                                <IconCheck /> Added
                              </>
                            ) : (
                              `${p.tracks.length}`
                            )}
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
              <form
                className={styles.new}
                onSubmit={async (e) => {
                  e.preventDefault();
                  const r = await create(name, [trackKey]);
                  setNote(r.error ?? `Added to ${r.playlist?.name}.`);
                  if (!r.error) setName("");
                }}
              >
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="New playlist"
                  aria-label="New playlist name"
                  maxLength={80}
                />
                <button type="submit">Create</button>
              </form>
            </>
          )}
          <p className={styles.note} role="status">
            {note}
          </p>
        </div>
      )}
    </div>
  );
}
