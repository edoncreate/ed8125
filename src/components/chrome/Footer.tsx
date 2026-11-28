import Link from "next/link";
import { site } from "@content/site";
import { IconExternal } from "@/components/ui/icons";
import styles from "./Footer.module.css";

export function Footer() {
  return (
    <footer className={styles.footer}>
      <span>
        © {new Date().getFullYear()} {site.name} · Beats since {site.since}
      </span>
      <span>{site.location.city}</span>
      <span className={styles.links}>
        <a href={site.socials.youtube} target="_blank" rel="noopener noreferrer" className="go">
          YouTube <IconExternal className="go-ur" />
        </a>
        <a href={site.socials.instagram} target="_blank" rel="noopener noreferrer" className="go">
          Instagram <IconExternal className="go-ur" />
        </a>
        <Link href="/privacy">Privacy</Link>
      </span>
      <span className={styles.studio}>Site by {site.studio.name}</span>
    </footer>
  );
}
