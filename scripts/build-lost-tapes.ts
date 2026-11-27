/**
 * Builds the Lost Tapes archive from Eduardo's folder of old beats.
 *
 *   npm run media:lost-tapes            (LOST_TAPES_DIR overrides the source folder)
 *
 * - content/lost-tapes.json  ← committed: volumes, titles, years, durations
 * - public/media/lost-tapes/ ← committed mp3s served by GitHub Pages (WAVs are encoded
 *                              to 192 kbps); files no track uses any more are deleted
 *
 * Titles come from the file's title tag when it has one, else from the file
 * name, cleaned by cleanTrackTitle(). The mp3 name is the slug of the final title.
 * Fix any of them in content/lost-tapes-overrides.json, keyed by the SOURCE file:
 * "<volume>/<slugified file name>" (e.g. "vol-1/beat-em-im-2"):
 * { "title": "...", "note": "...", "hidden": true }.
 */
import { execFileSync } from "node:child_process";
import { copyFileSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
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
const keep = new Set<string>();
for (const folder of readdirSync(SRC).filter((f) => statSync(join(SRC, f)).isDirectory())) {
  const info = parseVolumeFolder(folder);
  mkdirSync(join(OUT_AUDIO, info.id), { recursive: true });
  const used = new Set<string>();
  const usedKeys = new Set<string>();
  const tracks: LostTape[] = [];

  for (const name of readdirSync(join(SRC, folder)).filter((f) => AUDIO.test(f)).sort()) {
    const srcPath = join(SRC, folder, name);
    const parsed = parseLostTapeFilename(name);
    const meta = probe(srcPath);
    const tagTitle = meta.title ? cleanTitle(meta.title) : null;
    const cleaned = cleanTrackTitle(tagTitle && tagTitle.length > 1 ? tagTitle : parsed.title);
    let title = cleaned.title;

    // Override key: stable, from the source file name.
    let key = slugify(parsed.title) || "untitled";
    for (let n = 2; usedKeys.has(key); n++) key = `${slugify(parsed.title)}-${n}`;
    usedKeys.add(key);

    const o = overrides[`${info.id}/${key}`] ?? {};
    if (o.hidden) continue;
    title = o.title ?? title;

    // Public slug and mp3 name: from the final, cleaned title.
    const base = slugify(title.replace(/^Los Maschineros – /, "")) || key;
    let slug = base;
    for (let n = 2; used.has(slug); n++) slug = `${base}-${n}`;
    used.add(slug);
    const file = `${info.id}/${slug}.mp3`;
    keep.add(file);
    // Reuse an encode made under the source-file name (before titles were cleaned).
    const old = join(OUT_AUDIO, `${info.id}/${key}.mp3`);
    if (!existsSync(join(OUT_AUDIO, file)) && existsSync(old) && !keep.has(`${info.id}/${key}.mp3`)) {
      copyFileSync(old, join(OUT_AUDIO, file));
    }
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

// Drop mp3s no track points at any more (renamed or hidden).
for (const dir of readdirSync(OUT_AUDIO)) {
  if (!statSync(join(OUT_AUDIO, dir)).isDirectory()) continue;
  for (const f of readdirSync(join(OUT_AUDIO, dir))) {
    if (!keep.has(`${dir}/${f}`)) rmSync(join(OUT_AUDIO, dir, f));
  }
}
writeFileSync(OUT_JSON, JSON.stringify(volumes, null, 2) + "\n");
console.log(`\nlost-tapes.json: ${volumes.map((v) => `${v.label} ${v.tracks.length}`).join(", ")}`);
