"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRef, useState } from "react";
import { site } from "@content/site";
import { CHAPTER_IDS, ChapterDots } from "./ChapterDots";
import { ThemeToggle } from "./ThemeToggle";
import { useActiveChapter } from "./useActiveChapter";
import { useScrolledPast } from "./useScrolledPast";
import styles from "./Header.module.css";

export const NAV = [
  { href: "/beats", label: "Beats" },
  { href: "/projects", label: "Projects" },
  { href: "/lost-tapes", label: "Lost Tapes" },
  { href: "/collabs", label: "Collabs" },
] as const;

function HomeDots() {
  const active = useActiveChapter(CHAPTER_IDS);
  return <ChapterDots active={active} />;
}

/** Home: fixed, transparent over the hero, chapter dots. Inner pages: sticky, section nav. */
export function Header({ variant }: { variant: "home" | "page" }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLElement>(null);
  const pathname = usePathname();
  const isHome = variant === "home";
  const scrolled = useScrolledPast(isHome ? "intro" : null, ref);

  return (
    <header
      ref={ref}
      className={`${styles.header} ${isHome ? styles.home : styles.page}`}
      data-scrolled={isHome ? String(scrolled) : undefined}
    >
      <Link href="/" className={styles.logo} aria-label="ED8125 home">
        ed8125<b>.</b>
      </Link>

      <div className={styles.center}>
        {isHome ? (
          <HomeDots />
        ) : (
          <nav aria-label="Sections" className={styles.nav}>
            {NAV.map((n) => (
              <Link key={n.href} href={n.href} aria-current={pathname.startsWith(n.href) ? "page" : undefined}>
                {n.label}
              </Link>
            ))}
          </nav>
        )}
      </div>

      <div className={styles.right}>
        <button
          type="button"
          className={styles.menuBtn}
          aria-expanded={open}
          aria-controls="site-menu"
          onClick={() => setOpen((o) => !o)}
        >
          Menu
        </button>
        <div id="site-menu" className={`${styles.menu} ${open ? styles.open : ""}`}>
          <div className={styles.menuNav}>
            {NAV.map((n) => (
              <Link key={n.href} href={n.href} onClick={() => setOpen(false)}>
                {n.label}
              </Link>
            ))}
          </div>
          <a href={site.socials.youtube} target="_blank" rel="noopener noreferrer">
            YouTube ↗
          </a>
          <a href={site.socials.instagram} target="_blank" rel="noopener noreferrer">
            Instagram ↗
          </a>
        </div>
        <ThemeToggle />
      </div>
    </header>
  );
}
