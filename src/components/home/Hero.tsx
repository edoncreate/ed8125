import Link from "next/link";
import { site } from "@content/site";
import { LiveClock } from "@/components/chrome/LiveClock";
import { NowCell, PlayRadio, SoundToggle } from "@/components/music/HeroControls";
import { IconArrowRight } from "@/components/ui/icons";
import { radio, type PlayableTrack } from "@/lib/content";
import type { Video } from "@/lib/youtube";
import { HalftonePortrait } from "./HalftonePortrait";
import styles from "./Hero.module.css";

type Props = { videos: Video[]; soundTrack: PlayableTrack | null; lostTapes: number };

/** 01 Intro: headline left, orange halftone portrait right, data row at the bottom. */
export function Hero({ videos, soundTrack, lostTapes }: Props) {
  const [l1, l2, l3] = site.headline;
  const labels = ["Beats since 2003", "Bass", "Lisboa / Quarteira"];

  return (
    <section id="intro" aria-labelledby="intro-title" className={styles.hero}>
      <div className={styles.stage}>
        <div className={styles.inner}>
          <div className={styles.copy}>
            <p className={styles.kicker}>{site.roles.join(" | ")}</p>
            <h1 id="intro-title" className={styles.h1}>
              <span className={styles.line}>{l1}</span> <span className={styles.line}>{l2}</span>{" "}
              <span className={`${styles.line} ${styles.acc}`}>{l3}</span>
            </h1>
            <p className={styles.sub}>
              {site.positioning.split(/(?<=\.)\s+/).map((sentence) => (
                <span key={sentence} className={styles.sentence}>
                  {sentence}
                </span>
              ))}
            </p>
            <div className={styles.ctas}>
              <PlayRadio queue={radio(videos)} className={styles.solid} />
              <Link href="/beats" className={`go ${styles.outline}`}>
                All beats <IconArrowRight className="go-r" />
              </Link>
            </div>
          </div>

          <div className={styles.art}>
            <HalftonePortrait />
            <ul className={styles.labels}>
              {labels.map((l, i) => (
                <li key={l} className={`label ${styles.lbl} ${styles[`l${i + 1}`]}`}>
                  {l}
                </li>
              ))}
              <li className={`label ${styles.lbl} ${styles.l4}`}>{videos.length} beats on YouTube</li>
            </ul>
          </div>
        </div>
      </div>

      <div className={`${styles.bot} ${soundTrack ? "" : styles.noSound}`}>
        <div className={styles.cellSound}>{soundTrack && <SoundToggle track={soundTrack} className={styles.snd} />}</div>
        <div className={styles.cellLab}>
          Lost Tapes · <b>{lostTapes}</b> beats
        </div>
        <div className={styles.cellSpin}>
          <NowCell fallback={videos[0]?.title ?? "—"} />
        </div>
        <div className={styles.cellClock}>
          {site.location.city} <LiveClock />
        </div>
      </div>
    </section>
  );
}
