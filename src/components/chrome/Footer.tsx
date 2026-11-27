import Link from "next/link";
import { site } from "@content/site";
import styles from "./Footer.module.css";

export function Footer() {
  return (
    <footer className={styles.footer}>
      <span>
        © {new Date().getFullYear()} {site.name} · Beats since {site.since}
      </span>
      <span>{site.location.city}</span>
      <span className={styles.links}>
        <a href={site.socials.youtube} target="_blank" rel="noopener noreferrer">
          YouTube ↗
        </a>
        <a href={site.socials.instagram} target="_blank" rel="noopener noreferrer">
          Instagram ↗
        </a>
        <Link href="/privacy">Privacy</Link>
      </span>
      <a href={site.studio.url} target="_blank" rel="noopener noreferrer" className={styles.studio}>
        Site by {site.studio.name} ↗
      </a>
    </footer>
  );
}
