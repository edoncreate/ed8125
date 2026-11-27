import type { Metadata } from "next";
import Link from "next/link";
import { Page } from "@/components/page/Page";

export const metadata: Metadata = { title: "Privacy", description: "What ed8125.com stores when you make playlists." };

export default function PrivacyPage() {
  return (
    <Page kicker="Privacy" title="Short" accent="and plain.">
      <div style={{ maxWidth: "40rem", lineHeight: 1.6, paddingBottom: "4rem" }}>
        <p>
          Listening needs no account. If you sign in to make playlists, the site stores your <b>email address</b> and{" "}
          <b>your playlists</b> (names and the tracks in them). That is all.
        </p>
        <p>
          They are kept with Supabase, the service that sends the sign-in link and holds the playlists. They are used only to
          sign you in and show you your playlists: no newsletter, no tracking, no sharing with anyone.
        </p>
        <p>
          You can delete your account at any time on the <Link href="/playlists">Playlists</Link> page (Delete account). That
          removes your email and every playlist straight away.
        </p>
        <p>
          The site saves your sign-in in your browser so you stay signed in, and remembers your light or dark theme. Videos
          play through YouTube’s privacy-enhanced mode (youtube-nocookie.com).
        </p>
      </div>
    </Page>
  );
}
