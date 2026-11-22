# ED8125 — WordPress → React (phase 1: faithful port)

Status: approved by Eduardo, 2026-11-22.

## Intent

ed8125.com was Eduardo's portfolio as a beatmaker / bass player / producer, built on WordPress
(Astra theme + Elementor). The install is compromised (SEO-spam injector, unknown plugins) and
no longer served. Goal: rebuild it as a React project that **looks and behaves the same**, as a
clean baseline. Phase 2 (later, separate) improves design and content.

A context file about the artist is produced alongside, to feed future content generation.

## Goals

- Same three pages, same URLs: `/`, `/brasil-com-amor/`, `/latest-beats/`.
- Same visual result as the archived site rendered with its original CSS (reference server,
  see below): layout, colours, fonts, spacing, entrance animations, carousels, audio players.
- Audio playback works for the album (11 tracks) and latest beats (10 tracks).
- Responsive like the original (desktop / tablet / phone breakpoints, separate phone hero).
- `docs/ed8125-context.md`: artist, bio, tagline, releases, tracklists, brand, social, voice,
  known content issues.

## Non-goals (phase 1)

- No redesign, no copy edits. Text stays verbatim, typos included ("LATESTE BEATS",
  "This album tell us", "tooking"); they are listed in the context file for phase 2.
- No CMS, no backend, no live Instagram API, no analytics, no share widgets (AddThis is dead).
- No hosting/deploy decision.

## Anti-goals

- Copying any PHP or JS from the WordPress install (it is compromised). Only images, mp3s and
  the Bebas Neue font are copied.
- Wrapping Elementor HTML in `dangerouslySetInnerHTML` or loading jQuery plugins — that is not
  a React port.

## Approaches considered

1. **Vite + React + TypeScript SPA, hand-ported components (chosen).** Closest to "convert to
   React", simplest toolchain, static build deployable anywhere.
2. Next.js static export. Better SEO/meta per route, heavier; reconsider in phase 2 if SEO matters.
3. Embed the Elementor HTML/CSS as-is inside React. Fast but keeps jQuery/Elementor baggage and
   is not maintainable — rejected.
(Headless WordPress is impossible: no database survived.)

## Decisions

- **Stack:** Vite, React, TypeScript, React Router (`BrowserRouter`), plain CSS with design tokens
  (CSS custom properties) ported from Elementor's generated CSS (`post-150.css`, `global.css`,
  `post-25.css`, `post-309.css`, custom-css-js files).
- **Fonts:** Bebas Neue Bold (self-hosted woff/woff2 from the old install), Montserrat (Google
  Fonts, same as the original).
- **Carousels:** Swiper (Elementor used Swiper) — releases album image slider (front/back cover)
  and BEATS cover carousel with bullets.
- **Audio player:** custom React component reproducing AudioIgniter's "full" layout and both
  configurations (album: no numbers, no covers in list; beats: numbered, reversed, covers in list).
- **Hero "latest release" card:** round play button scrolls to `#releases`, as on the original
  (corrected after inspecting the reference — it never played audio itself).
- **Instagram block:** static replica: header (avatar + "ed8125"), 4 cached post images from
  `sb-instagram-feed-images`, Follow button linking to instagram.com/ed8125.
- **Contact section:** omitted — it was hidden on every device on the live site.
- **Animations:** Elementor `fadeIn` / `fadeInUp` reproduced with CSS + IntersectionObserver;
  respects `prefers-reduced-motion`.
- **Media:** only media used by the three pages is copied into `public/media/` (images + 21 mp3s,
  ~125 MB) and committed. Hosting of audio revisited in phase 2.
- **Data:** releases, tracklists and nav in typed data modules (`src/data/*`), so phase 2 can edit
  content without touching components.
- **Tracklists** are reconstructed (original playlists lived in the lost DB): album from numbered
  filenames; latest beats = the 10 carousel covers, MAD first. Titles/accents are guesses, flagged
  in the context file.

## Reference for fidelity

`scratchpad/tools/refserver.py` serves the archived HTML with the original CSS/assets from the
FTP copy at http://localhost:8125/ (and emulates the AudioIgniter playlist endpoint). Screenshots
of the reference live in `.playwright-mcp/ref-*.jpg`. The React app is compared against it
side-by-side at 1440px, tablet (1024) and phone (375).

## Left to the builder

Exact component split, CSS file organisation, Swiper configuration details, and how closely to
match sub-pixel spacing — target is "indistinguishable at a glance" side by side.

## Phase 2 inputs (received 2026-11-22, not part of phase 1)

From the edoncreate.com session, at Eduardo's request — see `docs/handoff/`:

- **Visual direction: "Spotlight orange"** (`docs/handoff/2026-11-22-visual-direction-from-edoncreate.md`,
  mockups `v2-spotlight-orange-{dark,light}.jpg`). Near-black `#0f0f10` / off-white `#f4f4f1`,
  accent `#ff5b1f` (light `#ee4a0a`); Inter Tight 900 headline, Space Mono labels, Manrope body;
  4-column grid with visible lines, orange-tinted halftone portrait, chapter dots, bottom data row,
  "Enter with sound" pill + BPM readout. Take the visual system, not the mockup copy.
- **Sibling of edoncreate.com:** same system, different accent/headline font; keep tokens and
  components portable between the two repos.
- **Stack change:** Eduardo plans to move ed8125 to **Next.js (App Router)** in phase 2, matching
  edoncreate. Phase 1 stays on Vite as approved; content in `src/data/*` and components port as-is.
