import Image from "next/image";
import Link from "next/link";
import { site } from "@content/site";
import type { Project } from "@content/projects";
import { PlayAll } from "@/components/music/TrackList";
import { VideoGrid } from "@/components/music/VideoGrid";
import { projectVideos, type CollabWithTracks, type Volume } from "@/lib/content";
import type { Video } from "@/lib/youtube";
import { Chapter } from "./Chapter";
import styles from "./Chapters.module.css";

const hours = (seconds: number) => {
  const m = Math.round(seconds / 60);
  return m >= 60 ? `${Math.floor(m / 60)}h ${String(m % 60).padStart(2, "0")}m` : `${m} min`;
};

const SeeAll = ({ href, children }: { href: string; children: string }) => (
  <Link href={href} className={styles.seeAll}>
    {children} →
  </Link>
);

export function NowChapter({ videos }: { videos: Video[] }) {
  return (
    <Chapter id="now" aside={<SeeAll href="/beats">{`All ${videos.length} beats`}</SeeAll>}>
      <p className={styles.lead}>One-minute beats, straight from the studio. New ones land here as soon as they hit YouTube.</p>
      <VideoGrid videos={videos.slice(0, 9)} feature />
    </Chapter>
  );
}

export function ProjectsChapter({ projects, videos }: { projects: Project[]; videos: Video[] }) {
  return (
    <Chapter id="projects" aside={<SeeAll href="/projects">All projects</SeeAll>}>
      <ProjectCards projects={projects} videos={videos} />
    </Chapter>
  );
}

export function ProjectCards({ projects, videos }: { projects: Project[]; videos: Video[] }) {
  return (
      <ul className={styles.cards}>
        {projects.map((p) => (
          <li key={p.slug} className={styles.card}>
            <Link href={`/projects/${p.slug}`} className={styles.cardArt} aria-label={p.title}>
              {p.kind === "album" ? (
                <Image src={p.cover} alt="" width={768} height={768} sizes="(max-width: 767px) 100vw, 45vw" />
              ) : (
                <span className={styles.mosaic}>
                  {projectVideos(p, videos)
                    .slice(0, 4)
                    .map((v) => (
                      // eslint-disable-next-line @next/next/no-img-element -- remote YouTube thumbnail
                      <img key={v.id} src={v.thumbnail} alt="" loading="lazy" />
                    ))}
                </span>
              )}
            </Link>
            <p className={styles.cardKick}>
              {p.kind === "album" ? "Album" : "Video series"} · {p.year} ·{" "}
              {p.kind === "album" ? `${p.tracks.length} tracks` : `${projectVideos(p, videos).length} beats so far`}
            </p>
            <h3 className={styles.cardTitle}>
              <Link href={`/projects/${p.slug}`}>{p.title}</Link>
            </h3>
            <p className={styles.cardText}>{p.summary}</p>
            {p.kind === "album" && (
              <PlayAll
                tracks={p.tracks.map((t) => ({
                  key: `album:${p.slug}/${t.n}`,
                  title: t.title,
                  subtitle: `${p.title} · ${String(t.n).padStart(2, "0")}`,
                  src: t.src,
                  duration: t.duration,
                  href: `/projects/${p.slug}`,
                }))}
              >
                Play the album
              </PlayAll>
            )}
          </li>
        ))}
      </ul>
  );
}

export function LostTapesChapter({ volumes }: { volumes: Volume[] }) {
  const total = volumes.reduce((n, v) => n + v.tracks.length, 0);
  return (
    <Chapter id="lost-tapes" aside={<SeeAll href="/lost-tapes">{`All ${total} tapes`}</SeeAll>}>
      <p className={styles.lead}>
        Fifteen years of beats that never left the hard drive, in the order they were made.
      </p>
      <VolumeRows volumes={volumes} />
    </Chapter>
  );
}

export function VolumeRows({ volumes }: { volumes: Volume[] }) {
  return (
      <ul className={styles.rows}>
        {volumes.map((v) => (
          <li key={v.id}>
            <Link href={`/lost-tapes/${v.id}`} className={styles.row}>
              <span className={styles.rowTitle}>{v.label}</span>
              <span className={styles.rowYears}>{v.span}</span>
              <span className={styles.rowMeta}>
                {v.tracks.length} beats · {hours(v.tracks.reduce((s, t) => s + t.duration, 0))}
              </span>
              <span className={styles.rowGo} aria-hidden="true">
                →
              </span>
            </Link>
          </li>
        ))}
      </ul>
  );
}

export function CollabsChapter({ collabs }: { collabs: CollabWithTracks[] }) {
  return (
    <Chapter id="collabs" aside={<SeeAll href="/collabs">All collabs</SeeAll>}>
      <ul className={styles.rows}>
        {collabs.map((c) => (
          <li key={c.slug}>
            <Link href={`/collabs#${c.slug}`} className={styles.row}>
              <span className={styles.rowTitle}>{c.title}</span>
              <span className={styles.rowYears}>
                {c.parts?.map((p) => `${p.title}${p.status === "soon" ? " (soon)" : ""}`).join(" · ") ?? "MCs"}
              </span>
              <span className={styles.rowMeta}>{c.tracks.length} tracks in the archive</span>
              <span className={styles.rowGo} aria-hidden="true">
                →
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </Chapter>
  );
}

export function AboutChapter() {
  return (
    <Chapter id="about">
      <div className={styles.about}>
        <p className={styles.big}>
          Beats since <span className={styles.acc}>{site.since}.</span>
        </p>
        <div className={styles.bio}>
          {site.bio.map((p) => (
            <p key={p}>{p}</p>
          ))}
          <div className={styles.follow}>
            <a href={site.socials.youtube} target="_blank" rel="noopener noreferrer" className={styles.pillSolid}>
              Follow on YouTube ↗
            </a>
            <a href={site.socials.instagram} target="_blank" rel="noopener noreferrer" className={styles.pill}>
              Instagram ↗
            </a>
          </div>
        </div>
      </div>
    </Chapter>
  );
}
