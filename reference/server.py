"""Reference server for the original ED8125 WordPress site.

Serves the archived page HTML in reference/site/ and the original theme/plugin/
upload assets straight from the FTP copy, so the old site renders locally with
its real CSS. Emulates the one dynamic endpoint the pages need: AudioIgniter's
playlist JSON (/?audioigniter_playlist_id=N). The original playlists lived in
the lost WordPress database, so tracklists are rebuilt from the mp3 files.

PHP is never executed, and .php files are refused (the install is compromised).

Run:  npm run ref            (python3 -I reference/server.py)
Env:  ED8125_FTP=/path/to/ftp/ed8125   (default below)
"""
import json
import os
import re
import unicodedata
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import parse_qs, quote, unquote, urlsplit

HERE = os.path.dirname(os.path.abspath(__file__))
SITE = os.path.join(HERE, "site")
FTP = os.environ.get("ED8125_FTP", "~/Documents/EDONCREATE/ftp/ed8125")
UPLOADS = os.path.join(FTP, "wp-content", "uploads")
PORT = int(os.environ.get("REF_PORT", "8125"))
BASE = f"http://localhost:{PORT}/wp-content/uploads/"
FTP_PREFIXES = ("/wp-content/", "/wp-includes/")


def find(rel_dir, name):
    """On-disk filename in uploads/rel_dir matching name (NFC/NFD/case-insensitive)."""
    want = unicodedata.normalize("NFC", name).lower()
    for f in os.listdir(os.path.join(UPLOADS, rel_dir)):
        if unicodedata.normalize("NFC", f).lower() == want:
            return f
    raise FileNotFoundError(f"{rel_dir}/{name}")


def url(rel_dir, name):
    return BASE + quote(f"{rel_dir}/{find(rel_dir, name)}")


def cover(rel_dir, name):
    stem, ext = os.path.splitext(name)
    try:
        return url(rel_dir, f"{stem}-560x560{ext}")
    except FileNotFoundError:
        return url(rel_dir, name)


def track(title, audio_dir, audio_file, cover_dir, cover_file, artist="ED8125"):
    return {
        "title": title,
        "subtitle": artist,
        "audio": url(audio_dir, audio_file),
        "buyUrl": "",
        "downloadUrl": "",
        "downloadFilename": "",
        "cover": cover(cover_dir, cover_file),
    }


def album_483():
    """Brasil com amor: the 11 numbered files in uploads/2020/09."""
    files = sorted(
        f for f in os.listdir(os.path.join(UPLOADS, "2020/09"))
        if re.match(r"^\d{2}-.+\.mp3$", f)
    )
    out = []
    for f in files:
        title = unicodedata.normalize("NFC", f[3:-4]).replace("-", " ")
        out.append(track(title[0].upper() + title[1:], "2020/09", f, "2020/09", "front-cover.png"))
    return out


def beats_123():
    """Latest beats: the 10 covers of the home-page carousel. Stored oldest-first;
    the player has data-reverse-track-order=true so MAD shows first."""
    return [
        track("Abril M'Águas 1000", "2020/01", "LANDR-Abril-MÁguas-1000-High-Balanced.mp3", "2020/09", "Abril-Maguas-1000.png"),
        track("Mais Amor Por Favor", "2020/01", "Mais-Amor-Por-Favor.mp3", "2019/08", "art-cover.png"),
        track("Follow Your Heart", "2020/01", "Follow-Your-Heart.mp3", "2020/01", "follow-your-heart_optimized.png"),
        track("Vou Por Aí", "2020/01", "Vou-Por-Ai.mp3", "2020/01", "vou-por-ai_optimized.png"),
        track("Vamos à Luta", "2020/01", "Vamos-A-Luta.mp3", "2020/01", "VamosALuta_optimized.png"),
        track("One Love", "2020/01", "One-Love.mp3", "2020/01", "One-Love.png"),
        track("It's Time to Think", "2020/09", "It-is-Time-to-Think-RELEASE.mp3", "2020/09", "it-is-time-to-think.png"),
        track("Sean Price ft Tek (Remix)", "2020/11", "2020_11_15_REMIX_Sean-Prince-ft-Tek.mp3", "2020/11", "Cover-Sean-Price.png"),
        track("Tributo Carlos do Carmo", "2021/03", "2021_01_03_Tributo_-Carlos_do_Carmo.mp3", "2021/03", "cover-carlos-do-carmo-tributo.png"),
        track("MAD", "2021/02", "2021_02_28_Mad.mp3", "2021/02", "banner-release.png"),
    ]


PLAYLISTS = {"483": album_483, "123": beats_123}


class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *a, **kw):
        super().__init__(*a, directory=SITE, **kw)

    def log_message(self, fmt, *args):
        if os.environ.get("REF_VERBOSE"):
            super().log_message(fmt, *args)

    def end_headers(self):
        self.send_header("Cache-Control", "no-store")
        self.send_header("Accept-Ranges", "bytes")
        super().end_headers()

    def translate_path(self, path):
        clean = unquote(urlsplit(path).path)
        if clean.startswith(FTP_PREFIXES):
            full = os.path.normpath(os.path.join(FTP, clean.lstrip("/")))
            if full.startswith(os.path.normpath(FTP) + os.sep):
                return full
        return super().translate_path(path)

    def do_GET(self):
        split = urlsplit(self.path)
        if split.path.lower().endswith(".php"):
            self.send_error(403, "PHP is not served")
            return
        pid = (parse_qs(split.query).get("audioigniter_playlist_id") or [None])[0]
        if pid is not None:
            fn = PLAYLISTS.get(pid)
            body = json.dumps(fn() if fn else {"success": False}).encode()
            self.send_response(200 if fn else 404)
            self.send_header("Content-Type", "application/json")
            self.send_header("Content-Length", str(len(body)))
            self.end_headers()
            self.wfile.write(body)
            return
        rng = self.headers.get("Range")
        path = self.translate_path(self.path)
        if rng and os.path.isfile(path):
            self.send_range(path, rng)
            return
        super().do_GET()

    def send_range(self, path, rng):
        size = os.path.getsize(path)
        m = re.match(r"bytes=(\d*)-(\d*)", rng)
        start = int(m.group(1)) if m and m.group(1) else 0
        end = min(int(m.group(2)) if m and m.group(2) else size - 1, size - 1)
        if start > end:
            self.send_response(416)
            self.send_header("Content-Range", f"bytes */{size}")
            self.end_headers()
            return
        self.send_response(206)
        self.send_header("Content-Type", self.guess_type(path))
        self.send_header("Content-Range", f"bytes {start}-{end}/{size}")
        self.send_header("Content-Length", str(end - start + 1))
        self.end_headers()
        with open(path, "rb") as fh:
            fh.seek(start)
            left = end - start + 1
            while left > 0:
                chunk = fh.read(min(65536, left))
                if not chunk:
                    break
                try:
                    self.wfile.write(chunk)
                except (BrokenPipeError, ConnectionResetError):
                    return
                left -= len(chunk)


if __name__ == "__main__":
    if not os.path.isdir(UPLOADS):
        raise SystemExit(f"FTP copy not found at {FTP} (set ED8125_FTP)")
    for k, fn in PLAYLISTS.items():
        print(f"playlist {k}: {len(fn())} tracks", flush=True)
    print(f"reference site on http://localhost:{PORT}/", flush=True)
    ThreadingHTTPServer(("127.0.0.1", PORT), Handler).serve_forever()
