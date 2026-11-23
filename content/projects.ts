/** Projects: finished bodies of work. Audio projects carry their tracks; video projects list YouTube ids. */

export type AlbumTrack = { n: number; title: string; src: string; duration: number };

export type AudioProject = {
  kind: "album";
  slug: string;
  title: string;
  year: number;
  summary: string;
  cover: string;
  backCover?: string;
  tracks: AlbumTrack[];
};

export type VideoProject = {
  kind: "videos";
  slug: string;
  title: string;
  year: number;
  summary: string;
  /**
   * Which channel videos belong here. "channel" = every upload (One week one beat is
   * the channel's weekly series; thumbnails are numbered up to #39). Switch to explicit
   * ids if other kinds of videos get posted.
   */
  videos: "channel" | string[];
};

export type Project = AudioProject | VideoProject;

const track = (n: number, slug: string, title: string, duration: number): AlbumTrack => ({
  n,
  title,
  src: `/media/audio/brasil-com-amor/${String(n).padStart(2, "0")}-${slug}.mp3`,
  duration,
});

export const projects: Project[] = [
  {
    kind: "videos",
    slug: "one-week-one-beat",
    title: "One week one beat",
    year: 2025,
    summary: "A new beat every week, filmed in the studio and posted as a one-minute video.",
    videos: "channel",
  },
  {
    kind: "album",
    slug: "brasil-com-amor",
    title: "Brasil com amor",
    year: 2020,
    summary:
      "A love story between two people, from the moment they meet to the day they drift apart, told in eleven Brazilian-flavoured beats.",
    cover: "/media/img/brasil-front.png",
    backCover: "/media/img/brasil-back.png",
    tracks: [
      track(1, "bloco", "Bloco", 77),
      track(2, "carnaval", "Carnaval", 220),
      track(3, "amor-a-primeira-vista", "Amor à primeira vista", 234),
      track(4, "me-beija", "Me beija", 106),
      track(5, "nosso-samba", "Nosso samba", 162),
      track(6, "sera-voce", "Será você", 196),
      track(7, "discussao", "Discussão", 237),
      track(8, "partiu", "Partiu", 189),
      track(9, "vou-por-ai", "Vou por aí", 260),
      track(10, "livre", "Livre", 199),
      track(11, "vem", "Vem", 193),
    ],
  },
];
