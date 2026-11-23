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
  /** YouTube video ids, in release order. Assumption: the 2025 weekly series. */
  videoIds: string[];
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
    summary: "A new beat every week, filmed in one take and posted the same day.",
    videoIds: [
      "IESck9e76TQ", // Get Ready
      "yATPvMkCcCg", // Wake up
      "mcLy4pItpu8", // Hope
      "F6xIW3lYJPE", // The Revolutionist
      "E990WP492eI", // O Povo Unido
      "OL-JE_MhpXw", // Inquietação
      "D20YzK4hc7g", // I am doin it
      "Lta6oFnOwbU", // Vivir
      "3BQUXs_yNnM", // Nostalgia
      "DLnMrPX1sSw", // Yo
      "adjIMd5Q0aM", // Mira
      "Zmz4qnoxaW8", // Se acabo la diversion
      "0Q-I8OiD2Ik", // Vamos
      "KuBPBjixAL0", // Caminho
      "BaEaVqnvyX4", // Sigo em frente
    ],
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
