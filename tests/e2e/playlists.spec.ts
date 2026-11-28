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

test("signed out: Radio plays and sign-in sends a link", async ({ page }) => {
  await fakeSupabase(page, []);
  await page.goto("/playlists");
  await expect(page.getByRole("heading", { name: "Radio" })).toBeVisible();
  await expect(page.locator("section[aria-labelledby=radio] ol > li")).toHaveCount(20);
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

  await page.getByLabel("Search the discography").fill("Da nostalgia");
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
  await disco.getByRole("button", { name: /^Los Maschineros/ }).click();
  await expect(disco.getByRole("status")).toContainText("24 tracks");
  await disco.getByLabel("Length").selectOption("long");
  await expect(disco.locator("ol > li")).toHaveCount(1); // Excalibur Maschine of Fire, 4:38
  await disco.getByRole("button", { name: "Clear filters" }).click();
  await disco.getByRole("button", { name: /^Los Maschineros/ }).click();
  await disco.getByRole("button", { name: "+ Add all 24 to Late night" }).click();
  await expect(page.getByRole("article", { name: "Late night" })).toContainText("24 tracks");
  expect((db.patches[0] as { tracks: string[] }).tracks).toHaveLength(24);
});
