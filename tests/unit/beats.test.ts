import { describe, expect, it } from "vitest";
import { asset } from "@/lib/asset";
import { beatSlug, beatToPlayable, toPlayerItem } from "@/lib/content";
import type { Video } from "@/lib/youtube";

const video = (title: string): Video => ({
  id: "abc123def45",
  title,
  published: "2025-07-25T10:00:00Z",
  thumbnail: "https://i.ytimg.com/vi/abc123def45/hqdefault.jpg",
  url: "https://www.youtube.com/watch?v=abc123def45",
});

describe("beatSlug", () => {
  it.each([
    ["Sigo em frente", "sigo-em-frente"],
    ["ED8125 - Vida f€dida #oneweekonebeat", "vida-f-dida"],
    ["Strap-Up beat 12", "strap-up"],
    ["Inquietação", "inquietacao"],
  ])("%s → %s", (title, slug) => expect(beatSlug(title)).toBe(slug));
});

describe("beatToPlayable", () => {
  const audio = { "sigo-em-frente": { file: "sigo-em-frente.mp3", duration: 61 } };

  it("is null while the beat has no audio file", () => {
    expect(beatToPlayable(video("Sigo em frente"), {})).toBeNull();
  });

  it("maps a beat with audio to an audio track", () => {
    expect(beatToPlayable(video("Sigo em frente"), audio)).toEqual({
      key: "beat:sigo-em-frente",
      title: "Sigo em frente",
      subtitle: "One week one beat · 2025",
      src: asset("/media/beats/sigo-em-frente.mp3"),
      duration: 61,
      href: "/beats",
    });
  });

  it("toPlayerItem prefers audio and falls back to the video", () => {
    expect(toPlayerItem(video("Sigo em frente"), audio).type).toBe("audio");
    expect(toPlayerItem(video("Caminho"), audio)).toEqual({ type: "video", video: video("Caminho") });
  });
});

describe("radio", () => {
  it("is the 20 newest beats, newest first, whatever order they come in", async () => {
    const { radio, RADIO_SIZE } = await import("@/lib/content");
    const vids = Array.from({ length: 25 }, (_, i) => ({
      ...video(`Beat ${i}`),
      id: `id${String(i).padStart(9, "0")}`,
      published: `2025-01-${String(i + 1).padStart(2, "0")}T00:00:00Z`,
    })).reverse().sort(() => 0.5 - Math.random());
    const q = radio(vids, {});
    expect(RADIO_SIZE).toBe(20);
    expect(q).toHaveLength(20);
    expect(q.map((it) => (it.type === "video" ? it.video.published.slice(8, 10) : ""))[0]).toBe("25");
    expect(q.map((it) => (it.type === "video" ? it.video.published.slice(8, 10) : ""))[19]).toBe("06");
  });
});
