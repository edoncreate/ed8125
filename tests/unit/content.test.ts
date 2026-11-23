import { existsSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { site } from "@content/site";
import { formatDuration, getCollabs, getProject, getVolume, getVolumes, lostTapeToPlayable, totalLostTapes } from "@/lib/content";

describe("Lost Tapes", () => {
  it("has the four volumes in order with their spans", () => {
    expect(getVolumes().map((v) => `${v.label} ${v.span}`)).toEqual([
      "Vol. 1 2005–2009",
      "Vol. 2 2010–2014",
      "Vol. 3 2015–2019",
      "2020 2020–2021",
    ]);
    expect(totalLostTapes()).toBe(139);
  });

  it("every track has a title, a duration and a slug unique within its volume", () => {
    for (const v of getVolumes()) {
      const slugs = v.tracks.map((t) => t.slug);
      expect(new Set(slugs).size, v.id).toBe(slugs.length);
      for (const t of v.tracks) {
        expect(t.title.length, t.source).toBeGreaterThan(0);
        expect(t.duration, t.source).toBeGreaterThan(0);
      }
    }
  });

  it("maps tracks to playable audio under the Lost Tapes base", () => {
    const v = getVolume("2020")!;
    const mad = v.tracks.find((t) => t.slug === "mad")!;
    expect(lostTapeToPlayable(v, mad)).toMatchObject({
      key: "lt:2020/mad",
      title: "Mad",
      src: "/media/lost-tapes/2020/mad.mp3",
      href: "/lost-tapes/2020",
    });
  });

  it("the sound loop points at a real track", () => {
    const v = getVolume(site.soundLoop.volume);
    expect(v?.tracks.some((t) => t.slug === site.soundLoop.slug)).toBe(true);
  });
});

describe("projects and collabs", () => {
  it("album tracks exist on disk", () => {
    const album = getProject("brasil-com-amor");
    expect(album?.kind).toBe("album");
    if (album?.kind !== "album") return;
    expect(album.tracks).toHaveLength(11);
    for (const t of album.tracks) expect(existsSync(`public${t.src}`), t.src).toBe(true);
    expect(existsSync(`public${album.cover}`)).toBe(true);
  });

  it("one week one beat lists 15 videos", () => {
    const owob = getProject("one-week-one-beat");
    expect(owob?.kind === "videos" && owob.videoIds.length).toBe(15);
  });

  it("collabs pick up their archive tracks", () => {
    const [maschineros, mcs] = getCollabs();
    expect(maschineros.tracks.length).toBe(14);
    expect(maschineros.tracks.every((t) => /^los maschineros/i.test(t.track.title))).toBe(true);
    expect(mcs.tracks.length).toBeGreaterThan(0);
  });
});

describe("formatDuration", () => {
  it.each([
    [214, "3:34"],
    [60, "1:00"],
    [0, "–:––"],
    [undefined, "–:––"],
  ])("%s → %s", (s, out) => expect(formatDuration(s)).toBe(out));
});
