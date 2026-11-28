import type { Metadata } from "next";
import { ButtonLink, Page } from "@/components/page/Page";
import { RadioView } from "@/components/playlists/RadioView";
import { radio, RADIO_SIZE } from "@/lib/content";
import { getChannelVideos } from "@/lib/youtube";

export const metadata: Metadata = {
  title: "Radio",
  description: `The latest ${RADIO_SIZE} ED8125 beats, newest first, back to back.`,
};

export default async function RadioPage() {
  const queue = radio(await getChannelVideos());
  return (
    <Page
      kicker="Radio"
      title="On"
      accent="air."
      lead={<p>The latest beats, back to back. Press play and keep browsing. Want your own order?</p>}
      actions={<ButtonLink href="/playlists">Make a playlist</ButtonLink>}
    >
      <RadioView queue={queue} />
    </Page>
  );
}
