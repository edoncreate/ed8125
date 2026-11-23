import { afterEach, describe, expect, it, vi } from "vitest";

afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
});

describe("asset()", () => {
  it("prefixes site-relative paths with the base path (GitHub Pages project site)", async () => {
    vi.stubEnv("NEXT_PUBLIC_BASE_PATH", "/ed8125");
    const { asset } = await import("@/lib/asset");
    expect(asset("/media/img/head.png")).toBe("/ed8125/media/img/head.png");
    expect(asset("https://i.ytimg.com/vi/x/hqdefault.jpg")).toBe("https://i.ytimg.com/vi/x/hqdefault.jpg");
  });

  it("is a no-op without a base path (custom domain)", async () => {
    vi.stubEnv("NEXT_PUBLIC_BASE_PATH", "");
    const { asset } = await import("@/lib/asset");
    expect(asset("/media/img/head.png")).toBe("/media/img/head.png");
  });

  it("Lost Tapes audio follows the base path unless an audio host is set", async () => {
    vi.stubEnv("NEXT_PUBLIC_BASE_PATH", "/ed8125");
    const { lostTapeToPlayable, getVolume } = await import("@/lib/content");
    const v = getVolume("2020")!;
    expect(lostTapeToPlayable(v, v.tracks.find((t) => t.slug === "mad")!).src).toBe("/ed8125/media/lost-tapes/2020/mad.mp3");
  });
});
