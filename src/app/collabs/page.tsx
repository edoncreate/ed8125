import type { Metadata } from "next";
import { TrackList } from "@/components/music/TrackList";
import { Page, Section } from "@/components/page/Page";
import { getCollabs, lostTapeToPlayable } from "@/lib/content";
import styles from "./collabs.module.css";

export const metadata: Metadata = { title: "Collabs", description: "Los Maschineros and beats made for MC friends." };

export default function CollabsPage() {
  const collabs = getCollabs();
  return (
    <Page kicker="Collabs" title="Made" accent="together." lead={<p>Projects with friends and beats made for MCs.</p>}>
      {collabs.map((c) => (
        <Section key={c.slug} id={c.slug}>
          <div className={styles.head}>
            <h2 className={styles.title}>{c.title}</h2>
            {c.parts && (
              <ul className={styles.parts}>
                {c.parts.map((p) => (
                  <li key={p.title} className="label">
                    {p.title} · {p.status === "soon" ? "coming soon" : "out now"}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <p className={styles.summary}>{c.summary}</p>
          {c.tracks.length > 0 && (
            <TrackList
              label={`${c.title} tracks`}
              tracks={c.tracks.map(({ volume, track }) => ({
                ...lostTapeToPlayable(volume, track),
                meta: [track.note && `w/ ${track.note}`, `${volume.label}`].filter(Boolean).join(" · "),
              }))}
            />
          )}
        </Section>
      ))}
    </Page>
  );
}
