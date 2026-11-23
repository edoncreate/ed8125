import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PlayAll, TrackList } from "@/components/music/TrackList";
import { Page, Section } from "@/components/page/Page";
import { getVolume, getVolumes, lostTapeToPlayable } from "@/lib/content";
import styles from "./volume.module.css";

export const dynamicParams = false;

export function generateStaticParams() {
  return getVolumes().map((v) => ({ volume: v.id }));
}

type Props = { params: Promise<{ volume: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const v = getVolume((await params).volume);
  return v ? { title: `Lost Tapes ${v.label}`, description: `${v.tracks.length} ED8125 beats from ${v.span}.` } : {};
}

export default async function VolumePage({ params }: Props) {
  const volume = getVolume((await params).volume);
  if (!volume) notFound();

  const all = getVolumes();
  const i = all.findIndex((v) => v.id === volume.id);
  const prev = all[i - 1];
  const next = all[i + 1];
  const tracks = volume.tracks.map((t, n) => ({
    ...lostTapeToPlayable(volume, t),
    n: String(n + 1).padStart(2, "0"),
    meta: [t.date?.slice(0, 4) ?? t.year, t.note && `w/ ${t.note}`].filter(Boolean).join(" · "),
  }));
  const hours = Math.round(volume.tracks.reduce((s, t) => s + t.duration, 0) / 60);

  return (
    <Page
      kicker={
        <>
          <Link href="/lost-tapes">Lost Tapes</Link> · <b>{volume.tracks.length}</b> beats · {hours} min
        </>
      }
      title={volume.label === volume.id ? volume.span : volume.label}
      accent={volume.label === volume.id ? undefined : volume.span}
      actions={<PlayAll tracks={tracks}>Play the volume</PlayAll>}
    >
      <Section title="Tracklist · oldest first">
        <TrackList tracks={tracks} label={`Lost Tapes ${volume.label}`} />
      </Section>
      <nav className={styles.pager} aria-label="Other volumes">
        {prev ? <Link href={`/lost-tapes/${prev.id}`}>← {prev.label} · {prev.span}</Link> : <span />}
        {next ? <Link href={`/lost-tapes/${next.id}`}>{next.label} · {next.span} →</Link> : <span />}
      </nav>
    </Page>
  );
}
