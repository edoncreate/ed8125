"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { usePlayer } from "@/components/player/PlayerProvider";
import type { PlayerItem } from "@/components/player/state";
import { formatDuration, type PlayableTrack } from "@/lib/content";
import { cleanName, resolveTracks, type Playlist } from "./model";
import { usePlaylists } from "./PlaylistsProvider";
import styles from "./PlaylistsView.module.css";

const audioQueue = (tracks: PlayableTrack[]): PlayerItem[] => tracks.map((track) => ({ type: "audio", track }));
const titleOf = (it: PlayerItem) => (it.type === "audio" ? it.track.title : it.video.title);
const subOf = (it: PlayerItem) =>
  it.type === "audio" ? it.track.subtitle : `One week one beat · ${it.video.published.slice(0, 4)} · video`;

export function PlaylistsView({ radio }: { radio: PlayerItem[] }) {
  const { enabled, email, playlists, catalog, loadCatalog } = usePlaylists();
  useEffect(loadCatalog, [loadCatalog]);

  return (
    <div className={styles.view}>
      <RadioBlock queue={radio} />
      <section className={styles.block} aria-labelledby="mine">
        <h2 id="mine" className={styles.h2}>
          My playlists
        </h2>
        {!enabled ? (
          <p className={styles.muted}>Accounts are switching on soon. Radio plays in the meantime.</p>
        ) : email === undefined ? (
          <p className={styles.muted}>…</p>
        ) : email === null ? (
          <SignIn />
        ) : (
          <Mine email={email} playlists={playlists} catalog={catalog} />
        )}
      </section>
      {enabled && email && <Discography catalog={catalog} playlists={playlists} />}
    </div>
  );
}

function RadioBlock({ queue }: { queue: PlayerItem[] }) {
  const { playFrom, status } = usePlayer();
  return (
    <section className={styles.block} aria-labelledby="radio">
      <div className={styles.row2}>
        <div>
          <h2 id="radio" className={styles.h2}>
            Radio
          </h2>
          <p className={styles.muted}>The latest {queue.length} beats, newest first. Updates with every release.</p>
        </div>
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

function SignIn() {
  const { signIn } = usePlaylists();
  const [address, setAddress] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "sent">("idle");
  const [error, setError] = useState("");
  return (
    <form
      className={styles.signin}
      onSubmit={async (e) => {
        e.preventDefault();
        setState("sending");
        setError("");
        const r = await signIn(address);
        if (r.error) {
          setError(r.error);
          setState("idle");
        } else setState("sent");
      }}
    >
      {state === "sent" ? (
        <p role="status">Check your inbox: the sign-in link is on its way to {address}.</p>
      ) : (
        <>
          <label htmlFor="email">Sign in with your email. No password, just a link.</label>
          <div className={styles.inline}>
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="you@example.com"
            />
            <button type="submit" className={styles.solid} disabled={state === "sending"}>
              {state === "sending" ? "Sending…" : "Send link"}
            </button>
          </div>
          {error && <p className={styles.error}>{error}</p>}
          <p className={styles.small}>
            Your email is used only to sign you in and keep your playlists. <Link href="/privacy">Privacy</Link>
          </p>
        </>
      )}
    </form>
  );
}

function Mine({ email, playlists, catalog }: { email: string; playlists: Playlist[]; catalog: Map<string, PlayableTrack> | null }) {
  const { create, signOut, deleteAccount } = usePlaylists();
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  return (
    <>
      <p className={styles.small}>
        Signed in as <b>{email}</b> ·{" "}
        <button type="button" className={styles.link} onClick={() => void signOut()}>
          Sign out
        </button>{" "}
        ·{" "}
        <button
          type="button"
          className={styles.link}
          onClick={async () => {
            if (window.confirm("Delete your account and all your playlists? This can't be undone.")) {
              const r = await deleteAccount();
              if (r.error) setError(r.error);
            }
          }}
        >
          Delete account
        </button>
      </p>
      <form
        className={styles.inline}
        onSubmit={async (e) => {
          e.preventDefault();
          const r = await create(name);
          setError(r.error ?? "");
          if (!r.error) setName("");
        }}
      >
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="New playlist name" aria-label="New playlist name" maxLength={80} />
        <button type="submit" className={styles.solid} disabled={!cleanName(name)}>
          Create
        </button>
      </form>
      {error && <p className={styles.error}>{error}</p>}
      {playlists.length === 0 ? (
        <p className={styles.muted}>No playlists yet. Make one, then add tracks below or with the + in the player.</p>
      ) : (
        playlists.map((p) => <PlaylistCard key={p.id} playlist={p} catalog={catalog} />)
      )}
    </>
  );
}

function PlaylistCard({ playlist, catalog }: { playlist: Playlist; catalog: Map<string, PlayableTrack> | null }) {
  const { rename, remove, removeTrack, moveTrack } = usePlaylists();
  const { playFrom, status } = usePlayer();
  const tracks = catalog ? resolveTracks(playlist.tracks, catalog) : [];
  const queue = audioQueue(tracks);
  const minutes = Math.round(tracks.reduce((s, t) => s + (t.duration ?? 0), 0) / 60);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(playlist.name);

  return (
    <article className={styles.card} aria-label={playlist.name}>
      <div className={styles.row2}>
        {editing ? (
          <form
            className={styles.inline}
            onSubmit={async (e) => {
              e.preventDefault();
              await rename(playlist.id, draft);
              setEditing(false);
            }}
          >
            <input value={draft} onChange={(e) => setDraft(e.target.value)} aria-label="Playlist name" maxLength={80} autoFocus />
            <button type="submit" className={styles.solid}>
              Save
            </button>
          </form>
        ) : (
          <h3 className={styles.h3}>{playlist.name}</h3>
        )}
        <div className={styles.actions}>
          <span className={styles.s}>
            {tracks.length} tracks{minutes ? ` · ${minutes} min` : ""}
          </span>
          <button type="button" className={styles.solid} disabled={!queue.length} onClick={() => playFrom(queue, 0)}>
            ▶ Play
          </button>
          <button type="button" className={styles.link} onClick={() => setEditing((x) => !x)}>
            {editing ? "Cancel" : "Rename"}
          </button>
          <button
            type="button"
            className={styles.link}
            onClick={() => window.confirm(`Delete “${playlist.name}”?`) && void remove(playlist.id)}
          >
            Delete
          </button>
        </div>
      </div>
      {tracks.length > 0 && (
        <ol className={styles.tracks}>
          {tracks.map((t, i) => (
            <li key={`${t.key}-${i}`} data-status={status(queue[i])}>
              <button type="button" className={styles.track} onClick={() => playFrom(queue, i)}>
                <span className={styles.n}>{status(queue[i]) === "playing" ? "❚❚" : String(i + 1).padStart(2, "0")}</span>
                <span className={styles.t}>{t.title}</span>
                <span className={styles.s}>{t.subtitle}</span>
              </button>
              <span className={styles.tools}>
                <button type="button" aria-label={`Move ${t.title} up`} disabled={i === 0} onClick={() => void moveTrack(playlist.id, i, -1)}>
                  ↑
                </button>
                <button type="button" aria-label={`Move ${t.title} down`} disabled={i === tracks.length - 1} onClick={() => void moveTrack(playlist.id, i, 1)}>
                  ↓
                </button>
                <button type="button" aria-label={`Remove ${t.title}`} onClick={() => void removeTrack(playlist.id, i)}>
                  ✕
                </button>
              </span>
            </li>
          ))}
        </ol>
      )}
    </article>
  );
}

function Discography({ catalog, playlists }: { catalog: Map<string, PlayableTrack> | null; playlists: Playlist[] }) {
  const { addTrack } = usePlaylists();
  const { playFrom, status } = usePlayer();
  const [q, setQ] = useState("");
  const [target, setTarget] = useState("");
  const targetId = playlists.some((p) => p.id === target) ? target : (playlists[0]?.id ?? "");
  const targetList = playlists.find((p) => p.id === targetId);

  const all = useMemo(() => (catalog ? [...catalog.values()] : []), [catalog]);
  const shown = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return needle ? all.filter((t) => `${t.title} ${t.subtitle}`.toLowerCase().includes(needle)) : all;
  }, [all, q]);
  const queue = audioQueue(shown);

  return (
    <section className={styles.block} aria-labelledby="disco">
      <h2 id="disco" className={styles.h2}>
        Discography
      </h2>
      <p className={styles.muted}>Everything with audio on the site: {all.length} tracks.</p>
      <div className={styles.inline}>
        <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search titles, volumes, projects" aria-label="Search the discography" />
        {playlists.length > 0 && (
          <select value={targetId} onChange={(e) => setTarget(e.target.value)} aria-label="Add tracks to">
            {playlists.map((p) => (
              <option key={p.id} value={p.id}>
                Add to: {p.name}
              </option>
            ))}
          </select>
        )}
      </div>
      {!catalog ? (
        <p className={styles.muted}>Loading…</p>
      ) : (
        <ol className={`${styles.tracks} ${styles.disco}`}>
          {shown.map((t, i) => {
            const st = status(queue[i]);
            const has = targetList?.tracks.includes(t.key);
            return (
              <li key={t.key} data-status={st}>
                <button type="button" className={styles.track} onClick={() => playFrom(queue, i)}>
                  <span className={styles.n}>{st === "playing" ? "❚❚" : "▶"}</span>
                  <span className={styles.t}>{t.title}</span>
                  <span className={styles.s}>
                    {t.subtitle} · {formatDuration(t.duration)}
                  </span>
                </button>
                {targetList && (
                  <span className={styles.tools}>
                    <button type="button" disabled={has} aria-label={`Add ${t.title} to ${targetList.name}`} onClick={() => void addTrack(targetList.id, t.key)}>
                      {has ? "✓" : "+"}
                    </button>
                  </span>
                )}
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}
