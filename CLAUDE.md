# ED8125

Portfolio of ED8125 (beatmaker, bass player, producer). React rebuild of the old WordPress site.

- **Phase 1 (done on `feat/react-port`):** faithful port; copy stays verbatim, typos included.
- **Phase 2:** redesign ("Spotlight orange", `docs/handoff/`) and planned move to Next.js App Router.

## Commands
- `npm run dev` (app, :5173) · `npm run ref` (original WordPress site, :8125, needs the FTP copy)
- `npm test` (Vitest) · `npm run test:e2e` (Playwright incl. fidelity vs the original) · `npx tsc -b`
- `FIDELITY_REPORT=1 npx playwright test e2e/home.fidelity.spec.ts` writes per-landmark deltas to `test-results/`

## Where things are
- Content: `src/data/*.ts` (typed). Artist/content context: `docs/ed8125-context.md`. Keep both in sync.
- Media: `public/media/` from `npm run import-media` (`scripts/media-manifest.json`).
- Original CSS for reference: `reference/css/`.

## Rules
- Never copy PHP/JS from the FTP install (`~/Documents/EDONCREATE/ftp/ed8125`) — it is compromised. Only images, mp3s, fonts via the manifest.
- Phase 1 changes must keep `npx playwright test e2e/*fidelity*` green.
