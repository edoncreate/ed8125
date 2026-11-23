"use client";

import { useEffect, useState } from "react";
import type { RefObject } from "react";

/**
 * True once the element with `id` has scrolled up past the bottom of `headerRef`
 * (the home header turns solid when the hero is no longer behind it).
 * Pass `null` to disable.
 */
export function useScrolledPast(id: string | null, headerRef: RefObject<HTMLElement | null>) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    if (!id || typeof IntersectionObserver === "undefined") return;
    const el = document.getElementById(id);
    if (!el) return;
    const top = headerRef.current?.offsetHeight ?? 0;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry) setScrolled(!entry.isIntersecting && entry.boundingClientRect.top < 0);
      },
      { rootMargin: `-${top}px 0px 0px 0px` },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [id, headerRef]);

  return scrolled;
}
