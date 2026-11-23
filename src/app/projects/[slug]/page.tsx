import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PlayAll, TrackList } from "@/components/music/TrackList";
import { VideoGrid } from "@/components/music/VideoGrid";
import { Page, Section } from "@/components/page/Page";
import { asset } from "@/lib/asset";
import { getProject, getProjects, projectVideos, type PlayableTrack } from "@/lib/content";
import { getChannelVideos } from "@/lib/youtube";
import styles from "./project.module.css";

export const dynamicParams = false;

export function generateStaticParams() {
  return getProjects().map((p) => ({ slug: p.slug }));
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const project = getProject((await params).slug);
  return project ? { title: project.title, description: project.summary } : {};
}

export default async function ProjectPage({ params }: Props) {
  const project = getProject((await params).slug);
  if (!project) notFound();

  const kicker = (
    <>
      <Link href="/projects">Projects</Link> · {project.kind === "album" ? "Album" : "Video series"} · {project.year}
    </>
  );

  if (project.kind === "videos") {
    const videos = projectVideos(project, await getChannelVideos());
    return (
      <Page kicker={kicker} title={project.title} lead={<p>{project.summary}</p>}>
        <Section title={`${videos.length} beats so far · newest first`}>
          <VideoGrid videos={videos} />
        </Section>
      </Page>
    );
  }

  const tracks: (PlayableTrack & { n: string })[] = project.tracks.map((t) => ({
    key: `album:${project.slug}/${t.n}`,
    n: String(t.n).padStart(2, "0"),
    title: t.title,
    subtitle: `${project.title} · ${String(t.n).padStart(2, "0")}`,
    src: asset(t.src),
    duration: t.duration,
    href: `/projects/${project.slug}`,
  }));
  const minutes = Math.round(project.tracks.reduce((s, t) => s + t.duration, 0) / 60);

  return (
    <Page
      kicker={kicker}
      title={project.title}
      lead={<p>{project.summary}</p>}
      actions={<PlayAll tracks={tracks}>Play the album</PlayAll>}
    >
      <div className={styles.album}>
        <div className={styles.covers}>
          <Image src={asset(project.cover)} alt={`${project.title} front cover`} width={768} height={768} sizes="(max-width: 767px) 100vw, 40vw" />
          {project.backCover && (
            <Image src={asset(project.backCover)} alt={`${project.title} back cover`} width={768} height={768} sizes="(max-width: 767px) 50vw, 20vw" className={styles.back} />
          )}
        </div>
        <Section title={`${tracks.length} tracks · ${minutes} min`}>
          <TrackList tracks={tracks} label={`${project.title} tracklist`} />
        </Section>
      </div>
    </Page>
  );
}
