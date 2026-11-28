"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { usePlayer } from "@/components/player/PlayerProvider";
import type { PlayerItem } from "@/components/player/state";
import type { CatalogSource, CatalogTrack } from "@/lib/catalog";
import { formatDuration } from "@/lib/content";
import { IconCheck, IconClose, IconPause, IconPlay, IconPlus, IconSearch } from "@/components/ui/icons";
import { filterCatalog, type CatalogSort, type LengthBand, type Playlist } from "./model";
import { usePlaylists } from "./PlaylistsProvider";
import styles from "./Discography.module.css";

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
  { id: "catalog", label: "By section" },
  { id: "newest", label: "Newest" },
  { id: "oldest", label: "Oldest" },
  { id: "az", label: "A–Z" },
  { id: "shortest", label: "Shortest" },
  { id: "longest", label: "Longest" },
];

const toggle = <T,>(list: T[], v: T) => (list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);

/** Every audio track on the site, with a filter sidebar; add tracks to one of your playlists. */
export function Discography({ catalog, playlists }: { catalog: Map<string, CatalogTrack> | null; playlists: Playlist[] }) {
  const { addTrack, addTracks } = usePlaylists();
  const { playFrom, status } = usePlayer();
  const [q, setQ] = useState("");
  const [sources, setSources] = useState<CatalogSource[]>([]);
  const [years, setYears] = useState<number[]>([]);
  const [lengths, setLengths] = useState<LengthBand[]>([]);
  const [sort, setSort] = useState<CatalogSort>("catalog");
  const [hideIn, setHideIn] = useState(false);
  const [target, setTarget] = useState("");
  const [panelOpen, setPanelOpen] = useState(false);

  const targetId = playlists.some((p) => p.id === target) ? target : (playlists[0]?.id ?? "");
  const targetList = playlists.find((p) => p.id === targetId);

  const all = useMemo(() => (catalog ? [...catalog.values()] : []), [catalog]);
  const count = (pred: (t: CatalogTrack) => boolean) => all.filter(pred).length;
  const yearsAvailable = useMemo(
    () => [...new Set(all.filter((t) => !sources.length || sources.includes(t.source)).map((t) => t.year))].sort((a, b) => b - a),
    [all, sources],
  );
  const activeYears = years.filter((y) => yearsAvailable.includes(y));
  const shown = useMemo(
    () => filterCatalog(all, { q, sources, years: activeYears, lengths, sort, exclude: hideIn ? targetList?.tracks : undefined }),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- activeYears is derived from years + yearsAvailable
    [all, q, sources, years, yearsAvailable, lengths, sort, hideIn, targetList],
  );
  const queue: PlayerItem[] = shown.map((track) => ({ type: "audio", track }));
  const activeCount = sources.length + activeYears.length + lengths.length + (q ? 1 : 0) + (hideIn ? 1 : 0);
  const missing = targetList ? shown.filter((t) => !targetList.tracks.includes(t.key)) : [];

  const clear = () => {
    setQ("");
    setSources([]);
    setYears([]);
    setLengths([]);
    setSort("catalog");
    setHideIn(false);
  };

  const tags: { label: string; remove: () => void }[] = [
    ...(q ? [{ label: `“${q}”`, remove: () => setQ("") }] : []),
    ...sources.map((s) => ({ label: SOURCES.find((x) => x.id === s)!.label, remove: () => setSources(toggle(sources, s)) })),
    ...activeYears.map((y) => ({ label: String(y), remove: () => setYears(toggle(years, y)) })),
    ...lengths.map((l) => ({ label: LENGTHS.find((x) => x.id === l)!.label, remove: () => setLengths(toggle(lengths, l)) })),
  ];

  // Phones: the filters open as a full-screen sheet, rendered at the top of the page so the
  // header and the player bar can't cover it. Escape or "Show N tracks" closes it.
  useEffect(() => {
    if (!panelOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setPanelOpen(false);
    const wide = window.matchMedia("(min-width: 900px)");
    const onWide = () => wide.matches && setPanelOpen(false);
    document.addEventListener("keydown", onKey);
    wide.addEventListener("change", onWide);
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      wide.removeEventListener("change", onWide);
      document.documentElement.style.overflow = "";
    };
  }, [panelOpen]);

  const panel = (
    <>
          <div className={styles.sideHead}>
            <h3 className={styles.sideTitle}>Filters</h3>
            <button type="button" className={styles.clear} onClick={clear} disabled={!activeCount && sort === "catalog"}>
              Clear all
            </button>
          </div>

          <label className={styles.search}>
            <IconSearch className={styles.searchIcon} />
            <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search" aria-label="Search the discography" />
          </label>

          <Group title="Sort by">
            <div role="radiogroup" aria-label="Sort by" className={styles.options}>
              {SORTS.map((s) => (
                <button key={s.id} type="button" role="radio" aria-checked={sort === s.id} className={styles.radio} onClick={() => setSort(s.id)}>
                  <span className={styles.tick} aria-hidden="true">
                    {sort === s.id && <IconCheck />}
                  </span>
                  {s.label}
                </button>
              ))}
            </div>
          </Group>

          <Group title="Section">
            <div className={styles.options}>
              {SOURCES.map((s) => (
                <Check key={s.id} checked={sources.includes(s.id)} onChange={() => setSources(toggle(sources, s.id))} count={count((t) => t.source === s.id)}>
                  {s.label}
                </Check>
              ))}
            </div>
          </Group>

          <Group title="Year">
            <div className={styles.years} role="group" aria-label="Year">
              {yearsAvailable.map((y) => (
                <button key={y} type="button" aria-pressed={activeYears.includes(y)} onClick={() => setYears(toggle(years, y))}>
                  {y}
                </button>
              ))}
            </div>
          </Group>

          <Group title="Length">
            <div className={styles.options}>
              {LENGTHS.map((l) => (
                <Check key={l.id} checked={lengths.includes(l.id)} onChange={() => setLengths(toggle(lengths, l.id))}>
                  {l.label}
                </Check>
              ))}
            </div>
          </Group>

          {targetList && (
            <Group title="Playlist">
              <Check checked={hideIn} onChange={() => setHideIn(!hideIn)}>
                Hide tracks already in {targetList.name}
              </Check>
            </Group>
          )}

    </>
  );

  return (
    <section className={styles.disco} aria-labelledby="disco">
      {panelOpen &&
        createPortal(
          <div className={styles.sheet} role="dialog" aria-modal="true" aria-label="Filters" id="disco-filters">
            {panel}
            <button type="button" className={styles.done} onClick={() => setPanelOpen(false)}>
              Show {shown.length} {shown.length === 1 ? "track" : "tracks"}
            </button>
          </div>,
          document.body,
        )}
      <header className={styles.head}>
        <h2 id="disco" className={styles.h2}>
          Discography
        </h2>
        <p className={styles.lead}>Everything with audio on the site: {all.length} tracks. Filter, listen, add to a playlist.</p>
      </header>

      <div className={styles.layout}>
        <aside className={styles.side} aria-label="Filters">
          {panel}
        </aside>

        <div className={styles.results}>
          <div className={styles.bar}>
            <p className={styles.count} role="status">
              {shown.length} <span>{shown.length === 1 ? "track" : "tracks"}</span>
            </p>
            <button
              type="button"
              className={styles.filterBtn}
              aria-expanded={panelOpen}
              aria-controls="disco-filters"
              onClick={() => setPanelOpen((o) => !o)}
            >
              Filters{activeCount ? ` · ${activeCount}` : ""}
            </button>
            <div className={styles.actions}>
              <button type="button" className={styles.solid} disabled={!queue.length} onClick={() => playFrom(queue, 0)}>
                <IconPlay /> Play these
              </button>
              {targetList && (
                <button
                  type="button"
                  className={styles.outline}
                  disabled={!missing.length || !activeCount}
                  title={activeCount ? undefined : "Filter first, then add the whole selection"}
                  onClick={() => void addTracks(targetList.id, missing.map((t) => t.key))}
                >
                  <IconPlus /> Add {activeCount && missing.length ? `all ${missing.length}` : "all"} to {targetList.name}
                </button>
              )}
            </div>
          </div>

          <div className={styles.bar2}>
            {playlists.length > 0 && (
              <label className={styles.select}>
                <span>Add to</span>
                <select value={targetId} onChange={(e) => setTarget(e.target.value)} aria-label="Add tracks to">
                  {playlists.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </label>
            )}
            {tags.length > 0 && (
              <ul className={styles.tags} aria-label="Active filters">
                {tags.map((t) => (
                  <li key={t.label}>
                    <button type="button" onClick={t.remove} aria-label={`Remove filter ${t.label}`}>
                      {t.label} <IconClose className={styles.tagX} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {!catalog ? (
            <p className={styles.empty}>Loading…</p>
          ) : shown.length === 0 ? (
            <p className={styles.empty}>
              Nothing matches.{" "}
              <button type="button" className={styles.link} onClick={clear}>
                Clear filters
              </button>
            </p>
          ) : (
            <ol className={styles.list}>
              {shown.map((t, i) => {
                const st = status(queue[i]);
                const has = targetList?.tracks.includes(t.key);
                return (
                  <li key={t.key} data-status={st}>
                    <button type="button" className={styles.track} onClick={() => playFrom(queue, i)} aria-label={`${st === "playing" ? "Pause" : "Play"} ${t.title}`}>
                      <span className={styles.n} aria-hidden="true">
                        {st === "playing" ? <IconPause /> : <IconPlay />}
                      </span>
                      <span className={styles.t}>{t.title}</span>
                      <span className={styles.s}>{t.subtitle}</span>
                      <span className={styles.d}>{formatDuration(t.duration)}</span>
                    </button>
                    {targetList && (
                      <button
                        type="button"
                        className={`icon-btn ${styles.add}`}
                        disabled={has}
                        aria-label={`Add ${t.title} to ${targetList.name}`}
                        title={has ? `In ${targetList.name}` : `Add to ${targetList.name}`}
                        onClick={() => void addTrack(targetList.id, t.key)}
                      >
                        {has ? <IconCheck /> : <IconPlus />}
                      </button>
                    )}
                  </li>
                );
              })}
            </ol>
          )}
        </div>
      </div>
    </section>
  );
}

function Group({ title, children }: { title: string; children: ReactNode }) {
  return (
    <details className={styles.group} open>
      <summary>
        {title}
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="m6 15 6-6 6 6" />
        </svg>
      </summary>
      {children}
    </details>
  );
}

function Check({ checked, onChange, count, children }: { checked: boolean; onChange: () => void; count?: number; children: ReactNode }) {
  return (
    <label className={styles.check}>
      <input type="checkbox" checked={checked} onChange={onChange} />
      <span className={styles.label}>{children}</span>
      {count !== undefined && <span className={styles.num}>{count}</span>}
    </label>
  );
}
