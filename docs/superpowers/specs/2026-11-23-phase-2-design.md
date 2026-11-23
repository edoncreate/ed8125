# ED8125 phase 2 — design record

Status: built on `feat/phase-2` (2026-11-23). Eduardo answered the first questions, then
asked to build; later calls below are marked **(Claude's call)**.

## Purpose (Eduardo)
- ed8125.com shows his career as a beatmaker since 2003, past work together, **current work first**.
- Visitors should **listen and follow** (YouTube @ED8125, Instagram ed8125). A **listening experience**,
  not a beat store or booking page. **English only.** Based in **Lisbon**.
- Content: current beats (1-min videos) · projects (Brasil com amor, One week one beat) · Lost Tapes
  (all of it, by volume) · collabs (beats for MCs, Los Maschineros vol 1 & 2 — details to come).
- New videos: posted on Instagram stories today; from now on also uploaded to **YouTube, which is the
  home for videos** (option A). The site picks them up automatically.
- Structure: **one chaptered home** (option A) with a **portrait hero** (option A), like edoncreate.

## Decisions
- **Stack:** Next.js 16 App Router, React 19, TS — same as edoncreate (Eduardo). Static pages; pages
  that list YouTube videos revalidate hourly **(Claude's call)**.
- **Visual system:** Spotlight orange from `docs/handoff/`; chrome components ported from edoncreate.
  Light-mode small orange text uses `--acc-ink #b83a06` for AA contrast **(Claude's call)**.
- **Player:** one channel in the root layout, survives navigation; audio in a bottom bar, YouTube in a
  floating 9:16 mini-player via the IFrame API (youtube-nocookie) **(Claude's call)**.
- **YouTube:** RSS feed (latest 15) or Data API with `YOUTUBE_API_KEY` (all uploads), merged with a
  committed snapshot so builds never come up empty **(Claude's call)**.
- **One week one beat = every channel upload** (thumbnails are numbered "One Week One Beat #39…").
  Switch `content/projects.ts` to explicit ids/a playlist if other video types get posted.
- **Lost Tapes:** all 139 tracks, 4 volumes (2005–09, 2010–14, 2015–19, 2020–21). Titles from tags or
  file names, editable via overrides; WAVs encoded to 192 kbps mp3; audio not in git — served from a
  storage host in production via `NEXT_PUBLIC_LOST_TAPES_BASE` **(Claude's call)**.
- **Collabs:** Los Maschineros auto-collects 14 archive tracks whose title starts with "Los Maschineros";
  "Beats for MCs" collects tracks whose file-name note is an MC name (zidek, jaydas, sacik, trek, ben, ps).
  Vol. 1/2 shown as "coming soon" until Eduardo sends details **(Claude's call)**.
- **Copy:** bio edited from the old site (typos fixed); headline "Let's cook some music." **(Claude's call)**.

## Not done yet
- Deploy (Vercel project, audio host upload, env vars, domain).
- YouTube API key; Los Maschineros vol 1/2 and MC collab details; Lost Tapes title clean-up.
- WebGL particle portrait (static halftone for now), audio-reactive visuals beyond a pulse.
- Instagram backlog: save stories from the Instagram archive and upload them to YouTube.
- Samples/copyright: some archive beats may be sample-based — Eduardo to decide what stays public.
