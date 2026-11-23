/** Site-wide copy and facts for ed8125.com. English only. */
export const site = {
  name: "ED8125",
  url: "https://ed8125.com",
  roles: ["Beatmaker", "Bass", "Producer"],
  since: 2003,
  headline: ["Let's cook", "some", "music."] as const,
  positioning: "Beats since 2003, made in Lisbon. A new one most weeks, the archive back to the first tapes.",
  location: { city: "Lisbon", tz: "Europe/Lisbon", coords: "38°43′N 9°08′W" },
  socials: {
    youtube: "https://www.youtube.com/@ED8125",
    instagram: "https://www.instagram.com/ed8125/",
  },
  studio: { name: "EDONCREATE", url: "https://edoncreate.com/" },
  /** About chapter. Edited from the old site's bio (typos fixed). */
  bio: [
    "Producing instrumental beats since 2003, ED8125 soon realised that music was the way he could best express himself.",
    "First a hobby, maybe a shelter. Whatever it was, music was always part of his life.",
    "Over the years he has focused on telling stories, with a message in his melodies. Beatmaker, bass player and producer, based in Lisbon.",
  ],
  /** Track that "Enter with sound" plays (a Lost Tapes file). */
  soundLoop: { volume: "2020", slug: "mad" },
} as const;
