import { describe, expect, it } from "vitest";
import { shareUrl, trackPath, trackSlug } from "@/lib/share";
import { getTrackPages } from "@/lib/tracks";
import type { Video } from "@/lib/youtube";

describe("trackSlug / trackPath", () => {
  it.each([
    ["lt:vol-2/da-nostalgia", "lt-vol-2-da-nostalgia"],
    ["album:brasil-com-amor/3", "album-brasil-com-amor-3"],
    ["collab:los-maschineros/vol-1/01", "collab-los-maschineros-vol-1-01"],
    ["beat:_CZF_9reLJI", "beat-_CZF_9reLJI"],
  ])("%s → %s", (key, slug) => {
    expect(trackSlug(key)).toBe(slug);
    expect(trackPath(key)).toBe(`/track/${slug}`);
  });
});

describe("shareUrl", () => {
  it("adds the trailing slash the static export serves, before any hash", () => {
    expect(shareUrl("/track/x", "https://ed8125.com")).toBe("https://ed8125.com/track/x/");
    expect(shareUrl("/collabs#los-maschineros-vol-1", "https://ed8125.com")).toBe("https://ed8125.com/collabs/#los-maschineros-vol-1");
    expect(shareUrl("/beats/", "https://ed8125.com")).toBe("https://ed8125.com/beats/");
  });
});

describe("getTrackPages", () => {
  const v = (id: string, published: string): Video => ({ id, title: id, published, thumbnail: `https://i.ytimg.com/vi/${id}/maxresdefault.jpg`, url: "" });
  const audio = {
    a: { file: "01-a.mp3", duration: 60, episode: 1 },
    b: { file: "02-b.mp3", duration: 60, episode: 2 },
  };
  const pages = getTrackPages([v("a", "2025-01-01"), v("b", "2025-02-01"), v("c", "2025-03-01")], audio);

  it("gives every playable track one page with a unique slug", () => {
    expect(new Set(pages.map((p) => p.slug)).size).toBe(pages.length);
    expect(pages.some((p) => p.slug === "beat-c")).toBe(false); // no audio, no page
  });

  it("plays on from the track through its release", () => {
    for (const p of pages) expect(p.queue[p.index].key).toBe(p.track.key);
    const b = pages.find((p) => p.slug === "beat-b");
    expect(b).toMatchObject({ index: 0, imageKind: "youtube", from: { href: "/beats" } }); // newest first
  });

  it("uses the release cover, and none for the Lost Tapes", () => {
    expect(pages.find((p) => p.slug.startsWith("album-brasil-com-amor-"))?.image).toBe("/media/img/brasil-front.png");
    expect(pages.find((p) => p.slug.startsWith("collab-"))?.image).toMatch(/los-maschineros/);
    const lt = pages.find((p) => p.slug === "lt-vol-2-da-nostalgia");
    expect(lt?.image).toBeUndefined();
    expect(lt?.from.href).toBe("/lost-tapes/vol-2");
  });
});
