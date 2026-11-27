import type { Metadata } from "next";
import { Page } from "@/components/page/Page";
import { PlaylistsView } from "@/components/playlists/PlaylistsView";
import { radio, RADIO_SIZE } from "@/lib/content";
import { getChannelVideos } from "@/lib/youtube";

export const metadata: Metadata = {
  title: "Playlists",
  description: `Radio plays the latest ${RADIO_SIZE} beats. Sign in with your email to make your own playlists from the whole discography.`,
};

export default async function PlaylistsPage() {
  const queue = radio(await getChannelVideos());
  return (
    <Page
      kicker="Playlists"
      title="Your"
      accent="mix."
      lead={<p>Radio plays the latest beats. Sign in with your email to build playlists from everything on the site.</p>}
    >
      <PlaylistsView radio={queue} />
    </Page>
  );
}
