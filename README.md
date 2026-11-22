# ED8125

Portfolio of ED8125 — beatmaker, bass player, producer. React rebuild of the
former WordPress site at ed8125.com (phase 1: same look, new stack).

## Run locally

```bash
npm install
npm run dev          # app on http://localhost:5173
```

Original WordPress site, for side-by-side comparison (needs the FTP copy, see
`reference/README.md`):

```bash
npm run ref          # original site on http://localhost:8125
```

## Tests

```bash
npm test             # unit/component tests (Vitest)
npm run test:e2e     # browser tests incl. fidelity vs the original (Playwright)
```

`npm run test:e2e` starts both servers itself. First time only:
`npx playwright install chromium`.

## Media

Images, audio and fonts in `public/media/` are imported from the FTP copy of the
old site with `npm run import-media` (manifest: `scripts/media-manifest.json`).

## Docs

- Design: `docs/superpowers/specs/2026-11-22-wordpress-to-react-design.md`
- Plan: `docs/superpowers/plans/2026-11-22-wordpress-to-react.md`
