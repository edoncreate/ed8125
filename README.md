# ED8125

ed8125.com — beatmaker, bass player and producer, Lisbon. Beats since 2003.

Phase 2: a listening experience in the "Spotlight orange" system shared with
edoncreate.com. Next.js 16 (App Router, static export) + React 19 + TypeScript, on GitHub Pages. Phase 1 (the
faithful WordPress → React port) is tagged `phase-1`.

## Run locally

```bash
npm install
npm run dev                # http://localhost:3000
```

## Where content comes from

| Section | Source | How to update |
|---|---|---|
| Now / Beats / One week one beat | YouTube channel @ED8125 | Upload to YouTube. The site rebuilds daily. Set `YOUTUBE_API_KEY` to list every upload (without it: the latest 15 + `content/youtube-snapshot.json`). |
| Projects | `content/projects.ts` | Edit the file. The album audio is in `public/media/audio/brasil-com-amor/`. |
| Lost Tapes | `~/Desktop/02_Lost_Tapes` → `content/lost-tapes.json` + `public/media/lost-tapes/` | Add files to the folder, run `npm run media:lost-tapes`, commit. Fix titles in `content/lost-tapes-overrides.json` (`"vol-2/beat-da-dica": { "title": "…" }`, or `"hidden": true`). |
| Collabs | `content/collabs.ts` + Lost Tapes titles/notes | Edit the file. |
| Copy, socials, bio | `content/site.ts` | Edit the file. |

`npm run media:youtube-snapshot` refreshes the committed YouTube fallback.

## Deploying — GitHub Pages

`.github/workflows/pages.yml` builds the static site (`out/`) and publishes it:

- on every push to `main`, daily at 05:17 UTC (new YouTube uploads), and on demand (Actions → Run workflow);
- at **https://edoncreate.github.io/ed8125/** (base path `/ed8125`).

Moving to **ed8125.com**: add the domain in Settings → Pages, point DNS at GitHub Pages, then set the
repo variable `CUSTOM_DOMAIN` = `true` (Settings → Secrets and variables → Actions → Variables).

Optional secret `YOUTUBE_API_KEY` or `YOUTUBE` (YouTube Data API v3) lists every upload instead of the latest 15.
The Lost Tapes audio is committed in `public/media/lost-tapes/` and served with the site (≈820 MB
in total; GitHub Pages allows 1 GB).

Local check of the Pages build: `NEXT_PUBLIC_BASE_PATH=/ed8125 npm run build`, then `node tests/serve-out.mjs`
serves `out/` (without the base path, build without the variable).

## Tests

```bash
npm test            # unit (Vitest): parsers, content, player state
npm run test:e2e    # browser (Playwright): playback, persistence across pages, YouTube mini-player
npm run typecheck && npm run lint
```

## Docs

- **Maintaining the site (start here): `docs/MAINTAINING.md`**
- Artist & content context: `docs/ed8125-context.md`
- Phase 2 design record: `docs/superpowers/specs/2026-11-23-phase-2-design.md`
- Visual direction: `docs/handoff/`
