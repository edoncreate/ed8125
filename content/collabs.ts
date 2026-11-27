/**
 * Collabs. Los Maschineros has two released volumes (SoundCloud, 2013) plus
 * archive tracks picked up from the Lost Tapes (title starts with "Los Maschineros");
 * MC names come from the notes in Lost Tapes file names.
 */
export type ReleaseTrack = {
  title: string;
  /** Seconds, when known. */
  duration?: number;
  /** mp3 under /media/audio/<collab>/; until it exists the track is listed but not playable. */
  file?: string;
};

export type CollabRelease = {
  id: string;
  label: string;
  title: string;
  year: number;
  cover: string;
  url: string;
  description?: string;
  tracks: ReleaseTrack[];
};

export type Collab = {
  slug: string;
  title: string;
  summary: string;
  releases?: CollabRelease[];
  /** Match Lost Tapes tracks that belong to this collab. */
  match?: { titlePrefix?: string; notes?: string[] };
};

export const collabs: Collab[] = [
  {
    slug: "los-maschineros",
    title: "Los Maschineros",
    summary:
      "A project by Portuguese beatmakers with their headquarters in Lisboa, built around Maschine: music for cinema, radio, television and any other sonic challenge.",
    releases: [
      {
        id: "vol-1",
        label: "Vol. 1",
        title: "Classic",
        year: 2013,
        cover: "/media/img/los-maschineros-classic.jpg",
        url: "https://soundcloud.com/los-maschineros/sets/los-maschineros-classic",
        description:
          "Presented by Maestro Vitorino d’Almeida, Classic fuses the feeling of a symphonic orchestra with hip hop instrumentals and electronic ambience.",
        tracks: [
          { title: "Clássico", duration: 124 },
          { title: "Quebrar a regra", duration: 146 },
          { title: "Regra morta", duration: 199 },
          { title: "Julgamento errado", duration: 186 },
          { title: "O prazer de criar", duration: 152 },
          { title: "Exceção é regra" },
          { title: "Não digas que não presta" },
          { title: "Ruídos abjetos" },
          { title: "Noite transfigurada" },
          { title: "Ideias intuitivas" },
          { title: "Era tudo bonito" },
          { title: "Sensibilidade musical" },
          { title: "Desobediência organizada" },
        ],
      },
      {
        id: "vol-2",
        label: "Vol. 2",
        title: "It’s a Reggae Music",
        year: 2013,
        cover: "/media/img/los-maschineros-reggae.jpg",
        url: "https://soundcloud.com/los-maschineros/sets/los-maschineros-it-s-a-reggae",
        tracks: [
          { title: "It’s a Reggae Music", duration: 193 },
          { title: "Children’s of God", duration: 140 },
          { title: "The Best", duration: 147 },
          { title: "Excalibur Maschine of Fire", duration: 278 },
          { title: "Believe in Our Mess", duration: 154 },
          { title: "Son of the Morning" },
          { title: "Spirit of Inspiration" },
          { title: "Magnifical Insanity" },
          { title: "Sympathy" },
          { title: "Death Before Dishonor" },
          { title: "My Music Is My God" },
        ],
      },
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
