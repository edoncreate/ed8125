# ED8125

ed8125.com — beatmaker, bass player and producer, Lisbon. Beats since 2003.

Phase 2: a listening experience in the "Spotlight orange" system shared with
edoncreate.com. Next.js 16 (App Router) + React 19 + TypeScript. Phase 1 (the
faithful WordPress → React port) is tagged `phase-1`.

## Run locally

```bash
npm install
npm run media:lost-tapes   # once: builds public/media/lost-tapes/ from the Lost Tapes folder (≈670 MB, git-ignored)
npm run dev                # http://localhost:3000
```

## Where content comes from

| Section | Source | How to update |
|---|---|---|
| Now / Beats / One week one beat | YouTube channel @ED8125 | Upload to YouTube. Pages refresh hourly. Set `YOUTUBE_API_KEY` to list every upload (without it: the latest 15 + `content/youtube-snapshot.json`). |
| Projects | `content/projects.ts` | Edit the file. The album audio is in `public/media/audio/brasil-com-amor/`. |
| Lost Tapes | `~/Desktop/02_Lost_Tapes` → `content/lost-tapes.json` | Add files to the folder, run `npm run media:lost-tapes`. Fix titles in `content/lost-tapes-overrides.json` (`"vol-2/beat-da-dica": { "title": "…" }`, or `"hidden": true`). |
| Collabs | `content/collabs.ts` + Lost Tapes titles/notes | Edit the file. |
| Copy, socials, bio | `content/site.ts` | Edit the file. |

`npm run media:youtube-snapshot` refreshes the committed YouTube fallback.

## Deploying (not set up yet)

- Vercel, like edoncreate.com. Everything is pre-rendered; YouTube pages revalidate hourly.
- Lost Tapes audio is not in git: upload `public/media/lost-tapes/` to a storage host
  (e.g. Vercel Blob or Cloudflare R2) and set `NEXT_PUBLIC_LOST_TAPES_BASE` to its base URL.
- Optional: `YOUTUBE_API_KEY` (YouTube Data API v3, read-only key).

## Tests

```bash
npm test            # unit (Vitest): parsers, content, player state
npm run test:e2e    # browser (Playwright): playback, persistence across pages, YouTube mini-player
npm run typecheck && npm run lint
```

## Docs

- Artist & content context: `docs/ed8125-context.md`
- Phase 2 design record: `docs/superpowers/specs/2026-11-23-phase-2-design.md`
- Visual direction: `docs/handoff/`
