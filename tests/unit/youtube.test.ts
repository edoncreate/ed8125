import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { cleanTitle, parseYouTubeFeed, uploadsPlaylistId } from "@/lib/youtube";

const xml = readFileSync("tests/fixtures/youtube-feed.xml", "utf8");

describe("parseYouTubeFeed", () => {
  const videos = parseYouTubeFeed(xml);

  it("reads every entry, newest first", () => {
    expect(videos).toHaveLength(15);
    expect(videos[0]).toEqual({
      id: "BaEaVqnvyX4",
      title: "Sigo em frente",
      published: "2025-07-25",
      thumbnail: "https://i.ytimg.com/vi/BaEaVqnvyX4/hqdefault.jpg",
      url: "https://www.youtube.com/watch?v=BaEaVqnvyX4",
    });
    const dates = videos.map((v) => v.published);
    expect([...dates].sort().reverse()).toEqual(dates);
  });

  it("decodes entities and drops the artist prefix", () => {
    expect(videos.map((v) => v.title)).toContain("Se acabo la diversion");
    expect(videos.every((v) => !v.title.startsWith("ED8125"))).toBe(true);
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
