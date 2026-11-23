import type { ReactNode } from "react";
import { CHAPTERS, type ChapterId } from "@/components/chrome/ChapterDots";
import styles from "./Chapter.module.css";

/** A home chapter: top rule, numbered mono kicker and an optional aside (e.g. "See all →"). */
export function Chapter({ id, aside, children }: { id: ChapterId; aside?: ReactNode; children?: ReactNode }) {
  const i = CHAPTERS.findIndex((c) => c.id === id);
  const labelId = `${id}-kicker`;
  return (
    <section id={id} aria-labelledby={labelId} className={styles.chapter}>
      <div className={styles.kick}>
        <h2 id={labelId} className={styles.label}>
          <b>{String(i + 1).padStart(2, "0")}</b> — {CHAPTERS[i].label}
        </h2>
        {aside != null && <div className={styles.aside}>{aside}</div>}
      </div>
      {children}
    </section>
  );
}
