# Handoff from the edoncreate session: ed8125 phase 2 visual direction

From: the edoncreate.com brainstorming session (repos/edoncreate), 2026-11-22.
Eduardo's decision: **"Spotlight orange" (variant 2) is the visual direction for ed8125.**
It's for **phase 2** (the redesign). Phase 1 (faithful WordPress → React port) is unchanged.

Eduardo also said he will **move ed8125 to Next.js** (App Router, React, TS) in phase 2, so both sites share one toolchain. edoncreate.com is being built on Next.js now.

## Mockups
- `v2-spotlight-orange-dark.jpg`: dark mode (default)
- `v2-spotlight-orange-light.jpg`: light mode

These are hero mockups made for edoncreate, so the copy is edoncreate's ("Building in the new AI era", Lab, etc.). Take the **visual system**, not the copy. The ed8125 copy and content come from `docs/ed8125-context.md`.

## Sibling system
Both sites use the same system: the 4-column grid with visible lines, a halftone portrait (a live WebGL particle field on the real site), monospace labels, chapter dots and a bottom data row. Only the accent colour and the headline font differ.
- **edoncreate.com:** variant 3, "Duotone terminal": blue #8B9BFF + orange #FF6A2B, Space Mono 700 headline.
- **ed8125.com:** variant 2, "Spotlight orange": described below.

Keep tokens and components portable between the two repos. A shared package may come later.

## Variant 2 tokens ("Spotlight orange")
```css
/* dark (default) */
--bg: #0f0f10;  --fg: #f4f4f1;  --mut: rgba(244,244,241,.58);
--ln: rgba(255,255,255,.09);  --box: rgba(255,255,255,.22);
--acc: #ff5b1f;               /* warm spotlight orange, from Eduardo's portrait */
/* light */
--bg: #f4f4f1;  --fg: #0f0f10;  --mut: rgba(15,15,16,.58);
--ln: rgba(0,0,0,.09);  --box: rgba(0,0,0,.25);
--acc: #ee4a0a;
```
- **Headline:** Inter Tight 900, line-height .86, letter-spacing -.045em, sentence case. The last phrase is in the accent with a period ("AI era.").
- **Labels / UI:** Space Mono, uppercase, .04–.14em tracking, boxed labels with "■" accent markers.
- **Body:** Manrope 400/500.
- **Logo mark:** "ed.on" uses the accent period. For ed8125, apply the same idea: the accent on one glyph.
- **Grid:** 4 columns, 2cqw outer margin, 1px lines in `--ln`, a header row and a bottom data row.
- **Portrait:** a halftone dot mask over the photo, tinted orange (grayscale → sepia → hue-rotate(-18deg) → saturate(6) → contrast(1.5)).
- **Extras:** grain overlay at ~20% opacity in dark mode and ~12% with multiply in light mode. Pill buttons: solid `--fg` for the primary, outline `--box` for the secondary.
- **Sound:** an "Enter with sound" pill plus a BPM readout fits ed8125 even better than edoncreate.

Source of truth for the mockup: `repos/edoncreate/.superpowers/brainstorm/*/content/combo.html` (class `.v2`).
