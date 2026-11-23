/**
 * Collabs. Eduardo will send details; until then each entry says what is known.
 * Los Maschineros tracks are picked up from the Lost Tapes (title starts with
 * "Los Maschineros"); MC names come from the notes in Lost Tapes file names.
 */
export type Collab = {
  slug: string;
  title: string;
  summary: string;
  /** Volumes still to be detailed by Eduardo. */
  parts?: { title: string; status: "soon" | "out" }[];
  /** Match Lost Tapes tracks that belong to this collab. */
  match?: { titlePrefix?: string; notes?: string[] };
};

export const collabs: Collab[] = [
  {
    slug: "los-maschineros",
    title: "Los Maschineros",
    summary: "A beat project with two volumes. Tracks from the archive are below; the volumes are being put together.",
    parts: [
      { title: "Vol. 1", status: "soon" },
      { title: "Vol. 2", status: "soon" },
    ],
    match: { titlePrefix: "los maschineros" },
  },
  {
    slug: "for-mcs",
    title: "Beats for MCs",
    summary: "Beats made for and sent to MC friends over the years. Credits as they appear on the tapes.",
    match: { notes: ["zidek", "jaydas", "sacik", "trek", "ben", "ps"] },
  },
];
