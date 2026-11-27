/**
 * Turns the One week one beat videos into audio for the site player.
 *
 *   npm run media:beats            (BEATS_DIR overrides the source folder)
 *
 * Put the videos downloaded from YouTube Studio (Content → ⋮ → Download) in
 * ~/Desktop/03_One_Week_One_Beat. File names are the video titles, so each file
 * matches its YouTube video by beatSlug(). Writes:
 * - public/media/beats/<slug>.mp3  ← committed, served by GitHub Pages (192 kbps)
 * - content/beat-audio.json        ← committed: slug → file + duration
 */
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { beatSlug, type BeatAudio } from "../src/lib/content";

const SRC = process.env.BEATS_DIR ?? join(homedir(), "Desktop/03_One_Week_One_Beat");
const root = new URL("..", import.meta.url).pathname;
const OUT_AUDIO = join(root, "public/media/beats");
const OUT_JSON = join(root, "content/beat-audio.json");
const MEDIA = /\.(mp4|mov|m4v|webm|mkv|m4a|wav|aiff?|mp3)$/i;

if (!existsSync(SRC)) {
  console.error(`No folder at ${SRC}. Download the videos from YouTube Studio into it (or set BEATS_DIR).`);
  process.exit(1);
}

const duration = (path: string) =>
  Math.round(Number(execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", path], { encoding: "utf8" })));

const previous: BeatAudio = existsSync(OUT_JSON) ? JSON.parse(readFileSync(OUT_JSON, "utf8")) : {};
const out: BeatAudio = { ...previous };
mkdirSync(OUT_AUDIO, { recursive: true });

for (const name of readdirSync(SRC).filter((f) => MEDIA.test(f)).sort()) {
  const src = join(SRC, name);
  const slug = beatSlug(name.replace(MEDIA, ""));
  if (!slug) continue;
  const file = `${slug}.mp3`;
  const dest = join(OUT_AUDIO, file);
  if (!existsSync(dest) || statSync(dest).mtimeMs < statSync(src).mtimeMs) {
    execFileSync("ffmpeg", ["-v", "error", "-y", "-i", src, "-vn", "-ac", "2", "-codec:a", "libmp3lame", "-b:a", "192k", dest]);
  }
  out[slug] = { file, duration: duration(dest) };
  console.log(`${slug.padEnd(32)} ${out[slug].duration}s  ← ${name}`);
}

for (const f of readdirSync(OUT_AUDIO)) {
  if (!Object.values(out).some((a) => a.file === f)) rmSync(join(OUT_AUDIO, f));
}
const sorted = Object.fromEntries(Object.entries(out).sort(([a], [b]) => a.localeCompare(b)));
writeFileSync(OUT_JSON, JSON.stringify(sorted, null, 2) + "\n");
console.log(`\nbeat-audio.json: ${Object.keys(sorted).length} beats`);
