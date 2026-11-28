import type { Metadata, Viewport } from "next";
import { site } from "@content/site";
import "@/styles/globals.css";
import { Footer } from "@/components/chrome/Footer";
import { Grain } from "@/components/chrome/Grain";
import { GridLines } from "@/components/chrome/GridLines";
import { ThemeScript } from "@/components/chrome/ThemeScript";
import { PlayerProvider } from "@/components/player/PlayerProvider";
import { PlaylistsProvider } from "@/components/playlists/PlaylistsProvider";
import { asset } from "@/lib/asset";
import { interTight, manrope, spaceMono } from "@/lib/fonts";

export const metadata: Metadata = {
  // Origin only. Next adds the base path to file-based images (opengraph-image.png) but not to URLs
  // set in metadata objects: pass those through asset().
  metadataBase: new URL(site.origin),
  title: { default: "ED8125 — Beatmaker, bass player, producer", template: "%s · ED8125" },
  description: site.positioning,
  openGraph: { type: "website", siteName: "ED8125" },
  icons: { icon: asset("/media/img/favicon-32.png"), apple: asset("/media/img/favicon-180.png") },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0f0f10" },
    { media: "(prefers-color-scheme: light)", color: "#f4f4f1" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      data-theme="dark"
      className={`${interTight.variable} ${spaceMono.variable} ${manrope.variable}`}
      suppressHydrationWarning
    >
      <head>
        <ThemeScript />
      </head>
      <body>
        <GridLines />
        <Grain />
        <PlaylistsProvider>
          <PlayerProvider>
            {children}
            <Footer />
          </PlayerProvider>
        </PlaylistsProvider>
      </body>
    </html>
  );
}
