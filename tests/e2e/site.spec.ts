import { expect, test, type Page } from "@playwright/test";

const audioTime = (page: Page) =>
  page.evaluate(() => {
    const a = document.querySelector("audio");
    return a ? a.currentTime : -1;
  });

function collectErrors(page: Page) {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  return errors;
}

test("home: hero, six chapters and the data row", async ({ page }) => {
  const errors = collectErrors(page);
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(/Let’s cook\s+some\s+music\./);
  for (const id of ["intro", "now", "projects", "lost-tapes", "collabs", "about"]) {
    await expect(page.locator(`section#${id}`)).toHaveCount(1);
  }
  await expect(page.getByText(/Lost Tapes · 135 beats/)).toBeVisible();
  expect(errors).toEqual([]);
});

test("a Lost Tapes track plays, and keeps playing across pages", async ({ page }) => {
  const errors = collectErrors(page);
  await page.goto("/lost-tapes/vol-2");
  await page.getByRole("button", { name: /^Play Da nostalgia/ }).click();
  const dock = page.getByRole("complementary", { name: "Player" });
  await expect(dock).toContainText("Da nostalgia");
  await expect.poll(() => audioTime(page), { timeout: 10_000 }).toBeGreaterThan(0.3);

  // Client-side navigation: the player lives in the root layout.
  const menu = page.getByRole("button", { name: "Menu" });
  if (await menu.isVisible()) {
    await menu.click();
    await page.locator("#site-menu").getByRole("link", { name: "Collabs" }).click();
  } else {
    await page.getByRole("navigation", { name: "Sections" }).getByRole("link", { name: "Collabs" }).click();
  }
  await expect(page).toHaveURL(/\/collabs\/?$/);
  await expect(dock).toContainText("Da nostalgia");
  const t1 = await audioTime(page);
  await page.waitForTimeout(800);
  expect(await audioTime(page)).toBeGreaterThan(t1);
  expect(errors).toEqual([]);
});

test("album: play the album, then next track", async ({ page }) => {
  await page.goto("/projects/brasil-com-amor");
  await page.getByRole("button", { name: "▶ Play the album" }).click();
  const dock = page.getByRole("complementary", { name: "Player" });
  await expect(dock).toContainText("Bloco");
  await expect.poll(() => audioTime(page), { timeout: 10_000 }).toBeGreaterThan(0.3);
  await dock.getByRole("button", { name: "Next" }).click();
  await expect(dock).toContainText("Carnaval");
});

test("enter with sound toggles the featured track", async ({ page }) => {
  await page.goto("/");
  const toggle = page.getByRole("button", { name: /Enter with sound/ });
  await toggle.click();
  await expect(page.getByRole("button", { name: /Sound on/ })).toHaveAttribute("aria-pressed", "true");
  await expect.poll(() => audioTime(page), { timeout: 10_000 }).toBeGreaterThan(0.3);
  await expect(page.locator("html")).toHaveAttribute("data-playing", "true");
});

test("a beat plays as audio, and 'Watch video' opens it in the floating YouTube player", async ({ page }) => {
  await page.goto("/beats");
  await page.getByRole("button", { name: /^Play Sigo em frente/ }).click();
  const dock = page.getByRole("complementary", { name: "Player" });
  await expect(dock).toContainText("One week one beat #39");
  await expect.poll(() => audioTime(page), { timeout: 10_000 }).toBeGreaterThan(0.3);
  await dock.getByRole("button", { name: "Watch video" }).click();
  await expect(dock.locator("iframe[src*='youtube']")).toHaveCount(1, { timeout: 20_000 });
  await expect(page.locator("audio")).toHaveCount(0);
});

test("unknown pages 404", async ({ page }) => {
  const res = await page.goto("/lost-tapes/vol-9");
  expect(res?.status()).toBe(404);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("got lost");
});
