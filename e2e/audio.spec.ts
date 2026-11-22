import { expect, test, type Page } from '@playwright/test'
import { APP } from './fidelity'

function collectErrors(page: Page) {
  const errors: string[] = []
  page.on('pageerror', (e) => errors.push(e.message))
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push(m.text())
  })
  return errors
}

const audioTime = (page: Page) => page.evaluate(() => document.querySelector('audio')!.currentTime)

test('album plays', async ({ page }) => {
  const errors = collectErrors(page)
  await page.goto(APP + '/brasil-com-amor/')
  await page.getByRole('button', { name: 'Play' }).click()
  await expect.poll(() => audioTime(page), { timeout: 8000 }).toBeGreaterThan(0)
  await expect(page.getByRole('button', { name: 'Pause' })).toBeVisible()
  expect(errors).toEqual([])
})

test('rapid track switching is clean', async ({ page }) => {
  const errors = collectErrors(page)
  await page.goto(APP + '/latest-beats/')
  const rows = page.getByRole('list', { name: 'Tracklist' }).getByRole('button')
  await rows.nth(0).click()
  await rows.nth(1).click()
  await rows.nth(2).click()
  await expect(rows.nth(2)).toHaveAttribute('aria-current', 'true')
  await expect.poll(() => audioTime(page), { timeout: 8000 }).toBeGreaterThan(0)
  expect(await page.evaluate(() => document.querySelector('audio')!.src)).toContain('/media/audio/beats/sean-price-ft-tek-remix.mp3')
  expect(errors).toEqual([])
})

test('a missing mp3 shows an error instead of stalling', async ({ page }) => {
  await page.route('**/media/audio/beats/mad.mp3', (route) => route.fulfill({ status: 404, body: '' }))
  await page.goto(APP + '/latest-beats/')
  await page.getByRole('button', { name: 'Play' }).click()
  await expect(page.getByRole('status')).toHaveText('This track could not be played.')
  await expect(page.getByRole('button', { name: 'Play' })).toBeVisible()
})

for (const path of ['/latest-beats', '/latest-beats/', '/brasil-com-amor']) {
  test(`direct load works: ${path}`, async ({ page }) => {
    await page.goto(APP + path)
    await expect(page.getByRole('heading', { name: 'LATESTE BEATS' })).toBeVisible()
  })
}
