# Reference: the original WordPress site

Local, read-only replica of ed8125.com (Astra + Elementor) used to check that the
React app matches it.

- `site/` — page HTML from the Wayback Machine (home 2024-07-20, album and
  latest-beats 2023-05-28) with `ed8125.com` URLs rewritten to `localhost:8125`.
  `site/local-css/` holds Elementor CSS files whose image URLs were absolute.
- `server.py` — serves `site/` plus `wp-content/` and `wp-includes/` straight
  from the FTP copy (`ED8125_FTP`, default `~/Documents/EDONCREATE/ftp/ed8125`),
  emulates AudioIgniter's playlist JSON, supports audio seeking, refuses `.php`.
- `css/` — the original CSS for reading while porting: `post-150.css` (home),
  `post-481.css` (/brasil-com-amor/), `post-597.css` (/latest-beats/),
  `post-309.css` + `global.css` (Elementor kit), `post-25.css`, `inline.css`
  (all inline `<style>` blocks incl. custom CSS), `audioigniter.css` (player).

Run: `npm run ref` → http://localhost:8125/

The FTP copy is compromised (spam injector in `12so/`, `2JNJf/`, unknown plugins).
Nothing from it is executed: no PHP runs, and the React app copies only images,
mp3s and the Bebas Neue font.
