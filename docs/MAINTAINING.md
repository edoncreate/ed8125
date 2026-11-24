# Maintaining ed8125.com

Read this first when picking the site up again. Last updated 2026-11-24.

## Where things stand

| | |
|---|---|
| Live site | https://edoncreate.github.io/ed8125/ (ed8125.com not pointed here yet — see [Moving to ed8125.com](#moving-to-ed8125com)) |
| Repo | `edoncreate/ed8125`, **public**, branch `main` deploys |
| Old repo | `edoncreate/ed8125-old`, private — pre-rewrite history, safe to delete once you're sure |
| Stack | Next.js 16 static export (`out/`), React 19, TypeScript, no server |
| Hosting | GitHub Pages via `.github/workflows/pages.yml` |
| Phase 1 | Faithful WordPress → React port, tagged `phase-1` |
| Design | "Spotlight orange", shared with edoncreate.com (`docs/handoff/`) |

## Everyday tasks

| I want to… | Do this |
|---|---|
| Publish a new beat | Upload it to YouTube (@ED8125). The site rebuilds daily at 05:17 UTC and picks it up. Can't wait? Actions → *Deploy to GitHub Pages* → **Run workflow**. |
| Add Lost Tapes | Drop the files into `~/Desktop/02_Lost_Tapes/<volume folder>`, run `npm run media:lost-tapes` (needs `ffmpeg`), check the titles, commit, push. |
| Fix a Lost Tape title / hide one | `content/lost-tapes-overrides.json`: `"vol-2/beat-da-dica": { "title": "…" }` or `{ "hidden": true }`, then `npm run media:lost-tapes`. |
| Edit bio, headline, socials | `content/site.ts` |
| Edit projects (Brasil com amor, One week one beat) | `content/projects.ts`; album audio in `public/media/audio/brasil-com-amor/` |
| Edit collabs (Los Maschineros, MCs) | `content/collabs.ts` — matches Lost Tapes by title prefix / note |
| Write new copy | Use `docs/ed8125-context.md` (artist voice, history, facts) |
| Refresh the YouTube fallback | `npm run media:youtube-snapshot`, commit |

Every push to `main` redeploys (about 2 minutes). Check progress at
https://github.com/edoncreate/ed8125/actions.

## Run it locally

```bash
npm install
npm run dev                 # http://localhost:3000
npm test                    # unit tests (Vitest)
npm run test:e2e            # browser tests (Playwright, desktop + phone)
npm run typecheck && npm run lint
```

Reproduce the Pages build exactly: `NEXT_PUBLIC_BASE_PATH=/ed8125 npm run build && node tests/serve-out.mjs`.

## Deploy setup

The workflow runs on push to `main`, daily (cron `17 5 * * *`), and on demand. It runs
`npm ci → npm test → npm run build → upload out/ → deploy`. A failing unit test blocks the deploy.

Settings it reads (repo → Settings → Secrets and variables → Actions):

| Name | Kind | What it does |
|---|---|---|
| `YOUTUBE` (or `YOUTUBE_API_KEY`) | Secret | YouTube Data API v3 key. With it the site lists **every** upload (39 One week one beat episodes as of today). Without it: only the latest 15 from RSS + `content/youtube-snapshot.json`. |
| `CUSTOM_DOMAIN` | Variable | Not set yet. Set to `true` after ed8125.com points at Pages — switches base path `/ed8125` → `/` and the canonical origin to https://ed8125.com. |

The API key lives in Google Cloud project **ed8125** → APIs & services → Credentials. It is restricted
to YouTube Data API v3, application restriction *None* (only the build uses it, never browsers). Free
quota is far above what one daily build uses. Never paste the key into code, chat or a commit.

## Moving to ed8125.com

1. Repo → Settings → Pages → **Custom domain**: `ed8125.com` → Save.
2. At the DNS provider for ed8125.com:
   - `A` records for `@`: `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
   - optional `AAAA` for `@`: `2606:50c0:8000::153`, `2606:50c0:8001::153`, `2606:50c0:8002::153`, `2606:50c0:8003::153`
   - `CNAME` for `www` → `edoncreate.github.io`
   - remove the old WordPress host records.
3. Wait for the DNS check to pass in Settings → Pages, then tick **Enforce HTTPS**.
4. Set the repo variable `CUSTOM_DOMAIN` = `true`, then **Run workflow**.
5. Check https://ed8125.com/ loads, audio plays, and the share preview (og:image) uses ed8125.com.

No `CNAME` file is needed in the repo: with Actions deploys, the domain lives in Settings → Pages.

## Size budget

GitHub Pages allows **1 GB** per site. Today: `public/media` ≈ 736 MB (Lost Tapes ≈ 603 MB, 139
tracks, mp3 192k), the built site ≈ 820 MB, the upload artifact ≈ 718 MB. Roughly **180 MB of
headroom**, about 30–40 more tracks.

When it gets close: host the Lost Tapes mp3s elsewhere (e.g. Cloudflare R2 or another bucket), set
`NEXT_PUBLIC_LOST_TAPES_BASE` to that URL in the workflow's build env, and remove the files from
`public/media/lost-tapes/`. The code already supports this (`src/lib/content.ts`).

## GitHub and git rules

- Push and open PRs **as `edoncreate`, per command**. The machine's default gh account is a
  different one with no access here; don't switch it. One-off push:
  ```bash
  git -c credential.helper= -c credential.https://github.com.helper= \
      -c 'credential.https://github.com.helper=!f(){ echo username=x-access-token; echo "password=$(gh auth token --user edoncreate)"; }; f' \
      push origin main
  ```
  For `gh` commands: `GH_TOKEN="$(gh auth token --user edoncreate)" gh …`
- Commits use the GitHub no-reply address (set in this repo's local git config). The repo is
  public, so never commit with a personal or work email. History was rewritten on 2026-11-23 to
  remove them; keep it that way.
- Never commit secrets, `.env` files, the old FTP copy, or any code from the compromised WordPress
  install. The Lost Tapes **mp3s are committed on purpose** (they're served by Pages); the source
  WAVs on the Desktop are not.

## How the code is laid out

- `content/` — all site data: `site.ts`, `projects.ts`, `collabs.ts`, generated `lost-tapes.json`,
  `lost-tapes-overrides.json`, `youtube-snapshot.json`.
- `src/lib/` — `content.ts` (data helpers), `youtube.ts` (RSS / Data API + snapshot merge),
  `lost-tapes.ts` (file-name parsing, title cleanup), `asset.ts` (base-path prefixing).
- `src/components/player/` — one player for the whole site (root layout): audio bar + YouTube
  mini-player. Keeps playing across page changes.
- `src/components/chrome/` — header, footer, grid, theme; ported from edoncreate.com, keep portable.
- `src/components/home/`, `src/components/music/` — chapters, hero, video grid, track lists.
- `scripts/` — `build-lost-tapes.ts`, `snapshot-youtube.ts`, `og-image.tsx`.

## Things learned the hard way

- **Only 15 episodes showing?** The YouTube key isn't reaching the build. Check the secret name
  (`YOUTUBE` or `YOUTUBE_API_KEY`) and that it's under *Repository secrets*, then re-run.
- **Broken image/audio on Pages but fine locally?** A site-relative path skipped `asset()`. Every
  `/media/...` URL in components must go through `asset()` because of the `/ed8125` base path.
- **YouTube videos are 16:9 with square cover art in the middle.** Square tiles crop the thumbnail at
  `width: 177.78%`, centred. The play badge sits bottom-right because the episode number is
  bottom-left on the art.
- Unit tests run **without** the base path env (it's set only on the build step); tests that check
  URLs use `asset()` for the expected value.
- The og:image is a static PNG (`src/app/opengraph-image.png`); regenerate with `scripts/og-image.tsx`.
- Next.js 16 differs from older versions — read `AGENTS.md` and `node_modules/next/dist/docs/`.

## Open items

- [ ] Point ed8125.com at GitHub Pages (steps above).
- [ ] Los Maschineros vol 1 & 2: details, credits, artwork (`content/collabs.ts`, both marked "soon").
- [ ] Beats for MCs: who, which beats, links.
- [ ] Delete `edoncreate/ed8125-old` once sure nothing is needed from it.
- [ ] Watch the Pages size budget as Lost Tapes grow.
- [ ] GitHub warns that the Pages actions run on deprecated Node 20; bump the action versions when
      new majors ship.
