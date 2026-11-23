"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, type ReactNode } from "react";
import { PlayerDock } from "./PlayerDock";
import { current, initialPlayerState, itemKey, playerReducer, type PlayerAction, type PlayerItem, type PlayerState } from "./state";

type PlayerApi = {
  state: PlayerState;
  dispatch: (a: PlayerAction) => void;
  /** Play `queue[index]`; pressing the current item again toggles play/pause. */
  playFrom: (queue: PlayerItem[], index: number) => void;
  /** Is this item loaded (and is it playing)? */
  status: (item: PlayerItem) => "idle" | "playing" | "paused";
};

const PlayerContext = createContext<PlayerApi | null>(null);

/**
 * The site's single audio channel. Lives in the root layout, so playback keeps
 * going while the visitor moves between pages.
 */
export function PlayerProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(playerReducer, initialPlayerState);
  const now = current(state);
  const nowKey = now ? itemKey(now) : null;

  const playFrom = useCallback(
    (queue: PlayerItem[], index: number) => {
      const target = queue[index];
      if (target && nowKey === itemKey(target)) dispatch({ type: "toggle" });
      else dispatch({ type: "load", queue, index });
    },
    [nowKey],
  );

  const status = useCallback(
    (item: PlayerItem) => (nowKey === itemKey(item) ? (state.playing ? "playing" : "paused") : "idle"),
    [nowKey, state.playing],
  );

  // Lets CSS react to sound (the portrait pulses while something plays).
  useEffect(() => {
    document.documentElement.dataset.playing = String(Boolean(now) && state.playing);
  }, [now, state.playing]);

  const api = useMemo(() => ({ state, dispatch, playFrom, status }), [state, playFrom, status]);

  return (
    <PlayerContext.Provider value={api}>
      {children}
      <PlayerDock />
    </PlayerContext.Provider>
  );
}

export function usePlayer(): PlayerApi {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error("usePlayer must be used inside <PlayerProvider>");
  return ctx;
}
