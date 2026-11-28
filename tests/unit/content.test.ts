import { existsSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { site } from "@content/site";
import { asset } from "@/lib/asset";
import { formatDuration, getCollabs, getProject, getVolume, getVolumes, lostTapeToPlayable, projectVideos, releaseTrackToPlayable, totalLostTapes } from "@/lib/content";

describe("Lost Tapes", () => {
  it("has the four volumes in order with their spans", () => {
    expect(getVolumes().map((v) => `${v.label} ${v.span}`)).toEqual([
      "Vol. 1 2005–2009",
      "Vol. 2 2010–2014",
      "Vol. 3 2015–2019",
      "2020 2020–2021",
    ]);
    expect(totalLostTapes()).toBe(135); // 139 files, 4 repeats hidden in lost-tapes-overrides.json
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
      title: "MAD",
      src: asset("/media/lost-tapes/2020/mad.mp3"),
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

  it("one week one beat takes the channel's videos (or an explicit id list)", () => {
    const owob = getProject("one-week-one-beat");
    if (owob?.kind !== "videos") throw new Error("expected a video project");
    const vids = [
      { id: "a", title: "A", published: "2025-01-02", thumbnail: "", url: "" },
      { id: "b", title: "B", published: "2025-01-01", thumbnail: "", url: "" },
    ];
    expect(projectVideos(owob, vids)).toEqual(vids);
    expect(projectVideos({ ...owob, videos: ["b"] }, vids).map((v) => v.id)).toEqual(["b"]);
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

describe("collab releases", () => {
  it("Los Maschineros has both volumes with full tracklists", () => {
    const lm = getCollabs().find((c) => c.slug === "los-maschineros")!;
    expect(lm.releases?.map((r) => [r.label, r.title, r.tracks.length])).toEqual([
      ["Vol. 1", "Classic", 13],
      ["Vol. 2", "It’s a Reggae Music", 11],
    ]);
  });

  it("credits a producer on every Los Maschineros track", () => {
    const lm = getCollabs().find((c) => c.slug === "los-maschineros")!;
    const [v1, v2] = lm.releases!.map((r) => r.tracks.map((t) => t.producer));
    expect(v1).toEqual(["JV", "ED8125", "JV", "ED8125", "JV", "ED8125", "JV", "ED8125", "JV", "ED8125", "JV", "ED8125", "JV"]);
    expect(v2).toEqual(["LogicLM", "ED8125", "ED8125", "JV", "LogicLM", "JV", "ED8125", "LogicLM", "JV", "LogicLM", "ED8125"]);
  });

  it("a release track is playable only once it has a file", () => {
    const lm = getCollabs().find((c) => c.slug === "los-maschineros")!;
    const rel = lm.releases![0];
    expect(releaseTrackToPlayable(lm, rel, { title: "Clássico", duration: 124 }, 0)).toBeNull();
    expect(releaseTrackToPlayable(lm, rel, { title: "Clássico", duration: 124, file: "vol-1/01-classico.mp3" }, 0)).toMatchObject({
      subtitle: "Los Maschineros · Vol. 1 Classic · 2012",
    });
    expect(
      releaseTrackToPlayable(lm, rel, { title: "Clássico", duration: 124, producer: "JV", file: "vol-1/01-classico.mp3" }, 0),
    ).toEqual({
      key: "collab:los-maschineros/vol-1/01",
      title: "Clássico",
      subtitle: "Los Maschineros · Vol. 1 Classic · prod. JV",
      src: asset("/media/audio/los-maschineros/vol-1/01-classico.mp3"),
      duration: 124,
      href: "/collabs#los-maschineros",
    });
  });
});

describe("Lost Tapes subtitle", () => {
  it("has no trailing separator when a track has no year", () => {
    const v = getVolume("vol-2")!;
    const t = v.tracks.find((x) => x.slug === "jeze")!;
    expect(lostTapeToPlayable(v, t).subtitle).toBe("Lost Tapes Vol. 2");
  });
});
