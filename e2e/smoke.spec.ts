import { expect, test } from '@playwright/test'

test('app serves root', async ({ page }) => {
  await page.goto('http://localhost:5173/')
  await expect(page).toHaveTitle('ED8125 – BEATMAKER BASSPLAYER PRODUCER')
})

test('reference serves playlists', async ({ request }) => {
  const album = await request.get('http://localhost:8125/?audioigniter_playlist_id=483')
  expect(await album.json()).toHaveLength(11)
  const beats = await request.get('http://localhost:8125/?audioigniter_playlist_id=123')
  expect(await beats.json()).toHaveLength(10)
})
