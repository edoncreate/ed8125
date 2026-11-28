"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { usePlayer } from "@/components/player/PlayerProvider";
import type { PlayerItem } from "@/components/player/state";
import type { CatalogSource, CatalogTrack } from "@/lib/catalog";
import { formatDuration, type PlayableTrack } from "@/lib/content";
import { cleanName, filterCatalog, resolveTracks, type CatalogSort, type LengthBand, type Playlist } from "./model";
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

function Mine({ email, playlists, catalog }: { email: string; playlists: Playlist[]; catalog: Map<string, CatalogTrack> | null }) {
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

function PlaylistCard({ playlist, catalog }: { playlist: Playlist; catalog: Map<string, CatalogTrack> | null }) {
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

const SOURCES: { id: CatalogSource; label: string }[] = [
  { id: "beats", label: "One week one beat" },
  { id: "lost-tapes", label: "Lost Tapes" },
  { id: "albums", label: "Brasil com amor" },
  { id: "collabs", label: "Los Maschineros" },
];
const LENGTHS: { id: LengthBand; label: string }[] = [
  { id: "short", label: "Under 2 min" },
  { id: "mid", label: "2–4 min" },
  { id: "long", label: "Over 4 min" },
];
const SORTS: { id: CatalogSort; label: string }[] = [
  { id: "catalog", label: "Sort: by section" },
  { id: "newest", label: "Sort: newest" },
  { id: "oldest", label: "Sort: oldest" },
  { id: "az", label: "Sort: A–Z" },
  { id: "shortest", label: "Sort: shortest" },
  { id: "longest", label: "Sort: longest" },
];

function Discography({ catalog, playlists }: { catalog: Map<string, CatalogTrack> | null; playlists: Playlist[] }) {
  const { addTrack, addTracks } = usePlaylists();
  const { playFrom, status } = usePlayer();
  const [q, setQ] = useState("");
  const [source, setSource] = useState<CatalogSource | undefined>();
  const [year, setYear] = useState<number | undefined>();
  const [length, setLength] = useState<LengthBand | undefined>();
  const [sort, setSort] = useState<CatalogSort>("catalog");
  const [hideIn, setHideIn] = useState(false);
  const [target, setTarget] = useState("");
  const targetId = playlists.some((p) => p.id === target) ? target : (playlists[0]?.id ?? "");
  const targetList = playlists.find((p) => p.id === targetId);

  const all = useMemo(() => (catalog ? [...catalog.values()] : []), [catalog]);
  const counts = useMemo(() => {
    const n = new Map<CatalogSource, number>();
    for (const t of all) n.set(t.source, (n.get(t.source) ?? 0) + 1);
    return n;
  }, [all]);
  const years = useMemo(
    () => [...new Set(all.filter((t) => !source || t.source === source).map((t) => t.year))].sort((a, b) => b - a),
    [all, source],
  );
  const yearInRange = year && years.includes(year) ? year : undefined;
  const shown = useMemo(
    () => filterCatalog(all, { q, source, year: yearInRange, length, sort, exclude: hideIn ? targetList?.tracks : undefined }),
    [all, q, source, yearInRange, length, sort, hideIn, targetList],
  );
  const queue = audioQueue(shown);
  const filtered = Boolean(q || source || yearInRange || length || sort !== "catalog" || hideIn);
  const missing = targetList ? shown.filter((t) => !targetList.tracks.includes(t.key)) : [];

  return (
    <section className={styles.block} aria-labelledby="disco">
      <h2 id="disco" className={styles.h2}>
        Discography
      </h2>
      <p className={styles.muted}>Everything with audio on the site: {all.length} tracks.</p>

      <div className={styles.chips} role="group" aria-label="Section">
        <button type="button" aria-pressed={!source} onClick={() => setSource(undefined)}>
          All <span>{all.length}</span>
        </button>
        {SOURCES.filter((s) => counts.get(s.id)).map((s) => (
          <button key={s.id} type="button" aria-pressed={source === s.id} onClick={() => setSource(source === s.id ? undefined : s.id)}>
            {s.label} <span>{counts.get(s.id)}</span>
          </button>
        ))}
      </div>

      <div className={styles.filters}>
        <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search titles, volumes, projects" aria-label="Search the discography" />
        <select value={yearInRange ?? ""} onChange={(e) => setYear(e.target.value ? Number(e.target.value) : undefined)} aria-label="Year">
          <option value="">All years</option>
          {years.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
        <select value={length ?? ""} onChange={(e) => setLength((e.target.value || undefined) as LengthBand | undefined)} aria-label="Length">
          <option value="">Any length</option>
          {LENGTHS.map((l) => (
            <option key={l.id} value={l.id}>
              {l.label}
            </option>
          ))}
        </select>
        <select value={sort} onChange={(e) => setSort(e.target.value as CatalogSort)} aria-label="Sort">
          {SORTS.map((s) => (
            <option key={s.id} value={s.id}>
              {s.label}
            </option>
          ))}
        </select>
      </div>

      {playlists.length > 0 && (
        <div className={styles.filters}>
          <select value={targetId} onChange={(e) => setTarget(e.target.value)} aria-label="Add tracks to">
            {playlists.map((p) => (
              <option key={p.id} value={p.id}>
                Add to: {p.name}
              </option>
            ))}
          </select>
          <label className={styles.check}>
            <input type="checkbox" checked={hideIn} onChange={(e) => setHideIn(e.target.checked)} /> Hide tracks already in it
          </label>
        </div>
      )}

      <div className={styles.row2}>
        <p className={styles.small} role="status">
          {shown.length} {shown.length === 1 ? "track" : "tracks"}
          {filtered && (
            <>
              {" · "}
              <button
                type="button"
                className={styles.link}
                onClick={() => {
                  setQ("");
                  setSource(undefined);
                  setYear(undefined);
                  setLength(undefined);
                  setSort("catalog");
                  setHideIn(false);
                }}
              >
                Clear filters
              </button>
            </>
          )}
        </p>
        <div className={styles.actions}>
          <button type="button" className={styles.link} disabled={!queue.length} onClick={() => playFrom(queue, 0)}>
            ▶ Play these
          </button>
          {targetList && filtered && missing.length > 0 && (
            <button type="button" className={styles.link} onClick={() => void addTracks(targetList.id, missing.map((t) => t.key))}>
              + Add all {missing.length} to {targetList.name}
            </button>
          )}
        </div>
      </div>

      {!catalog ? (
        <p className={styles.muted}>Loading…</p>
      ) : shown.length === 0 ? (
        <p className={styles.muted}>Nothing matches. Try fewer filters.</p>
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
