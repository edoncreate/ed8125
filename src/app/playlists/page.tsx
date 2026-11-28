import type { Metadata } from "next";
import { Page } from "@/components/page/Page";
import { PlaylistsView } from "@/components/playlists/PlaylistsView";

export const metadata: Metadata = {
  title: "Playlists",
  description: "Sign in with your email to make your own playlists from the whole ED8125 discography.",
};

export default function PlaylistsPage() {
  return (
    <Page
      kicker="Playlists"
      title="Your"
      accent="mix."
      lead={<p>Sign in with your email to build playlists from everything on the site.</p>}
    >
      <PlaylistsView />
    </Page>
  );
}
