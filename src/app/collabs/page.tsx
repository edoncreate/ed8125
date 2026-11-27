import type { Metadata } from "next";
import { Release } from "@/components/music/Release";
import { TrackList } from "@/components/music/TrackList";
import { Page, Section } from "@/components/page/Page";
import { getCollabs, lostTapeToPlayable } from "@/lib/content";
import styles from "./collabs.module.css";

export const metadata: Metadata = {
  title: "Collabs",
  description: "Los Maschineros (Vol. 1 Classic, Vol. 2 It’s a Reggae Music) and beats made for MC friends.",
};

export default function CollabsPage() {
  const collabs = getCollabs();
  return (
    <Page kicker="Collabs" title="Made" accent="together." lead={<p>Projects with friends and beats made for MCs.</p>}>
      {collabs.map((c) => (
        <Section key={c.slug} id={c.slug}>
          <div className={styles.head}>
            <h2 className={styles.title}>{c.title}</h2>
            {c.releases && (
              <ul className={styles.parts}>
                {c.releases.map((r) => (
                  <li key={r.id} className="label">
                    {r.label} · {r.title}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <p className={styles.summary}>{c.summary}</p>
          {c.releases?.map((r) => <Release key={r.id} collab={c} release={r} />)}
          {c.releases && c.tracks.length > 0 && <h3 className={`label ${styles.archive}`}>From the Lost Tapes</h3>}
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
