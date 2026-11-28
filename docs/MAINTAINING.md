# Maintaining ed8125.com

Read this first when picking the site up again. Last updated 2026-11-27.

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
| Publish a new beat | Upload it to YouTube (@ED8125). The site rebuilds daily at 05:17 UTC and picks it up (as a video, and in Radio). Can't wait? Actions → *Deploy to GitHub Pages* → **Run workflow**. |
| Add audio for new beats | **Rule:** after a new upload, run in Terminal:<br>`yt-dlp -x --audio-format mp3 -P ~/Desktop/youtube "https://www.youtube.com/playlist?list=PLiFbISKHIpBsdjGdsKHQ9qJSnEFuPJprS"`<br>then `npm run media:beats`, commit `content/beat-audio.json` + `public/media/beats/`, push. Files are named after the cover number (`40-title.mp3`); the `[id]` from yt-dlp only matches the file to its video and never reaches the site. Beats already on the site are skipped, so re-downloading the whole playlist is fine. A beat without audio plays as video; **Watch video** in the player switches a beat to its video. |
| Los Maschineros audio | Done: `public/media/audio/los-maschineros/vol-1|vol-2/NN-title.mp3`, listed with `file` + `duration` in `content/collabs.ts` (source: `~/Desktop/beats/vol-1`, `vol-2`). A volume plays once **all** its tracks have a file. |
| Add Lost Tapes | Drop the files into `~/Desktop/02_Lost_Tapes/<volume folder>`, run `npm run media:lost-tapes` (needs `ffmpeg`), check the titles, commit, push. |
| Fix a Lost Tape title / hide one | `content/lost-tapes-overrides.json`, keyed by the **source file name** slugified: `"vol-2/beat-da-dica": { "title": "…" }` or `{ "hidden": true }`, then `npm run media:lost-tapes`. Titles drop "beat", bare numbers and "Project/vN/new/wav" automatically; the mp3 name follows the title. Hidden as repeats: Beat em im (2nd), Vou por ai (2 copies), Honey Project (v1). |
| Edit bio, headline, socials | `content/site.ts` |
| Edit projects (Brasil com amor, One week one beat) | `content/projects.ts`; album audio in `public/media/audio/brasil-com-amor/` |
| Edit collabs (Los Maschineros, MCs) | `content/collabs.ts`: Los Maschineros releases (Vol. 1 Classic, Vol. 2 It's a Reggae Music, 2013, from SoundCloud) + Lost Tapes matched by title prefix / note |
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
| `SUPABASE_URL`, `SUPABASE_KEY` | Variables | Listener accounts + playlists. Project URL and **publishable (anon) key** from Supabase → Project Settings → API. Both are public by design. Unset = accounts off (Radio still plays). |
| `CUSTOM_DOMAIN` | Variable | Not set yet. Set to `true` after ed8125.com points at Pages — switches base path `/ed8125` → `/` and the canonical origin to https://ed8125.com. |

The API key lives in Google Cloud project **ed8125** → APIs & services → Credentials. It is restricted
to YouTube Data API v3, application restriction *None* (only the build uses it, never browsers). Free
quota is far above what one daily build uses. Never paste the key into code, chat or a commit.

## Playlists and Radio (Supabase)

- **Radio** (`/radio`, in the section nav) = the latest 20 beats by YouTube release date (`radio()` in `src/lib/content.ts`), audio where a
  beat has some, else the video. Instagram has no feed the site can read, so YouTube dates are the source.
- **Playlists** (`/playlists`, top right of the header): listeners sign in by email link (no password); each playlist is a list of catalog keys
  (`/catalog.json`: every audio track on the site). Add with the **+** in the footer player or from the
  Discography on `/playlists`. Privacy note at `/privacy`; "Delete account" removes the user and playlists.
- **Turning it on** (one time):
  1. Create a free project at supabase.com (region: EU, e.g. Frankfurt).
  2. SQL Editor → paste `supabase/migrations/0001_playlists.sql` → Run, then the same with
     `0002_grants.sql` (new projects grant no table access by default).
  3. Authentication → URL Configuration: Site URL `https://edoncreate.github.io/ed8125/` (later
     `https://ed8125.com/`); Redirect URLs: add `https://edoncreate.github.io/ed8125/playlists/`,
     `https://ed8125.com/playlists/` and `http://localhost:3000/playlists/`.
  4. Repo variables `SUPABASE_URL` and `SUPABASE_KEY` (see the table above), then **Run workflow**.
  5. Optional: Authentication → Emails → customise the sign-in email; for more than a few sign-ins an
     hour, set up custom SMTP (Supabase's built-in mailer is rate-limited).
- Tests fake Supabase (`tests/e2e/playlists.spec.ts`), so CI never needs the real project.

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

GitHub Pages allows **1 GB** per site. Today the built site is ≈ **900 MB**: Lost Tapes ≈ 579 MB (135
tracks), One week one beat ≈ 122 MB (39 × ~3 min, ~130 kbps), Los Maschineros ≈ 63 MB (24 tracks),
Brasil com amor and images the rest. About **100 MB of headroom** ≈ 30 more beats. Before that runs
out, move the Lost Tapes audio off Pages (below).

When it gets close: host the Lost Tapes mp3s elsewhere (e.g. Cloudflare R2 or another bucket), set
`NEXT_PUBLIC_LOST_TAPES_BASE` to that URL in the workflow's build env, and remove the files from
`public/media/lost-tapes/`. The code already supports this (`src/lib/content.ts`).

## GitHub and git rules

- This repo pushes **as `edoncreate`** on its own: `.git/config` has a repo-only credential helper that
  asks `gh` for the edoncreate token (set 2026-11-28). Plain `git push` and the editor's Push button work.
  The Mac's default gh account stays the work one for every other repo; don't switch it. On a new clone,
  set it up again:
  ```bash
  git config --local --add credential.https://github.com.helper ''
  git config --local --add credential.https://github.com.helper '!f() { test "$1" = get || exit 0; echo username=x-access-token; echo "password=$(/opt/homebrew/bin/gh auth token --user edoncreate)"; }; f'
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

- [ ] Point ed8125.com at GitHub Pages — **later, via Vercel DNS** (decided 2026-11-28; stay on the github.io URL while building). Today the domain resolves nowhere: its nameservers (ns1–4.webhs.org, the old host) no longer answer, so nothing breaks in the meantime. Then: nameservers → ns1/ns2.vercel-dns.com, records as in "Moving to ed8125.com", Supabase Site URL → https://ed8125.com/.
- [x] Playlists on: Supabase project `ed8125` (EU, Ireland), migrations 0001 + 0002 run, repo variables set (2026-11-28).
- [ ] Custom SMTP in Supabase before sharing playlists widely (built-in mailer: a few emails/hour).
- [ ] Beats for MCs: who, which beats, links.
- [ ] Delete `edoncreate/ed8125-old` once sure nothing is needed from it.
- [ ] Pages size: ~100 MB left. Move the Lost Tapes mp3s to an audio host before adding much more.
- [ ] GitHub warns that the Pages actions run on deprecated Node 20; bump the action versions when
      new majors ship.
