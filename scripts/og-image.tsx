// Generator for src/app/opengraph-image.png. To regenerate after changing the headline: copy this
// file to src/app/opengraph-image.tsx, run `npm run build`, copy out/opengraph-image over the PNG,
// then delete the .tsx again (GitHub Pages needs the .png extension).

import fs from "node:fs";
import path from "node:path";
import { ImageResponse } from "next/og";
import { site } from "@content/site";

export const dynamic = "force-static";
export const alt = "ED8125 — Let's cook some music. Beats since 2003, Lisbon.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const font = (file: string) => fs.readFileSync(path.join(process.cwd(), "src/assets/fonts", file));

/** Share preview: the hero's headline in the Spotlight orange system. */
export default function OpengraphImage() {
  const BG = "#0f0f10";
  const FG = "#f4f4f1";
  const ACC = "#ff5b1f";
  const MUT = "rgba(244,244,241,0.58)";
  const LN = "rgba(255,255,255,0.12)";
  const [l1, l2, l3] = site.headline;

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", background: BG, color: FG, padding: "56px 64px", position: "relative" }}>
        {[1, 2, 3].map((i) => (
          <div key={i} style={{ position: "absolute", top: 0, bottom: 0, left: `${i * 25}%`, width: 1, background: LN }} />
        ))}
        <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "Space Mono", fontSize: 22, letterSpacing: 3, color: MUT }}>
          <span style={{ color: FG }}>ED8125 — BEATMAKER | BASS | PRODUCER</span>
          <span>LISBON</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", marginTop: 48, fontFamily: "Inter Tight", fontSize: 150, lineHeight: 0.86, letterSpacing: -6 }}>
          <span>{l1}</span>
          <span>{l2}</span>
          <span style={{ color: ACC }}>{l3}</span>
        </div>
        <div style={{ display: "flex", marginTop: "auto", justifyContent: "space-between", fontFamily: "Space Mono", fontSize: 22, letterSpacing: 2, color: MUT }}>
          <span>BEATS SINCE {site.since}</span>
          <span style={{ color: ACC }}>ED8125.COM</span>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Inter Tight", data: font("InterTight-Black.ttf"), weight: 900, style: "normal" },
        { name: "Space Mono", data: font("SpaceMono-Bold.ttf"), weight: 700, style: "normal" },
      ],
    },
  );
}
