import { expect, test } from '@playwright/test'
import { openReference } from './fidelity'

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

// The reference server fronts a compromised WordPress copy: it may only serve
// static assets from wp-content/ and wp-includes/, never PHP source or listings.
test('reference server refuses traversal, PHP source and directory listings', async ({ request }) => {
  const status = async (path: string) => (await request.get('http://localhost:8125' + path)).status()
  expect(await status('/wp-content/%2e%2e/wp-config.ph%70')).toBeGreaterThanOrEqual(400)
  expect(await status('/wp-content/%2e%2e/wp-config.php')).toBeGreaterThanOrEqual(400)
  expect(await status('/wp-includes/%2e%2e/%2e%2e/etc/passwd')).toBeGreaterThanOrEqual(400)
  expect(await status('/wp-content/index.ph%70')).toBeGreaterThanOrEqual(400)
  expect(await status('/wp-content/index.PHP')).toBeGreaterThanOrEqual(400)
  expect(await status('/wp-content/plugins/')).toBeGreaterThanOrEqual(400)
  expect(await status('/wp-content/plugins/audioigniter/readme.txt')).toBeGreaterThanOrEqual(400)
  // Assets the archived pages need still work.
  expect(await status('/wp-content/uploads/2021/02/hero-v3-2.png')).toBe(200)
  expect(await status('/wp-content/plugins/elementor/assets/css/frontend.min.css?ver=3.1.1')).toBe(200)
  expect(await status('/')).toBe(200)
})

// JavaScript from the compromised copy runs only if it matches pristine
// wordpress.org sources (reference/js-allowlist.json).
test('reference server serves only verified JavaScript', async ({ request }) => {
  const status = async (path: string) => (await request.get('http://localhost:8125' + path)).status()
  expect(await status('/wp-content/uploads/wpmss/wpmss.min.js?ver=1615086124')).toBe(403)
  expect(await status('/wp-content/plugins/wonderplugin-slider-lite/engine/wonderpluginslider.js?ver=12.8')).toBe(403)
  expect(await status('/wp-content/plugins/mousewheel-smooth-scroll/js/SmoothScroll.min.js?ver=1.4.10')).toBe(403)
  expect(await status('/wp-includes/js/jquery/jquery.js?ver=1.12.4-wp')).toBe(200)
  expect(await status('/wp-content/plugins/elementor/assets/js/frontend.min.js?ver=3.1.1')).toBe(200)
})

test('reference pages open isolated, with third-party scripts blocked', async ({ browser }) => {
  const { context, page } = await openReference(browser, '/')
  const external: string[] = []
  page.on('response', (r) => {
    const host = new URL(r.url()).hostname
    if (!['localhost', 'fonts.googleapis.com', 'fonts.gstatic.com'].includes(host)) external.push(host)
  })
  await page.reload({ waitUntil: 'networkidle' })
  expect(external).toEqual([])
  await context.close()
})
