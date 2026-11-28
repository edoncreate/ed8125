# ED8125

ed8125.com — Eduardo's beatmaker site (Lisboa / Quarteira, beats since 2003). Sibling of edoncreate.com.

- **Start with `docs/MAINTAINING.md`** — status, everyday tasks, deploy/secrets, domain move, rules, open items.
- **Phase 2 (live, `main`):** Next.js 16 App Router static export on GitHub Pages, "Spotlight orange" system
  (`docs/handoff/`). Phase 1 Vite port is tagged `phase-1`.
- Read `AGENTS.md` (Next.js 16 differs from older versions; docs in `node_modules/next/dist/docs/`).

## Commands
- `npm run dev` · `npm run build` · `npm test` · `npm run test:e2e` · `npm run typecheck` · `npm run lint`
- `npm run media:lost-tapes` (rebuild archive from ~/Desktop/02_Lost_Tapes) · `npm run media:beats` (beat audio from ~/Desktop/youtube; see the rule below) · `npm run media:youtube-snapshot`

## Where things are
- Content: `content/*.ts|json` (site copy, projects, collabs, generated Lost Tapes + YouTube snapshot).
- Data helpers: `src/lib/{content,catalog,youtube,lost-tapes,supabase}.ts`. Player: `src/components/player/` (one channel, root layout). Playlists + Radio: `src/components/playlists/`, schema `supabase/migrations/`.
- Chrome ported from edoncreate (`src/components/chrome/`) — keep tokens/components portable between the repos.
- Artist/content context for new copy: `docs/ed8125-context.md`.

## Rules
- English only. Small orange text uses `--acc-ink` (AA in light mode), large type may use `--acc`.
- Icons: `lucide-react` through `src/components/ui/icons.tsx` only (no Unicode glyphs like ▶ ↗ ✕). Round icon-only buttons use the global `.icon-btn`; links with a trailing arrow use `.go` + `go-r`/`go-l`/`go-ur`; playable row numbers use `RowNum`. Motion tokens: `--ease`, `--dur`, `--wash` (globals.css).
- Lost Tapes mp3s are committed on purpose (served by Pages); source WAVs and the old FTP copy never go in git. Never copy code from the compromised WordPress install.
- GitHub: this repo's `.git/config` pushes as `edoncreate` (repo-local credential helper), so plain `git push` works; for `gh` use `GH_TOKEN="$(gh auth token --user edoncreate)"`. Don't switch the active gh account. Repo is public: commit with the no-reply identity only.
- New beats from YouTube: Eduardo runs `yt-dlp -x --audio-format mp3 -P ~/Desktop/youtube "https://www.youtube.com/playlist?list=PLiFbISKHIpBsdjGdsKHQ9qJSnEFuPJprS"`,
  then `npm run media:beats` (adds only new ones; names files `NN-title.mp3` after the cover number, drops the `[id]`).
