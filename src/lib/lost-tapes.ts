/**
 * Turns the Lost Tapes archive's file and folder names into track metadata.
 * Names look like "2010 - beat da nostalgia (zidek).mp3" or
 * "2018_11_13_Suzanne_Vega_Tom_s_Diner_Project_v4.mp3"; titles can be fixed by
 * hand in content/lost-tapes-overrides.json.
 */

export type ParsedName = {
  year: number | null;
  /** YYYY-MM-DD when the name carries a full date. */
  date: string | null;
  title: string;
  /** Trailing parenthetical that isn't a copy counter, e.g. an MC or gear name. */
  note: string | null;
};

export type VolumeInfo = { id: string; label: string; from: number; to: number };

const DATED = /^(\d{4})_(\d{2})_(\d{2})_(.*)$/;
const DATED_SHORT = /^(\d{2})_(\d{2})_(\d{2})_(.*)$/;
const YEARED = /^(\d{4})\s*-\s*(.*)$/;

function tidy(s: string): string {
  return s.replace(/_/g, " ").replace(/\s+/g, " ").trim();
}

export function parseLostTapeFilename(filename: string): ParsedName {
  const base = filename.replace(/\.[a-z0-9]+$/i, "");
  let year: number | null = null;
  let date: string | null = null;
  let rest = base;

  let m = DATED.exec(base);
  if (m) {
    year = Number(m[1]);
    date = `${m[1]}-${m[2]}-${m[3]}`;
    rest = m[4];
  } else if ((m = DATED_SHORT.exec(base))) {
    year = 2000 + Number(m[1]);
    date = `${year}-${m[2]}-${m[3]}`;
    rest = m[4];
  } else if ((m = YEARED.exec(base))) {
    year = Number(m[1]);
    rest = m[2];
  }

  let title = tidy(rest);
  let note: string | null = null;
  for (;;) {
    const before = title;
    title = title.replace(/\s*-\s*ED8125$/i, "").replace(/\s*-$/, "").replace(/\s*\(\d+\)$/, "").trim();
    const paren = /\s*\(([^()]*\D[^()]*)\)$/.exec(title);
    if (paren && note === null) {
      note = paren[1].trim();
      title = title.slice(0, paren.index).trim();
    }
    if (title === before) break;
  }
  if (title) title = title[0].toUpperCase() + title.slice(1);
  return { year, date, title, note };
}

export function parseVolumeFolder(folder: string): VolumeInfo {
  const m = /vol\s*(\d+)\s*\((\d{4})\s*-\s*(\d{4})\)/i.exec(folder);
  if (m) return { id: `vol-${m[1]}`, label: `Vol. ${m[1]}`, from: Number(m[2]), to: Number(m[3]) };
  const y = /^(\d{4})$/.exec(folder.trim());
  if (y) return { id: y[1], label: y[1], from: Number(y[1]), to: Number(y[1]) };
  throw new Error(`Unrecognised Lost Tapes folder: ${folder}`);
}

export function slugify(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Tidies a raw archive title: "LOS MASCHINEROS - Besame" → "Los Maschineros – Besame",
 * drops the word "beat", bare numbers ("11 - beat Cavalo Preto" → "Cavalo Preto"),
 * working-file noise ("Project v2", "versao 1", "new", "wav", "LowQ", "por ED8125") and an
 * "INSTR" marker (reported as `instrumental`). Numbers inside a word ("4Camels") stay.
 */
export function cleanTrackTitle(raw: string): { title: string; instrumental: boolean } {
  let t = raw.trim();
  let instrumental = false;
  if (/\s+INSTRU?M?(ENTAL)?\.?$/i.test(t)) {
    instrumental = true;
    t = t.replace(/\s+INSTRU?M?(ENTAL)?\.?$/i, "");
  }
  const lm = /^los maschineros\s*[-–—]\s*/i.test(t);
  t = t.replace(/^los maschineros\s*[-–—]\s*/i, "");
  const fallback = t.replace(/\s+/g, " ").trim();
  t = t
    .replace(/\s+project(\s+v\d+)?\b/gi, "")
    .replace(/\s+(v\d+|versao\s+\d+|new|wav|lowq|por\s+ed8125)(?=\s|$)/gi, "")
    .replace(/(^|[\s-])\d*beat(?=\s|$)/gi, "$1")
    .replace(/(^|\s)\d+(?:\.\d+)*(?=\s|$)/g, "$1")
    .replace(/^\s*\d+(?=[a-z])/i, "")
    .replace(/\s+/g, " ")
    .replace(/^[\s-]+|[\s-]+$/g, "")
    .trim();
  if (!t) t = fallback;
  if (t) t = t[0].toUpperCase() + t.slice(1);
  if (lm) t = `Los Maschineros – ${t}`;
  return { title: t, instrumental };
}
