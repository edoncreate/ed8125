# Reference: the original WordPress site

Local, read-only replica of ed8125.com (Astra + Elementor) used to check that the
React app matches it.

- `site/` — page HTML from the Wayback Machine (home 2024-07-20, album and
  latest-beats 2023-05-28) with `ed8125.com` URLs rewritten to `localhost:8125`.
  `site/local-css/` holds Elementor CSS files whose image URLs were absolute.
- `server.py` — serves `site/` plus static assets from `wp-content/` and
  `wp-includes/` of the FTP copy (`ED8125_FTP`, default
  `~/Documents/EDONCREATE/ftp/ed8125`), emulates AudioIgniter's playlist JSON and
  supports audio seeking. Paths are decoded and confined by realpath; only
  css/js/image/font/mp3 files are served; no PHP, configs or directory listings.
- `js-allowlist.json` — the only JavaScript the server will serve: 21 files whose
  SHA-256 matched the pristine wordpress.org releases (WordPress 5.4.16, Elementor
  3.1.1, AudioIgniter 1.6.3, …) on 2026-11-22. Anything else, or any later change
  to those files, gets a 403.
- `css/` — the original CSS for reading while porting: `post-150.css` (home),
  `post-481.css` (/brasil-com-amor/), `post-597.css` (/latest-beats/),
  `post-309.css` + `global.css` (Elementor kit), `post-25.css`, `inline.css`
  (all inline `<style>` blocks incl. custom CSS), `audioigniter.css` (player).

Run: `npm run ref` → http://localhost:8125/

The FTP copy is compromised (spam injector in `12so/`, `2JNJf/`, unknown plugins).
What runs from it: no PHP ever. In the browser, the archived pages run only the
hash-verified JavaScript above (jQuery, Elementor, AudioIgniter, …); unverifiable
scripts (smooth-scroll, WonderPlugin) are refused. The fidelity tests open the
original in a separate browser context with every third-party host blocked except
Google Fonts (no analytics, tag manager or AddThis). The React app copies only
images, mp3s and the Bebas Neue font.
