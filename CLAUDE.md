# ED8125

ed8125.com — Eduardo's beatmaker site (Lisbon, beats since 2003). Sibling of edoncreate.com.

- **Start with `docs/MAINTAINING.md`** — status, everyday tasks, deploy/secrets, domain move, rules, open items.
- **Phase 2 (live, `main`):** Next.js 16 App Router static export on GitHub Pages, "Spotlight orange" system
  (`docs/handoff/`). Phase 1 Vite port is tagged `phase-1`.
- Read `AGENTS.md` (Next.js 16 differs from older versions; docs in `node_modules/next/dist/docs/`).

## Commands
- `npm run dev` · `npm run build` · `npm test` · `npm run test:e2e` · `npm run typecheck` · `npm run lint`
- `npm run media:lost-tapes` (rebuild archive from ~/Desktop/02_Lost_Tapes) · `npm run media:youtube-snapshot`

## Where things are
- Content: `content/*.ts|json` (site copy, projects, collabs, generated Lost Tapes + YouTube snapshot).
- Data helpers: `src/lib/{content,youtube,lost-tapes}.ts`. Player: `src/components/player/` (one channel, root layout).
- Chrome ported from edoncreate (`src/components/chrome/`) — keep tokens/components portable between the repos.
- Artist/content context for new copy: `docs/ed8125-context.md`.

## Rules
- English only. Small orange text uses `--acc-ink` (AA in light mode), large type may use `--acc`.
- Lost Tapes mp3s are committed on purpose (served by Pages); source WAVs and the old FTP copy never go in git. Never copy code from the compromised WordPress install.
- GitHub: push/PR as `edoncreate` per command; don't switch the active gh account. Repo is public: commit with the no-reply identity only.
