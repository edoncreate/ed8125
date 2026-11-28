import { expect, test, type Page, type Route } from "@playwright/test";

/**
 * The e2e build points at a fake Supabase project (https://test.supabase.co, see
 * playwright.config.ts); these tests answer its requests themselves.
 */
const SB = "https://test.supabase.co";

type Row = { id: string; name: string; tracks: string[]; updated_at: string };

async function fakeSupabase(page: Page, rows: Row[]) {
  const db = { rows: structuredClone(rows), patches: [] as unknown[] };
  await page.route(`${SB}/**`, async (route: Route) => {
    const req = route.request();
    const url = new URL(req.url());
    const json = (body: unknown, status = 200) =>
      route.fulfill({ status, contentType: "application/json", headers: { "access-control-allow-origin": "*" }, body: JSON.stringify(body) });
    if (req.method() === "OPTIONS") {
      return route.fulfill({
        status: 204,
        headers: { "access-control-allow-origin": "*", "access-control-allow-headers": "*", "access-control-allow-methods": "*" },
      });
    }
    if (url.pathname === "/auth/v1/otp") return json({});
    if (url.pathname === "/auth/v1/user") return json(user);
    if (url.pathname === "/rest/v1/playlists" && req.method() === "GET") return json(db.rows);
    if (url.pathname === "/rest/v1/playlists" && req.method() === "PATCH") {
      const id = url.searchParams.get("id")?.replace("eq.", "");
      const patch = req.postDataJSON();
      db.patches.push(patch);
      db.rows = db.rows.map((r) => (r.id === id ? { ...r, ...patch } : r));
      return route.fulfill({ status: 204, headers: { "access-control-allow-origin": "*" } });
    }
    return json({ message: `unexpected ${req.method()} ${url.pathname}` }, 500);
  });
  return db;
}

const user = { id: "00000000-0000-0000-0000-000000000001", aud: "authenticated", role: "authenticated", email: "listener@example.com" };

async function signedIn(page: Page) {
  await page.addInitScript((u) => {
    const now = Math.floor(Date.now() / 1000);
    localStorage.setItem(
      "ed8125-auth",
      JSON.stringify({ access_token: "t", refresh_token: "r", token_type: "bearer", expires_in: 3600, expires_at: now + 3600, user: u }),
    );
  }, user);
}

test("Radio has its own page with the latest 20 beats", async ({ page }) => {
  await page.goto("/radio");
  await expect(page.locator('a[href*="/radio"][aria-current="page"]')).toHaveCount(1); // section nav (hidden on phones)
  await expect(page.getByRole("region", { name: "Radio" }).locator("ol > li")).toHaveCount(20);
  await page.getByRole("button", { name: "Play radio" }).click();
  await expect(page.getByRole("complementary", { name: "Player" })).toBeVisible();
});

test("signed out: sign-in sends a link", async ({ page }) => {
  await fakeSupabase(page, []);
  await page.goto("/playlists");
  await expect(page.getByRole("link", { name: "Playlists" })).toHaveAttribute("aria-current", "page");
  await page.getByLabel(/Sign in with your email/).fill("listener@example.com");
  await page.getByRole("button", { name: "Send link" }).click();
  await expect(page.getByRole("status")).toContainText("Check your inbox");
});

test("signed in: add a Lost Tape from the discography, then play the playlist", async ({ page }) => {
  const db = await fakeSupabase(page, [{ id: "p1", name: "Late night", tracks: [], updated_at: "2026-11-27" }]);
  await signedIn(page);
  await page.goto("/playlists");
  await expect(page.getByText("Signed in as")).toContainText("listener@example.com");
  await expect(page.getByRole("article", { name: "Late night" })).toContainText("0 tracks");

  await expect(page.locator("section[aria-labelledby=disco]").getByRole("status")).toHaveText(/^\d+ tracks$/);
  const filtersBtn = page.getByRole("button", { name: /^Filters/ });
  if (await filtersBtn.isVisible()) await filtersBtn.click();
  await page.locator('[aria-label="Filters"]:visible').getByLabel("Search the discography").fill("Da nostalgia");
  const done = page.getByRole("button", { name: /^Show \d+ tracks?/ });
  if (await done.isVisible()) await done.click();
  await page.getByRole("button", { name: "Add Da nostalgia to Late night" }).click();
  await expect(page.getByRole("article", { name: "Late night" })).toContainText("1 tracks");
  expect(db.patches).toEqual([{ tracks: ["lt:vol-2/da-nostalgia"] }]);

  await page.getByRole("article", { name: "Late night" }).getByRole("button", { name: "▶ Play" }).click();
  await expect(page.getByRole("complementary", { name: "Player" })).toContainText("Da nostalgia");
});

test("signed in: the + in the player adds the current track", async ({ page }) => {
  const db = await fakeSupabase(page, [{ id: "p1", name: "Late night", tracks: [], updated_at: "2026-11-27" }]);
  await signedIn(page);
  await page.goto("/lost-tapes/vol-2");
  await page.getByRole("button", { name: /^Play Da nostalgia/ }).click();
  const dock = page.getByRole("complementary", { name: "Player" });
  await dock.getByRole("button", { name: "Add Da nostalgia to a playlist" }).click();
  await dock.getByRole("dialog", { name: "Add to playlist" }).getByRole("button", { name: /Late night/ }).click();
  await expect(dock.getByRole("status")).toHaveText("Added to Late night.");
  expect(db.patches).toEqual([{ tracks: ["lt:vol-2/da-nostalgia"] }]);
});

test("signed in: filter the discography to Los Maschineros and add them all", async ({ page }) => {
  const db = await fakeSupabase(page, [{ id: "p1", name: "Late night", tracks: [], updated_at: "2026-11-28" }]);
  await signedIn(page);
  await page.goto("/playlists");
  const disco = page.locator("section[aria-labelledby=disco]");
  // Desktop: sidebar. Phone: a full-screen dialog opened from the "Filters" button.
  const filters = page.locator('[aria-label="Filters"]:visible');
  const openFilters = async () => {
    const btn = disco.getByRole("button", { name: /^Filters/ });
    if (await btn.isVisible()) await btn.click(); // phones: the sidebar is a sheet
  };
  const closeFilters = async () => {
    const done = filters.getByRole("button", { name: /^Show \d+ tracks?/ });
    if (await done.isVisible()) await done.click();
  };

  await expect(disco.getByRole("status")).toHaveText(/^\d+ tracks$/); // signed in + catalog loaded
  await openFilters();
  await filters.getByLabel("Los Maschineros").check();
  await filters.getByLabel("Over 4 min").check();
  await closeFilters();
  await expect(disco.getByRole("status")).toHaveText("1 track"); // Excalibur Maschine of Fire, 4:38
  await disco.getByRole("button", { name: "Remove filter Over 4 min" }).click();
  await expect(disco.getByRole("status")).toHaveText("24 tracks");

  await disco.getByRole("button", { name: "+ Add all 24 to Late night" }).click();
  await expect(page.getByRole("article", { name: "Late night" })).toContainText("24 tracks");
  expect((db.patches[0] as { tracks: string[] }).tracks).toHaveLength(24);

  await openFilters();
  await filters.getByRole("button", { name: "Clear all" }).click();
  await closeFilters();
  await expect(disco.getByRole("status")).toHaveText(/^2\d\d tracks$/);
});
