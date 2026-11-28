import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { cleanTitle, mergeVideos, parseYouTubeFeed, uploadsPlaylistId, type Video } from "@/lib/youtube";

const xml = readFileSync("tests/fixtures/youtube-feed.xml", "utf8");

describe("parseYouTubeFeed", () => {
  const videos = parseYouTubeFeed(xml);

  it("reads every entry, newest first", () => {
    expect(videos).toHaveLength(15);
    expect(videos[0]).toEqual({
      id: "BaEaVqnvyX4",
      title: "Sigo em frente",
      published: "2025-07-25",
      thumbnail: "https://i.ytimg.com/vi/BaEaVqnvyX4/maxresdefault.jpg",
      url: "https://www.youtube.com/watch?v=BaEaVqnvyX4",
      views: 8,
    });
    const dates = videos.map((v) => v.published);
    expect([...dates].sort().reverse()).toEqual(dates);
  });

  it("decodes entities and drops the artist prefix", () => {
    expect(videos.map((v) => v.title)).toContain("Se acabo la diversion");
    expect(videos.every((v) => !v.title.startsWith("ED8125"))).toBe(true);
  });

  it("reads every view count", () => {
    expect(videos.every((v) => Number.isInteger(v.views))).toBe(true);
  });

  it("returns [] for malformed input", () => {
    expect(parseYouTubeFeed("<html>nope</html>")).toEqual([]);
  });
});

describe("cleanTitle", () => {
  it.each([
    ["ED8125 - Sigo em frente", "Sigo em frente"],
    ["ED8125 – Caminho", "Caminho"],
    ["ED8125 | Vamos #shorts", "Vamos"],
    ["Plain title", "Plain title"],
  ])("%s → %s", (raw, clean) => expect(cleanTitle(raw)).toBe(clean));
});

describe("uploadsPlaylistId", () => {
  it("maps a UC channel id to its UU uploads playlist", () => {
    expect(uploadsPlaylistId("UCRrfnRVH5LuN6ORAuGNivDw")).toBe("UURrfnRVH5LuN6ORAuGNivDw");
  });
});

describe("mergeVideos", () => {
  const base: Video = { id: "a", title: "Old", published: "2025-01-01", thumbnail: "t", url: "u", views: 10 };

  it("lets the later list win but keeps a known view count", () => {
    const live: Video = { id: "a", title: "New", published: "2025-01-01", thumbnail: "t", url: "u" };
    expect(mergeVideos([base], [live])).toEqual([{ ...base, title: "New", views: 10 }]);
    expect(mergeVideos([base], [{ ...base, views: 12 }])[0].views).toBe(12);
  });

  it("sorts newest first", () => {
    const newer = { ...base, id: "b", published: "2025-02-01" };
    expect(mergeVideos([base], [newer]).map((v) => v.id)).toEqual(["b", "a"]);
  });
});
