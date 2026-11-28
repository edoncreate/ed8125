import { expect, test } from "@playwright/test";

test("a track has its own page with a preview card, and plays on through its volume", async ({ page }) => {
  await page.goto("/track/lt-vol-2-da-nostalgia/");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Da nostalgia");
  await expect(page.locator('meta[property="og:title"]')).toHaveAttribute("content", "Da nostalgia · ED8125");
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute("content", /opengraph-image\.png/);
  await page.getByRole("button", { name: "Play", exact: true }).click();
  await expect(page.getByRole("complementary", { name: "Player" })).toContainText("Da nostalgia");
});

test("Share opens the share sheet on phones and copies the link on desktop", async ({ page, context, isMobile }) => {
  await page.addInitScript(() => {
    const w = window as unknown as { shared: unknown[]; copied: string[] };
    w.shared = [];
    w.copied = [];
    Object.defineProperty(navigator, "share", { value: async (d: unknown) => void w.shared.push(d), configurable: true });
    Object.defineProperty(navigator, "clipboard", { value: { writeText: async (t: string) => void w.copied.push(t) }, configurable: true });
  });
  await context.grantPermissions(["clipboard-write"]).catch(() => {});
  await page.goto("/projects/brasil-com-amor/");
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute("content", /brasil-front\.png$/);
  await page.getByRole("button", { name: "Share Brasil com amor" }).click();

  const url = /\/projects\/brasil-com-amor\/$/;
  if (isMobile) {
    const shared = await page.evaluate(() => (window as unknown as { shared: { url: string; title: string }[] }).shared);
    expect(shared).toHaveLength(1);
    expect(shared[0].url).toMatch(url);
    expect(shared[0].title).toBe("Brasil com amor · ED8125");
  } else {
    await expect(page.getByRole("button", { name: "Share Brasil com amor" })).toContainText("Link copied");
    const copied = await page.evaluate(() => (window as unknown as { copied: string[] }).copied);
    expect(copied).toEqual([expect.stringMatching(url)]);
  }
});

test("the player shares the track that is playing", async ({ page }) => {
  await page.addInitScript(() => {
    const w = window as unknown as { links: string[] };
    w.links = [];
    const keep = async (d: { url?: string } | string) => void w.links.push(typeof d === "string" ? d : (d.url ?? ""));
    Object.defineProperty(navigator, "share", { value: keep, configurable: true });
    Object.defineProperty(navigator, "clipboard", { value: { writeText: keep }, configurable: true });
  });
  await page.goto("/lost-tapes/vol-2/");
  await page.getByRole("button", { name: /^Play Da nostalgia/ }).click();
  await page.getByRole("complementary", { name: "Player" }).getByRole("button", { name: "Share Da nostalgia" }).click();
  await expect.poll(() => page.evaluate(() => (window as unknown as { links: string[] }).links)).toEqual([
    expect.stringMatching(/\/track\/lt-vol-2-da-nostalgia\/$/),
  ]);
});
