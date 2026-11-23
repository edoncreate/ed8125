import type { Metadata } from "next";
import { site } from "@content/site";
import { VideoGrid } from "@/components/music/VideoGrid";
import { Page } from "@/components/page/Page";
import { getChannelVideos } from "@/lib/youtube";

export const revalidate = 3600;
export const metadata: Metadata = { title: "Beats", description: "Every one-minute beat ED8125 has posted, newest first." };

export default async function BeatsPage() {
  const videos = await getChannelVideos();
  return (
    <Page
      kicker={
        <>
          <b>{videos.length}</b> beats · newest first
        </>
      }
      title="Every"
      accent="beat."
      lead={
        <p>
          One-minute beats straight from the studio. Press any of them to play, and keep browsing while it plays. New
          uploads land here within the hour.{" "}
          <a href={site.socials.youtube} target="_blank" rel="noopener noreferrer">
            Subscribe on YouTube ↗
          </a>
        </p>
      }
    >
      <VideoGrid videos={videos} />
    </Page>
  );
}
