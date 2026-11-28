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
          { title: "Clássico", duration: 125, file: "vol-1/01-classico.mp3" },
          { title: "Quebrar a regra", duration: 146, file: "vol-1/02-quebrar-a-regra.mp3" },
          { title: "Regra morta", duration: 199, file: "vol-1/03-regra-morta.mp3" },
          { title: "Julgamento errado", duration: 186, file: "vol-1/04-julgamento-errado.mp3" },
          { title: "O prazer de criar", duration: 153, file: "vol-1/05-o-prazer-de-criar.mp3" },
          { title: "Exceção é regra", duration: 171, file: "vol-1/06-excecao-e-regra.mp3" },
          { title: "Não digas que não presta", duration: 169, file: "vol-1/07-nao-digas-que-nao-presta.mp3" },
          { title: "Ruídos abjetos", duration: 182, file: "vol-1/08-ruidos-abjetos.mp3" },
          { title: "Noite transfigurada", duration: 158, file: "vol-1/09-noite-transfigurada.mp3" },
          { title: "Ideias intuitivas", duration: 166, file: "vol-1/10-ideias-intuitivas.mp3" },
          { title: "Era tudo bonito", duration: 160, file: "vol-1/11-era-tudo-bonito.mp3" },
          { title: "Sensibilidade musical", duration: 157, file: "vol-1/12-sensibilidade-musical.mp3" },
          { title: "Desobediência organizada", duration: 194, file: "vol-1/13-desobediencia-organizada.mp3" },
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
          { title: "It’s a Reggae Music", duration: 194, file: "vol-2/01-it-s-a-reggae-music.mp3" },
          { title: "Children’s of God", duration: 141, file: "vol-2/02-children-s-of-god.mp3" },
          { title: "The Best", duration: 147, file: "vol-2/03-the-best.mp3" },
          { title: "Excalibur Maschine of Fire", duration: 278, file: "vol-2/04-excalibur-maschine-of-fire.mp3" },
          { title: "Believe in Our Mess", duration: 155, file: "vol-2/05-believe-in-our-mess.mp3" },
          { title: "Son of the Morning", duration: 186, file: "vol-2/06-son-of-the-morning.mp3" },
          { title: "Spirit of Inspiration", duration: 177, file: "vol-2/07-spirit-of-inspiration.mp3" },
          { title: "Magnifical Insanity", duration: 150, file: "vol-2/08-magnifical-insanity.mp3" },
          { title: "Sympathy", duration: 182, file: "vol-2/09-sympathy.mp3" },
          { title: "Death Before Dishonor", duration: 148, file: "vol-2/10-death-before-dishonor.mp3" },
          { title: "My Music Is My God", duration: 221, file: "vol-2/11-my-music-is-my-god.mp3" },
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
