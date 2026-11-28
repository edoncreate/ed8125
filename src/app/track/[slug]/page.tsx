import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PlayAll, TrackList } from "@/components/music/TrackList";
import { ButtonLink, Page, Section } from "@/components/page/Page";
import { ShareButton } from "@/components/share/ShareButton";
import { asset } from "@/lib/asset";
import { formatDuration } from "@/lib/content";
import { trackPath } from "@/lib/share";
import { getTrackPages, type TrackPage } from "@/lib/tracks";
import { getChannelVideos } from "@/lib/youtube";
import styles from "./track.module.css";

export const dynamicParams = false;

export async function generateStaticParams() {
  return getTrackPages(await getChannelVideos()).map((p) => ({ slug: p.slug }));
}

type Props = { params: Promise<{ slug: string }> };

async function find(slug: string): Promise<TrackPage | undefined> {
  return getTrackPages(await getChannelVideos()).find((p) => p.slug === slug);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const page = await find((await params).slug);
  if (!page) return {};
  const { track, image } = page;
  const description = `${track.subtitle}. A beat by ED8125, Lisboa / Quarteira.`;
  return {
    title: track.title,
    description,
    openGraph: {
      type: "music.song",
      siteName: "ED8125",
      title: `${track.title} · ED8125`,
      description,
      // Metadata URLs resolve against the origin only, so the base path goes in by hand.
      url: asset(`${trackPath(track.key)}/`),
      // No cover (Lost Tapes): the site card, which a page's own openGraph would otherwise drop.
      images: image
        ? [{ url: asset(image), alt: `${track.title} cover` }]
        : [{ url: asset("/opengraph-image.png"), width: 1200, height: 630, alt: "ED8125 — Let's cook some music." }],
    },
  };
}

export default async function TrackPageView({ params }: Props) {
  const page = await find((await params).slug);
  if (!page) notFound();
  const { track, from, queue, index, image, imageKind } = page;

  return (
    <Page
      kicker={
        <>
          <Link href={from.href}>{from.label}</Link>
          {track.duration ? <> · {formatDuration(track.duration)}</> : null}
        </>
      }
      title={track.title}
      lead={<p>{track.subtitle}</p>}
      actions={
        <>
          <PlayAll tracks={queue} start={index}>
            Play
          </PlayAll>
          <ShareButton path={trackPath(track.key)} title={track.title} />
          <ButtonLink href={from.href}>{from.label}</ButtonLink>
        </>
      }
    >
      <div className={`${styles.track} ${image ? "" : styles.noArt}`}>
        {image && (
          <div className={styles.art} data-kind={imageKind}>
            {imageKind === "youtube" ? (
              // eslint-disable-next-line @next/next/no-img-element -- remote YouTube thumbnail, cropped by CSS
              <img src={image} alt={`${track.title} cover`} />
            ) : (
              <Image src={asset(image)} alt={`${track.title} cover`} width={768} height={768} sizes="(max-width: 767px) 100vw, 40vw" />
            )}
          </div>
        )}
        <Section title={`More from ${from.label}`}>
          <TrackList tracks={queue} label={`${from.label} tracklist`} />
        </Section>
      </div>
    </Page>
  );
}
