# ED8125 WordPress → React (phase 1) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild ed8125.com's three pages as a Vite + React app that is visually indistinguishable from the original WordPress/Elementor site, with working audio players, plus an artist context file.

**Architecture:** Static SPA. Content lives in typed data modules (`src/data/*`); pages are composed from small section components; styling is plain CSS with tokens ported from the Elementor CSS. Fidelity is enforced by a Playwright test that loads the original site (served locally by `reference/server.py` from the archived HTML + FTP assets) and the app side by side and compares landmark element boxes and type styles.

**Tech Stack:** Vite (react-ts template), React 19, TypeScript, React Router 7 (`react-router-dom`), Swiper 11, Vitest + Testing Library + jsdom, Playwright, Python 3 (reference server only).

**Spec:** `docs/superpowers/specs/2026-11-22-wordpress-to-react-design.md`

## Global Constraints

- Routes: `/`, `/brasil-com-amor/`, `/latest-beats/` (trailing slash and no-slash both work).
- Copy is verbatim from the original, typos included ("LATESTE BEATS", "This album tell us…", "tooking", "Throughout  the years" double space collapses in HTML anyway).
- Never copy PHP/JS from the FTP install (`~/Documents/EDONCREATE/ftp/ed8125`, compromised). Only images, mp3s, Bebas Neue font files.
- No jQuery, no `dangerouslySetInnerHTML` for page content, no icon fonts (inline SVG icons).
- Colours: black `#000000`, hero bg `#020202`, panel `#0C0C0C`, gold `#D89500`, cream `#EEE8D9`, white `#FFFFFF`.
- Fonts: display = Bebas Neue Bold (self-hosted from `uploads/useanyfont/200414070713BebasNeue-Bold.woff2|.woff`); body = Montserrat 300/400/500/600/700; alt = Montserrat Alternates 600 (Google Fonts).
- Breakpoints (Elementor defaults): tablet ≤ 1024px, phone ≤ 767px. Boxed container max-width 1140px.
- Animations: Elementor `fadeIn` / `fadeInUp`; disabled under `prefers-reduced-motion: reduce` (content shown immediately).
- Media file names under `public/media/` are lowercase ASCII matching `^[a-z0-9/._-]+$`.
- Instagram block is static (4 cached images); contact form omitted; AddThis share widgets omitted (the "Share" heading stays).

## Review Focus

- Deep link `/#bio` (and `#releases`, `#social`) on first load scrolls to that section after React renders — test in Task 3.
- An mp3 that 404s or fails to decode must not freeze the player or throw unhandled errors; player shows paused state — test in Task 4.
- Rapid track switching (play() promise rejected with AbortError) must not produce console errors — test in Task 4.
- Direct load / refresh of `/latest-beats` and `/latest-beats/` renders the page (SPA fallback in dev and `vite preview`) — test in Task 7.
- Reduced-motion users see every section without waiting for scroll-triggered animation — test in Task 3.

## Reference material (read before Task 3)

- Reference screenshots: `.playwright-mcp/ref-home-hero.jpg`, `ref-home-full.jpg`, `ref-brasil.jpg`, `ref-beats-player.jpg`.
- Elementor element IDs (used as fidelity landmarks; selector `.elementor-element-<id>`):
  - Home desktop: nav `903cdfb`; hero tagline `107be24`, title `869e6b9`, "LATEST RELEASE" `4cdf5d4`, card title `362e274`, card date `b9c4d5d`, card play button `21eed71`; Releases heading `e652b44`, MAD carousel `965811e`, NEW BEAT `8db25c0`, MAD `99f120b`, LISTEN `a4c7379`, album carousel `a97f81a`, ALBUM `3a79341`, album title `6029662`, album text `f67bd15`, LISTEN `8ec7dc3`; Social `c4f6d30`, feed `076a137`; BEATS `e2772b4`, carousel `7badd40`; Bio `a332fd0`, bio text `f40517a`; footer `7d87a6f`.
  - Home phone-only hero: image `0aa422f`, tagline `11d3a9f`, title `b0c24e7`, "LATEST RELEASE" `a955cb8`, MAD `8c6201e`, date `6a1efb0`, button `14d833e`.
  - `/brasil-com-amor/`: nav `e913912`, Releases `1a121c4`, ALBUM `9714595`, cover carousel `fb58e87`, title `e04abc4`, text `f51d410`, Share `429ba87` (phone: `68cfbee`), player `d476227`, LATESTE BEATS `0910689`, beats carousel `2bf8cfd`, footer `39f5a1e`.
  - `/latest-beats/`: nav `e913912`, Releases `1a121c4`, LATESTE BEATS `0910689`, player `f8825fe`, Share `429ba87`, ALBUM `9714595`, banner carousel `fb58e87`, title `e04abc4`, text `f51d410`, LISTEN `fea33bd`, footer `39f5a1e`.
- Links: nav `#home #releases #social #bio`; Facebook `https://www.facebook.com/ED8125BEATS/`; Instagram `https://www.instagram.com/ed8125/`; hero card button → `#releases`; NEW BEAT LISTEN → `/latest-beats/`; ALBUM LISTEN → `/brasil-com-amor/`; every BEATS cover → `/latest-beats/`; subpage BACK and logo → `/`; footer "EDONCREATE" → `https://edoncreate.com/`.
- Carousels: single-image sliders = 1 per view, dots, autoplay 10000ms, speed 500, loop, pause on hover/interaction. Beats = 5 / 4 (tablet) / 2 (phone) per view, 20px spacing, dots, same autoplay.
- Players: album (playlist 483) = no track numbers, no covers in list, active cover shown, artist names shown, tracklist shown, loop toggle allowed, no buy buttons, no cycling. Beats (playlist 123) = numbered, reversed order, covers in list, active cover, artist names, loop toggle, no cycling.
- Measured type (1440px): hero tagline Bebas 40/40 gold; hero title Bebas 140/140 cream; "LATEST RELEASE" Bebas 40/32 white; card title Montserrat Alternates 600 22/22; card date Montserrat 300 16; section H1 Bebas 48/48 (Releases gold, others white); H3 (NEW BEAT/ALBUM) Bebas 40/40; body text Montserrat 300 22/33, paragraph margin-bottom 38.5px; nav Montserrat 600 15 uppercase; LISTEN button Montserrat 700 15, gold bg, white text, radius 10px, padding 15px 40px (135×45); hero play button 45×45 white circle; footer Montserrat 400 13.
- Measured sections (1440px): header 90px tall, padding 0 30px, overlays hero; hero 100vh (900), bg `#020202` + `hero-v3-2.png` cover, position 50% 0; Releases pad 120/50/50 bg `#0C0C0C`; Social pad 120/50/140 bg `#000`; Beats pad 120/50/140 bg `#0C0C0C`; Bio pad 120/50/140 bg `#0C0C0C` + `bg-bio-img.png` cover at 100% 100%; footer 74px bg `#000`.
- Anything not listed: read the original CSS in `reference/css/` (Task 1 copies it there) — `post-150.css` (home), `post-481.css` (album page), `post-597.css` (beats page), `post-309.css` + `global.css` (kit), `inline-*.css` (inline `<style>` blocks incl. custom CSS), plus `audioigniter.css` for the player.

---

### Task 1: Project scaffold + reference server + fidelity harness

**Files:**
- Create: `package.json`, `vite.config.ts`, `tsconfig*.json`, `index.html`, `src/main.tsx`, `src/App.tsx` (placeholder), `src/test/setup.ts`, `playwright.config.ts`, `e2e/smoke.spec.ts`, `e2e/fidelity.ts`, `.gitignore`, `README.md`
- Create: `reference/server.py`, `reference/site/index.html`, `reference/site/brasil-com-amor/index.html`, `reference/site/latest-beats/index.html`, `reference/site/local-css/*.css`, `reference/css/*.css`, `reference/README.md`

**Interfaces:**
- Produces: npm scripts `dev`, `build`, `preview`, `test` (vitest run), `test:e2e` (playwright test), `ref` (`python3 -I reference/server.py`), `import-media` (Task 2).
- Produces: `e2e/fidelity.ts` exporting `type Landmark = { name: string; ref: string; app: string }` and `async function compareLandmarks(page: Page, path: string, landmarks: Landmark[], tolerancePx: number): Promise<void>` — opens `http://localhost:8125${path}` and `http://localhost:5173${path}` at the current viewport, removes `.elementor-invisible`, waits for fonts, and for each landmark asserts |Δx|,|Δy|,|Δw|,|Δh| ≤ tolerance and equal computed `font-size` and `color`; attaches both full-page screenshots to the test report.
- Produces: Playwright projects `desktop` (1440×900), `tablet` (1024×768), `phone` (375×812); `webServer` starts both `npm run dev -- --port 5173 --strictPort` and `npm run ref`.

- [ ] **Step 1:** Scaffold with `npm create vite@latest . -- --template react-ts`; add deps `react-router-dom swiper`; dev deps `vitest jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event @playwright/test`; `npx playwright install chromium`. Vitest: `environment: 'jsdom'`, `setupFiles: ['src/test/setup.ts']`, exclude `e2e/**`. `setup.ts` imports jest-dom and stubs `HTMLMediaElement.prototype.play` (resolved promise) / `pause` / `load`, plus `IntersectionObserver` and `matchMedia`.
- [ ] **Step 2:** `index.html`: `<html lang="en">`, title `ED8125 – BEATMAKER BASSPLAYER PRODUCER`, favicon `/media/img/favicon-32.png` (Task 2), Google Fonts link for Montserrat 300–700 and Montserrat Alternates 600.
- [ ] **Step 3:** Move the session reference server into `reference/`: `server.py` = the existing `scratchpad/tools/refserver.py` with two changes — site root is `reference/site`, and `/wp-content/*` + `/wp-includes/*` are served from `$ED8125_FTP` (default `~/Documents/EDONCREATE/ftp/ed8125`) instead of symlinks. Copy the three rewritten HTML files and `local-css/`. Copy the page CSS listed under "Reference material" into `reference/css/`, extract each page's inline `<style>` blocks to `reference/css/inline-{home,album,beats}.css`, copy `plugins/audioigniter/player/build/style.css` to `reference/css/audioigniter.css`.
- [ ] **Step 4:** `.gitignore`: `node_modules`, `dist`, `.DS_Store`, `.playwright-mcp`, `test-results`, `playwright-report`.
- [ ] **Step 5: Write smoke tests** in `e2e/smoke.spec.ts`:
  - `app serves root`: `page.goto('http://localhost:5173/')` → title is `ED8125 – BEATMAKER BASSPLAYER PRODUCER`.
  - `reference serves playlists`: GET `http://localhost:8125/?audioigniter_playlist_id=483` → JSON array length 11; `=123` → length 10.
- [ ] **Step 6:** Run `npm run test:e2e -- e2e/smoke.spec.ts --project=desktop` → 2 passed. Run `npm test` → passes (no tests yet is OK with `--passWithNoTests`).
- [ ] **Step 7:** `README.md`: how to run app (`npm install`, `npm run dev`), reference (`npm run ref`), tests. Commit (see handoff note on commits).

### Task 2: Media import + content data

**Files:**
- Create: `scripts/media-manifest.json`, `scripts/import-media.mjs`, `public/media/**` (generated), `src/data/types.ts`, `src/data/site.ts`, `src/data/releases.ts`, `src/data/playlists.ts`, `src/data/instagram.ts`
- Test: `src/data/data.test.ts`

**Interfaces:**
- Produces (`src/data/types.ts`):
  - `type Track = { id: string; title: string; artist: string; src: string; cover?: string }`
  - `type PlayerOptions = { numbered: boolean; reverse: boolean; tracklistCovers: boolean; activeCover: boolean; artistNames: boolean; allowLoop: boolean; cycle: boolean }`
  - `type Playlist = { id: 'brasil-com-amor' | 'latest-beats'; tracks: Track[]; options: PlayerOptions }`
  - `type CoverLink = { cover: string; alt: string; href: string }`
  - `type InstagramPost = { image: string; href: string; isVideo: boolean }`
- Produces: `site` (`src/data/site.ts`): `{ nav, social: { facebook, instagram }, hero: { tagline, title, latestRelease: { title: 'MAD', date: '2021.02.28' } }, bio: string[] (paragraph source with **bold** marked as an array of segments), footer }`; `releases.ts`: `newBeat`, `album` (`description` verbatim), `beatsCarousel: CoverLink[]` (display order, MAD first); `playlists.ts`: `brasilComAmor: Playlist`, `latestBeats: Playlist`; `instagram.ts`: `instagramPosts: InstagramPost[]`, `instagramHandle = 'ed8125'`.

- [ ] **Step 1: Write the failing test** `src/data/data.test.ts` (`// @vitest-environment node`):
  - `every media path exists`: collect every `src`/`cover`/`image` string in all data modules → `fs.existsSync('public' + path)` true, and path matches `/^\/media\/[a-z0-9/._-]+$/`.
  - `album tracklist`: `brasilComAmor.tracks.map(t => t.title)` equals `['Bloco','Carnaval','Amor à primeira vista','Me beija','Nosso samba','Será Você','Discussão','Partiu','Vou por ai','Livre','Vem']`; all artists `'ED8125'`; options `{numbered:false, reverse:false, tracklistCovers:false, activeCover:true, artistNames:true, allowLoop:true, cycle:false}`.
  - `beats tracklist`: stored order titles equal `["Abril M'Águas 1000","Mais Amor Por Favor","Follow Your Heart","Vou Por Aí","Vamos à Luta","One Love","It's Time to Think","Sean Price ft Tek (Remix)","Tributo Carlos do Carmo","MAD"]`; options `{numbered:true, reverse:true, tracklistCovers:true, activeCover:true, artistNames:true, allowLoop:true, cycle:false}`.
  - `beats carousel`: length 10, first alt `'banner-release'` cover is MAD's cover, every `href === '/latest-beats/'`, order matches the home carousel (MAD, Carlos do Carmo, Sean Price, It is time to think, One Love, Vamos a Luta, Vou Por Ai, Follow Your Heart, art-cover, Abril Maguas 1000).
  - `instagram`: 4 posts, hrefs `https://www.instagram.com/tv/CeHEP9XIYgq/`, `https://www.instagram.com/p/CblKyB-orkI/`, `https://www.instagram.com/p/Ca3PJYbo1t-/`, `https://www.instagram.com/tv/CXOOaFmISUB/` (isVideo true for `/tv/`).
- [ ] **Step 2:** Run `npx vitest run src/data` → FAIL (modules missing).
- [ ] **Step 3:** `scripts/import-media.mjs`: reads manifest `[{ src: '<path under wp-content/uploads>', dest: '<path under public/media>' }]`, root from `$ED8125_FTP`; copies each, matching source names NFC/NFD-insensitively; exits non-zero listing any missing source; prints total MB. Manifest covers: 21 mp3s (dest `audio/brasil-com-amor/NN-slug.mp3`, `audio/beats/slug.mp3`); covers 560px or full (`img/covers/*.png`); `front-cover.png`, `back-cover.png`, `art-web-bannerbanner-brasil-com-amor.png`, `banner-release.png`; backgrounds `hero-v3-2.png`, `bg-bio-img.png` and any other `url()` image the CSS in `reference/css/` uses for these pages (`banner-hero-2.png` for the hero card if referenced, phone hero image of widget `0aa422f`); `ed8125-logo-white.png`; favicons (`cropped-2Icon-1-32x32.png`, `-192x192`, `-180x180`); the 4 Instagram images (`sb-instagram-feed-images/*low.jpg` used by the reference); fonts to `fonts/bebas-neue-bold.woff2|woff`. Run `npm run import-media`.
- [ ] **Step 4:** Write the four data modules with the values above (text verbatim from `reference/site/*.html`).
- [ ] **Step 5:** Run `npx vitest run src/data` → PASS. Commit.

### Task 3: Theme, layout shell, routing, Reveal

**Files:**
- Create: `src/styles/tokens.css`, `src/styles/global.css`, `src/components/Header/HomeHeader.tsx`, `src/components/Header/SubHeader.tsx`, `src/components/Header/Header.css`, `src/components/Footer/Footer.tsx`, `src/components/Footer/Footer.css`, `src/components/Reveal/Reveal.tsx`, `src/components/Reveal/Reveal.css`, `src/components/icons.tsx`, `src/hooks/useHashScroll.ts`, `src/pages/Home/Home.tsx` (stub sections with ids), `src/pages/AlbumPage.tsx` (stub), `src/pages/LatestBeatsPage.tsx` (stub)
- Modify: `src/App.tsx`, `src/main.tsx`
- Test: `src/App.test.tsx`, `src/components/Reveal/Reveal.test.tsx`

**Interfaces:**
- Consumes: `site` from Task 2.
- Produces: `<Reveal animation?: 'fadeIn' | 'fadeInUp' (default 'fadeInUp'), as?: keyof JSX.IntrinsicElements, className?, children>`; `<HomeHeader />`, `<SubHeader />`, `<Footer />`; `useHashScroll()` (scrolls to `location.hash` target after mount and on hash change; on pathname change without hash scrolls to top); section ids `home`, `releases`, `social`, `bio` on Home.
- Produces: every component that is a fidelity landmark sets `data-ref="<landmark name>"` (names used in Tasks 6–7).

- [ ] **Step 1: Write failing tests:**
  - `App.test.tsx` → `renders home at /`: nav links with hrefs `#home,#releases,#social,#bio`, Facebook/Instagram links with the exact URLs, footer link `https://edoncreate.com/` text `EDONCREATE`; `renders album page at /brasil-com-amor/` and `/latest-beats` (no slash): link named `Back` with href `/`; `unknown route redirects to /`.
  - `Reveal.test.tsx` → `content visible immediately with reduced motion` (matchMedia reduce → element has class `is-visible` on first render); `becomes visible on intersection` (fire stub IO callback → class `is-visible`).
- [ ] **Step 2:** Run `npx vitest run src/App.test.tsx src/components/Reveal` → FAIL.
- [ ] **Step 3:** Implement. `BrowserRouter`; routes `/`, `/brasil-com-amor`, `/latest-beats`, `*` → `<Navigate to="/" replace />`. Header: logo left, nav centred, social icons right; nav item gold when its section is in view (IntersectionObserver), white otherwise; header is absolutely positioned over the hero on Home and a solid black 90px bar on subpages. `scroll-behavior: smooth` except under reduced motion. Keyframes copied from Elementor `animations.min.css` (`fadeIn`, `fadeInUp`, duration 1.25s normal / 2s for `animated-slow` hero).
- [ ] **Step 4:** Add e2e `e2e/navigation.spec.ts` → `deep link /#bio scrolls to bio` (goto `/#bio`, expect `#bio` heading in viewport) and `hash nav click scrolls` (click RELEASES → `#releases` in viewport).
- [ ] **Step 5:** Run vitest + `npm run test:e2e -- e2e/navigation.spec.ts --project=desktop` → PASS. Commit.

### Task 4: Audio player

**Files:**
- Create: `src/components/AudioPlayer/playlist.ts`, `src/components/AudioPlayer/useAudioPlayer.ts`, `src/components/AudioPlayer/AudioPlayer.tsx`, `src/components/AudioPlayer/AudioPlayer.css`
- Test: `src/components/AudioPlayer/playlist.test.ts`, `src/components/AudioPlayer/useAudioPlayer.test.ts`, `src/components/AudioPlayer/AudioPlayer.test.tsx`

**Interfaces:**
- Consumes: `Playlist`, `Track`, `PlayerOptions` (Task 2).
- Produces: `orderedTracks(p: Playlist): { track: Track; number: number }[]` (number = 1-based stored position; reversed when `options.reverse`); `trackLabel(item, options): string`; `formatTime(seconds: number): string` (`mm:ss`, NaN → `00:00`); `useAudioPlayer(tracks: Track[], opts: { cycle: boolean }): { audioRef, index, playing, currentTime, duration, volume, loop, toggle(), select(i), next(), prev(), seek(t), setVolume(v), toggleLoop(), error }`; `<AudioPlayer playlist={Playlist} />`.

- [ ] **Step 1: Write failing tests:**
  - `playlist.test.ts`: album labels start `'Bloco - ED8125'` (no number); beats ordered first item label `'10. MAD - ED8125'`, last `"1. Abril M'Águas 1000 - ED8125"`; `formatTime(0)='00:00'`, `formatTime(202.8)='03:22'`, `formatTime(NaN)='00:00'`.
  - `useAudioPlayer.test.ts` (renderHook + a real `<audio>` element from jsdom): `ended advances to next and keeps playing`; `ended on last track stops when cycle=false`; `loop replays same track`; `select(i) sets index and calls play`; `play() rejection (AbortError) leaves playing=false and does not throw`; `audio error event sets error and playing=false`.
  - `AudioPlayer.test.tsx`: beats playlist renders 10 rows, first row text `10. MAD - ED8125`, each row has a cover `img`; album playlist rows have no `img` and no numbers; clicking row 3 marks it `aria-current="true"` and shows its title in the active area; play button has accessible name `Play` / `Pause` toggling.
- [ ] **Step 2:** Run `npx vitest run src/components/AudioPlayer` → FAIL.
- [ ] **Step 3:** Implement. One `<audio preload="metadata">` per player; ignore `AbortError` from `play()`. Layout and colours copied from `reference/css/audioigniter.css` + the AudioIgniter overrides in `reference/css/inline-*.css` (see `ref-beats-player.jpg`: black panel, 130px active cover, gold 50px play button, track title/artist, progress bar with `00:00`, control row prev/next/volume bars/+−/loop, gold active row). Icons inline SVG.
- [ ] **Step 4:** Run tests → PASS. Commit.

### Task 5: Carousels

**Files:**
- Create: `src/components/Carousel/CoverSlider.tsx`, `src/components/Carousel/BeatsCarousel.tsx`, `src/components/Carousel/Carousel.css`
- Test: `src/components/Carousel/Carousel.test.tsx`

**Interfaces:**
- Consumes: `CoverLink` (Task 2).
- Produces: `<CoverSlider images={{ src: string; alt: string }[]} />` (1 per view, dots only when >1 image) and `<BeatsCarousel items={CoverLink[]} />` (Swiper `slidesPerView` 2 / 4 at ≥768 / 5 at ≥1025, `spaceBetween` 20, pagination dots, autoplay `{ delay: 10000, pauseOnMouseEnter: true, disableOnInteraction: true }`, `speed` 500, `loop`).

- [ ] **Step 1: Write failing tests:** `BeatsCarousel renders every item as a link` (10 unique hrefs `/latest-beats/` with img alts from data — query non-duplicate slides via `:not(.swiper-slide-duplicate)`); `CoverSlider with one image has no pagination`; `CoverSlider with two images renders both`.
- [ ] **Step 2:** Run → FAIL. **Step 3:** Implement with `swiper/react` + modules `Pagination`, `Autoplay`; dot colours from reference (white active, grey inactive). **Step 4:** Run → PASS. Commit.

### Task 6: Home page

**Files:**
- Create: `src/pages/Home/Hero.tsx`, `src/pages/Home/HeroMobile.tsx`, `src/pages/Home/Releases.tsx`, `src/pages/Home/Social.tsx`, `src/pages/Home/Beats.tsx`, `src/pages/Home/Bio.tsx`, `src/pages/Home/Home.css`
- Modify: `src/pages/Home/Home.tsx`
- Test: `src/pages/Home/Home.test.tsx`, `e2e/home.fidelity.spec.ts`

**Interfaces:**
- Consumes: `site`, `newBeat`, `album`, `beatsCarousel`, `instagramPosts` (Task 2); `Reveal`, `HomeHeader`, `Footer` (Task 3); `CoverSlider`, `BeatsCarousel` (Task 5); `compareLandmarks` (Task 1).

- [ ] **Step 1: Write failing tests:**
  - `Home.test.tsx`: verbatim strings present — `Beatmaker . Bass Player . Producer`, `LET'S COOK`, `SOME MUSIC`, `LATEST RELEASE`, `2021.02.28`, `NEW BEAT`, `ALBUM`, `Brasil com amor`, the album description, `Social`, `BEATS`, `Bio`; bio bold words rendered in `<strong>`: `2003`, `hobby`, `telling stories`, `melodies`; hero play link href `#releases`; LISTEN links `/latest-beats/` and `/brasil-com-amor/`; Instagram: 4 post links + `Follow` link to `https://www.instagram.com/ed8125/`.
  - `e2e/home.fidelity.spec.ts`: `compareLandmarks(page, '/', HOME_LANDMARKS, tol)` per project, tol 6px desktop/tablet, 10px phone. Desktop/tablet landmarks: every home desktop ID from "Reference material" (ref `.elementor-element-<id>`, app `[data-ref=<name>]`); phone project uses the phone-only hero IDs plus section headings. Instagram feed compared by outer box only.
- [ ] **Step 2:** Run both → FAIL.
- [ ] **Step 3:** Implement sections (desktop hero = two columns: text 720px + background portrait; card 600px with rounded background image, title/date bottom-left, white round play button bottom-right; phone hero = stacked image + text, shown only ≤767px).
- [ ] **Step 4:** Iterate until `npm run test:e2e -- e2e/home.fidelity.spec.ts` passes on all three projects; open the attached screenshots and check nothing un-landmarked drifted (carousel dots, Instagram card, bio background). Commit.

### Task 7: Album and Latest-beats pages

**Files:**
- Create: `src/pages/ReleasePage.css`, `src/components/ReleaseBlocks/AlbumBlock.tsx` (cover/banner + title + text + optional LISTEN)
- Modify: `src/pages/AlbumPage.tsx`, `src/pages/LatestBeatsPage.tsx`
- Test: `src/pages/ReleasePages.test.tsx`, `e2e/release.fidelity.spec.ts`, `e2e/audio.spec.ts`

**Interfaces:**
- Consumes: `album`, `beatsCarousel`, `brasilComAmor`, `latestBeats` (Task 2); `SubHeader`, `Footer`, `Reveal` (Task 3); `AudioPlayer` (Task 4); `CoverSlider`, `BeatsCarousel` (Task 5); `compareLandmarks` (Task 1).

- [ ] **Step 1: Write failing tests:**
  - `ReleasePages.test.tsx`: album page shows `Releases`, `ALBUM`, `Brasil com amor`, description, `Share`, `LATESTE BEATS`, an AudioPlayer with 11 rows; beats page shows `Releases`, `LATESTE BEATS`, AudioPlayer first row `10. MAD - ED8125`, `Share`, `ALBUM`, LISTEN → `/brasil-com-amor/`.
  - `e2e/release.fidelity.spec.ts`: `compareLandmarks` for both pages with the IDs listed under "Reference material" (players compared by outer box; reference players need their playlists loaded — wait for `.ai-track` rows).
  - `e2e/audio.spec.ts`: `album plays` (goto `/brasil-com-amor/`, click Play, within 4s `audio.currentTime > 0` and no console errors); `rapid switching is clean` (on `/latest-beats/` click rows 1,2,3 within 300ms → no console errors, row 3 active); `direct load works` (goto `/latest-beats` and `/latest-beats/` → `LATESTE BEATS` visible).
- [ ] **Step 2:** Run → FAIL. **Step 3:** Implement. **Step 4:** Iterate until all pass on the three projects; review screenshots. Commit.

### Task 8: Artist context file

**Files:**
- Create: `docs/ed8125-context.md`
- Modify: `README.md` (link to it), `CLAUDE.md` (create: one-line pointer "Artist/content context: docs/ed8125-context.md; reference site: npm run ref")

- [ ] **Step 1:** Write `docs/ed8125-context.md`: identity (ED8125, beatmaker / bass player / producer, studio brand EDONCREATE; Portuguese-speaking audience is inferred from the site's PT form labels and the Carlos do Carmo tribute — mark as "to confirm"), tagline ("let's cook some music"), bio verbatim + facts (producing since 2003, music as hobby/shelter, storytelling melodies), releases (MAD 2021.02.28 new beat; *Brasil com amor* album + description + 11-track list; latest-beats 10 tracks with dates where filenames give them: MAD 2021-02-28, Tributo Carlos do Carmo 2021-01-03, Sean Price ft Tek remix 2020-11-15), unreleased/other uploads (the ~20 April-2020 beats by filename, status unknown), brand (colours, fonts, logo file, tone), channels (Instagram ed8125 + hashtags seen in feed, Facebook ED8125BEATS), content issues for phase 2 (typos list, guessed titles, broken Instagram feed, hidden contact form, missing "Share" widgets, 2020 copyright year), and open questions for Eduardo.
- [ ] **Step 2:** Verify every title/link in the file matches `src/data/*` (grep each). Commit.

---

## Execution notes

- Commits: the repo is on an unborn `main`. Work on branch `feat/react-port`; commit at the end of each task **only if Eduardo has OK'd committing** (asked at handoff). Media (~125 MB) is committed in Task 2's commit.
- Keep `npm run ref` running in a separate terminal during Tasks 6–7 for visual comparison at http://localhost:8125 vs http://localhost:5173.
