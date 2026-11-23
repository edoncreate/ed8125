import { Fragment } from "react";
import styles from "./ChapterDots.module.css";

export const CHAPTERS = [
  { id: "intro", label: "Intro" },
  { id: "now", label: "Now" },
  { id: "projects", label: "Projects" },
  { id: "lost-tapes", label: "Lost Tapes" },
  { id: "collabs", label: "Collabs" },
  { id: "about", label: "About" },
] as const;

export type ChapterId = (typeof CHAPTERS)[number]["id"];
export const CHAPTER_IDS: readonly string[] = CHAPTERS.map((c) => c.id);

export function ChapterDots({ active }: { active?: string }) {
  return (
    <nav className={styles.dots} aria-label="Chapters">
      {CHAPTERS.map((c, i) => (
        <Fragment key={c.id}>
          {i > 0 && <span className={styles.line} aria-hidden="true" />}
          <a
            href={`#${c.id}`}
            aria-label={c.label}
            aria-current={active === c.id ? "true" : undefined}
            className={styles.dot}
          >
            {String(i + 1).padStart(2, "0")}
          </a>
        </Fragment>
      ))}
    </nav>
  );
}
