"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./Reveal.module.css";

type Props = {
  as?: React.ElementType;
  className?: string;
  children?: React.ReactNode;
};

/** Fades up on intersection. Styles only apply under html.js and no-reduced-motion. */
export function Reveal({ as: Tag = "div", className, children }: Props) {
  const ref = useRef<HTMLElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      setShown(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setShown(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <Tag
      ref={ref}
      className={[styles.reveal, shown ? styles.in : "", className].filter(Boolean).join(" ")}
    >
      {children}
    </Tag>
  );
}
