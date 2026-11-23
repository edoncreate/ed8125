/**
 * Builds the Lost Tapes archive from Eduardo's folder of old beats.
 *
 *   npm run media:lost-tapes            (LOST_TAPES_DIR overrides the source folder)
 *
 * - content/lost-tapes.json  ← committed: volumes, titles, years, durations
 * - public/media/lost-tapes/ ← git-ignored mp3s (WAVs are encoded to 192 kbps);
 *                              upload this folder to the audio host for production
 *
 * Titles come from the file's title tag when it has one, else from the file
 * name. Fix any of them in content/lost-tapes-overrides.json, keyed
 * "<volume>/<slug>": { "title": "...", "note": "...", "hidden": true }.
 */
import { execFileSync } from "node:child_process";
import { copyFileSync, existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { cleanTrackTitle, parseLostTapeFilename, parseVolumeFolder, slugify } from "../src/lib/lost-tapes";
import { cleanTitle } from "../src/lib/youtube";

type Override = { title?: string; note?: string; hidden?: boolean };
export type LostTape = {
  slug: string;
  title: string;
  year: number | null;
  date: string | null;
  note: string | null;
  instrumental: boolean;
  duration: number;
  file: string;
  source: string;
};
export type LostTapeVolume = { id: string; label: string; from: number; to: number; tracks: LostTape[] };

const SRC = process.env.LOST_TAPES_DIR ?? join(homedir(), "Desktop/02_Lost_Tapes");
const root = new URL("..", import.meta.url).pathname;
const OUT_AUDIO = join(root, "public/media/lost-tapes");
const OUT_JSON = join(root, "content/lost-tapes.json");
const OVERRIDES = join(root, "content/lost-tapes-overrides.json");
const AUDIO = /\.(mp3|wav)$/i;

const overrides: Record<string, Override> = existsSync(OVERRIDES)
  ? JSON.parse(readFileSync(OVERRIDES, "utf8"))
  : {};

function probe(path: string): { duration: number; title: string | null } {
  const out = execFileSync(
    "ffprobe",
    ["-v", "error", "-show_entries", "format=duration:format_tags=title", "-of", "json", path],
    { encoding: "utf8" },
  );
  const j = JSON.parse(out) as { format?: { duration?: string; tags?: { title?: string } } };
  return { duration: Math.round(Number(j.format?.duration ?? 0)), title: j.format?.tags?.title?.trim() || null };
}

function encodeOrCopy(src: string, dest: string) {
  if (existsSync(dest) && statSync(dest).mtimeMs >= statSync(src).mtimeMs) return;
  if (/\.mp3$/i.test(src)) copyFileSync(src, dest);
  else execFileSync("ffmpeg", ["-v", "error", "-y", "-i", src, "-codec:a", "libmp3lame", "-b:a", "192k", dest]);
}

const volumes: LostTapeVolume[] = [];
for (const folder of readdirSync(SRC).filter((f) => statSync(join(SRC, f)).isDirectory())) {
  const info = parseVolumeFolder(folder);
  mkdirSync(join(OUT_AUDIO, info.id), { recursive: true });
  const used = new Set<string>();
  const tracks: LostTape[] = [];

  for (const name of readdirSync(join(SRC, folder)).filter((f) => AUDIO.test(f)).sort()) {
    const srcPath = join(SRC, folder, name);
    const parsed = parseLostTapeFilename(name);
    const meta = probe(srcPath);
    const tagTitle = meta.title ? cleanTitle(meta.title) : null;
    const cleaned = cleanTrackTitle(tagTitle && tagTitle.length > 1 ? tagTitle : parsed.title);
    let title = cleaned.title;

    let slug = slugify(parsed.title) || "untitled";
    for (let n = 2; used.has(slug); n++) slug = `${slugify(parsed.title)}-${n}`;
    used.add(slug);

    const o = overrides[`${info.id}/${slug}`] ?? {};
    if (o.hidden) continue;
    title = o.title ?? title;
    const file = `${info.id}/${slug}.mp3`;
    encodeOrCopy(srcPath, join(OUT_AUDIO, file));
    tracks.push({
      slug,
      title,
      year: parsed.year,
      date: parsed.date,
      note: o.note ?? parsed.note,
      instrumental: cleaned.instrumental,
      duration: meta.duration,
      file,
      source: `${folder}/${name}`,
    });
    process.stdout.write(".");
  }

  tracks.sort((a, b) => (a.date ?? `${a.year}`).localeCompare(b.date ?? `${b.year}`) || a.title.localeCompare(b.title));
  volumes.push({ ...info, tracks });
}

volumes.sort((a, b) => a.from - b.from);
writeFileSync(OUT_JSON, JSON.stringify(volumes, null, 2) + "\n");
console.log(`\nlost-tapes.json: ${volumes.map((v) => `${v.label} ${v.tracks.length}`).join(", ")}`);
