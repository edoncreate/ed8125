import { expect, test } from '@playwright/test'
import { APP } from './fidelity'

test.use({ contextOptions: { reducedMotion: 'reduce' } })

test('deep link /#bio scrolls to the bio section after render', async ({ page }) => {
  await page.goto(APP + '/#bio')
  const bio = page.locator('#bio')
  await expect(bio).toBeInViewport()
  const top = await bio.evaluate((el) => el.getBoundingClientRect().top)
  expect(Math.abs(top)).toBeLessThan(5)
})

test('nav click scrolls to the section and highlights it', async ({ page }, info) => {
  test.skip(info.project.name !== 'desktop', 'desktop nav layout')
  await page.goto(APP + '/')
  await page.getByRole('navigation', { name: 'Main' }).getByRole('link', { name: 'Releases' }).click()
  await expect(page.locator('#releases')).toBeInViewport()
  await expect(page.locator('[data-ref="nav-releases"]')).toHaveClass(/is-active/)
  await expect(page.locator('[data-ref="header"]')).toHaveClass(/is-scrolled/)
})

test('release page back link returns home at the top', async ({ page }) => {
  await page.goto(APP + '/brasil-com-amor/')
  await page.getByRole('link', { name: 'Back' }).click()
  await expect(page).toHaveURL(APP + '/')
  expect(await page.evaluate(() => window.scrollY)).toBe(0)
})
