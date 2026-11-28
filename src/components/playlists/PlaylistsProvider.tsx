"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { BASE_PATH } from "@/lib/asset";
import type { CatalogTrack } from "@/lib/catalog";
import { accountsEnabled, supabase } from "@/lib/supabase";
import { addKey, cleanName, moveKey, removeAt, type Playlist } from "./model";

type Result = { error?: string };

type PlaylistsApi = {
  enabled: boolean;
  /** Signed-in email, null when signed out, undefined while checking. */
  email: string | null | undefined;
  playlists: Playlist[];
  catalog: Map<string, CatalogTrack> | null;
  loadCatalog: () => void;
  signIn: (email: string) => Promise<Result>;
  signOut: () => Promise<void>;
  deleteAccount: () => Promise<Result>;
  create: (name: string, tracks?: string[]) => Promise<Result & { playlist?: Playlist }>;
  rename: (id: string, name: string) => Promise<Result>;
  remove: (id: string) => Promise<Result>;
  addTrack: (id: string, key: string) => Promise<Result>;
  addTracks: (id: string, keys: string[]) => Promise<Result>;
  removeTrack: (id: string, index: number) => Promise<Result>;
  moveTrack: (id: string, index: number, delta: number) => Promise<Result>;
};

const Ctx = createContext<PlaylistsApi | null>(null);
const COLUMNS = "id, name, tracks, updated_at";
const friendly = (e: { message: string } | null | undefined) => (e ? { error: e.message } : {});

/** Listener accounts and playlists (Supabase), plus the catalog of tracks they draw from. */
export function PlaylistsProvider({ children }: { children: ReactNode }) {
  const [email, setEmail] = useState<string | null | undefined>(accountsEnabled ? undefined : null);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [catalog, setCatalog] = useState<Map<string, CatalogTrack> | null>(null);
  const catalogLoading = useRef(false);

  const refresh = useCallback(async () => {
    const sb = supabase();
    if (!sb) return;
    const { data } = await sb.from("playlists").select(COLUMNS).order("created_at");
    setPlaylists((data as Playlist[] | null) ?? []);
  }, []);

  useEffect(() => {
    const sb = supabase();
    if (!sb) return;
    const { data } = sb.auth.onAuthStateChange((_event, session) => {
      setEmail(session?.user.email ?? null);
      if (session) void refresh();
      else setPlaylists([]);
    });
    return () => data.subscription.unsubscribe();
  }, [refresh]);

  const loadCatalog = useCallback(() => {
    if (catalogLoading.current) return;
    catalogLoading.current = true;
    fetch(`${BASE_PATH}/catalog.json?v=${process.env.NEXT_PUBLIC_BUILD_ID ?? ""}`)
      .then((r) => (r.ok ? (r.json() as Promise<CatalogTrack[]>) : []))
      .then((list) => setCatalog(new Map(list.map((t) => [t.key, t]))))
      .catch(() => {
        catalogLoading.current = false;
      });
  }, []);

  const update = useCallback(
    async (id: string, change: (p: Playlist) => Partial<Playlist>): Promise<Result> => {
      const sb = supabase();
      const p = playlists.find((x) => x.id === id);
      if (!sb || !p) return { error: "Playlist not found." };
      const patch = change(p);
      setPlaylists((all) => all.map((x) => (x.id === id ? { ...x, ...patch } : x)));
      const { error } = await sb.from("playlists").update(patch).eq("id", id);
      if (error) await refresh();
      return friendly(error);
    },
    [playlists, refresh],
  );

  const api = useMemo<PlaylistsApi>(
    () => ({
      enabled: accountsEnabled,
      email,
      playlists,
      catalog,
      loadCatalog,
      async signIn(address) {
        const sb = supabase();
        if (!sb) return { error: "Accounts are not switched on yet." };
        const { error } = await sb.auth.signInWithOtp({
          email: address.trim(),
          options: { emailRedirectTo: `${window.location.origin}${BASE_PATH}/playlists/` },
        });
        return friendly(error);
      },
      async signOut() {
        await supabase()?.auth.signOut();
      },
      async deleteAccount() {
        const sb = supabase();
        if (!sb) return {};
        const { error } = await sb.rpc("delete_me");
        if (!error) await sb.auth.signOut();
        return friendly(error);
      },
      async create(name, tracks = []) {
        const sb = supabase();
        const clean = cleanName(name);
        if (!sb || !clean) return { error: "Give the playlist a name." };
        const { data, error } = await sb.from("playlists").insert({ name: clean, tracks }).select(COLUMNS).single();
        if (error) return friendly(error);
        setPlaylists((all) => [...all, data as Playlist]);
        return { playlist: data as Playlist };
      },
      rename: (id, name) => (cleanName(name) ? update(id, () => ({ name: cleanName(name) })) : Promise.resolve({ error: "Give the playlist a name." })),
      async remove(id) {
        const sb = supabase();
        if (!sb) return {};
        setPlaylists((all) => all.filter((x) => x.id !== id));
        const { error } = await sb.from("playlists").delete().eq("id", id);
        if (error) await refresh();
        return friendly(error);
      },
      addTrack: (id, key) => update(id, (p) => ({ tracks: addKey(p.tracks, key) })),
      addTracks: (id, keys) => update(id, (p) => ({ tracks: keys.reduce(addKey, p.tracks).slice(0, 500) })),
      removeTrack: (id, index) => update(id, (p) => ({ tracks: removeAt(p.tracks, index) })),
      moveTrack: (id, index, delta) => update(id, (p) => ({ tracks: moveKey(p.tracks, index, delta) })),
    }),
    [email, playlists, catalog, loadCatalog, update, refresh],
  );

  return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
}

export function usePlaylists(): PlaylistsApi {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("usePlaylists must be used inside <PlaylistsProvider>");
  return ctx;
}
