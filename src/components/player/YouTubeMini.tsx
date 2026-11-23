"use client";

import { useEffect, useRef } from "react";

/* Minimal typing for the YouTube IFrame Player API. */
type YTPlayer = {
  loadVideoById(id: string): void;
  playVideo(): void;
  pauseVideo(): void;
  destroy(): void;
};
type YTNamespace = {
  Player: new (
    el: HTMLElement,
    opts: {
      videoId: string;
      host?: string;
      playerVars?: Record<string, number | string>;
      events?: { onReady?: () => void; onStateChange?: (e: { data: number }) => void; onError?: () => void };
    },
  ) => YTPlayer;
};

declare global {
  interface Window {
    YT?: YTNamespace;
    onYouTubeIframeAPIReady?: () => void;
  }
}

let apiPromise: Promise<YTNamespace> | null = null;

function loadApi(): Promise<YTNamespace> {
  if (window.YT?.Player) return Promise.resolve(window.YT);
  apiPromise ??= new Promise((resolve) => {
    const prev = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      prev?.();
      if (window.YT) resolve(window.YT);
    };
    const s = document.createElement("script");
    s.src = "https://www.youtube.com/iframe_api";
    s.async = true;
    document.head.appendChild(s);
  });
  return apiPromise;
}

type Props = {
  videoId: string;
  playing: boolean;
  onPlay: () => void;
  onPause: () => void;
  onEnded: () => void;
  onError: () => void;
};

/** YouTube player that follows the site's play/pause state and reports back. */
export function YouTubeMini({ videoId, playing, onPlay, onPause, onEnded, onError }: Props) {
  const host = useRef<HTMLDivElement>(null);
  const player = useRef<YTPlayer | null>(null);
  const ready = useRef(false);
  const handlers = useRef({ onPlay, onPause, onEnded, onError });
  const loadedId = useRef(videoId);

  useEffect(() => {
    handlers.current = { onPlay, onPause, onEnded, onError };
  });

  useEffect(() => {
    let cancelled = false;
    const el = host.current;
    if (!el) return;
    const mount = document.createElement("div");
    el.appendChild(mount);
    loadApi().then((YT) => {
      if (cancelled) return;
      player.current = new YT.Player(mount, {
        videoId: loadedId.current,
        host: "https://www.youtube-nocookie.com",
        playerVars: { autoplay: 1, playsinline: 1, rel: 0, modestbranding: 1 },
        events: {
          onReady: () => {
            ready.current = true;
            player.current?.playVideo();
          },
          onStateChange: (e) => {
            if (e.data === 1) handlers.current.onPlay();
            else if (e.data === 2) handlers.current.onPause();
            else if (e.data === 0) handlers.current.onEnded();
          },
          onError: () => handlers.current.onError(),
        },
      });
    });
    return () => {
      cancelled = true;
      ready.current = false;
      player.current?.destroy();
      player.current = null;
      el.replaceChildren();
    };
  }, []);

  useEffect(() => {
    if (loadedId.current === videoId) return;
    loadedId.current = videoId;
    if (ready.current) player.current?.loadVideoById(videoId);
  }, [videoId]);

  useEffect(() => {
    if (!ready.current || !player.current) return;
    if (playing) player.current.playVideo();
    else player.current.pauseVideo();
  }, [playing]);

  return <div ref={host} className="yt-host" />;
}
