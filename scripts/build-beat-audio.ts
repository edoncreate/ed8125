/**
 * Puts the One week one beat audio on the site.
 *
 *   npm run media:beats            (BEATS_DIR overrides the source folder)
 *
 * Source: ~/Desktop/youtube, filled from the One week one beat playlist with
 *   yt-dlp -x --audio-format mp3 -P ~/Desktop/youtube "https://www.youtube.com/playlist?list=PLiFbISKHIpBsdjGdsKHQ9qJSnEFuPJprS"
 * Files are named as yt-dlp names them, "ED8125 - Temes [_CZF_9reLJI].mp3". The [id] matches each
 * file to its YouTube video; the episode number (the number on the cover art) is the video's place
 * in upload order. Beats already on the site stay, so the folder may hold only the new ones.
 * Writes:
 * - public/media/beats/NN-<slug>.mp3  ← committed, served by GitHub Pages (mp3s are copied as is)
 * - content/beat-audio.json           ← committed: YouTube id → file, duration, episode
 */
import { execFileSync } from "node:child_process";
import { copyFileSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { beatFileName, parseDownloadName, type BeatAudio } from "../src/lib/content";
import { getChannelVideos } from "../src/lib/youtube";

const SRC = process.env.BEATS_DIR ?? join(homedir(), "Desktop/youtube");
const root = new URL("..", import.meta.url).pathname;
const OUT_AUDIO = join(root, "public/media/beats");
const OUT_JSON = join(root, "content/beat-audio.json");
const MEDIA = /\.(mp3|m4a|mp4|mov|webm|wav|opus)$/i;

if (!existsSync(SRC)) {
  console.error(`No folder at ${SRC} (set BEATS_DIR).`);
  process.exit(1);
}

const duration = (path: string) =>
  Math.round(
    Number(execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", path], { encoding: "utf8" })),
  );

// Oldest first: episode 1 is the first upload, as on the covers.
const videos = (await getChannelVideos()).sort((a, b) => a.published.localeCompare(b.published));
const episodeOf = new Map(videos.map((v, i) => [v.id, i + 1]));
const titleOf = new Map(videos.map((v) => [v.id, v.title]));

// Start from what is already on the site; files in SRC add to it or replace their own entry.
const previous: BeatAudio = existsSync(OUT_JSON) ? JSON.parse(readFileSync(OUT_JSON, "utf8")) : {};
const out: BeatAudio = Object.fromEntries(
  Object.entries(previous).filter(([id, a]) => episodeOf.has(id) && existsSync(join(OUT_AUDIO, a.file))),
);
mkdirSync(OUT_AUDIO, { recursive: true });

for (const name of readdirSync(SRC).filter((f) => MEDIA.test(f)).sort()) {
  const parsed = parseDownloadName(name);
  const episode = parsed && episodeOf.get(parsed.id);
  if (!parsed || !episode) {
    console.warn(`skip (no matching YouTube video): ${name}`);
    continue;
  }
  const file = beatFileName(episode, titleOf.get(parsed.id) ?? parsed.title);
  if (out[parsed.id]?.file === file && process.env.FORCE !== "1") continue; // already on the site
  const dest = join(OUT_AUDIO, file);
  if (/\.mp3$/i.test(name)) copyFileSync(join(SRC, name), dest);
  else execFileSync("ffmpeg", ["-v", "error", "-y", "-i", join(SRC, name), "-vn", "-codec:a", "libmp3lame", "-b:a", "192k", dest]);
  out[parsed.id] = { file, duration: duration(dest), episode };
  console.log(`#${String(episode).padStart(2, "0")}  ${file}`);
}

for (const f of readdirSync(OUT_AUDIO)) {
  if (!Object.values(out).some((a) => a.file === f)) rmSync(join(OUT_AUDIO, f));
}
const sorted = Object.fromEntries(Object.entries(out).sort(([, a], [, b]) => a.episode - b.episode));
writeFileSync(OUT_JSON, JSON.stringify(sorted, null, 2) + "\n");
const missing = videos.filter((v) => !out[v.id]).map((v) => `#${episodeOf.get(v.id)} ${v.title}`);
console.log(`\nbeat-audio.json: ${Object.keys(sorted).length} of ${videos.length} beats${missing.length ? `; no audio yet: ${missing.join(", ")}` : ""}`);
