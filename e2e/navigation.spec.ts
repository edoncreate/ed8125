import { expect, test } from '@playwright/test'
import { APP } from './fidelity'

test.use({ contextOptions: { reducedMotion: 'reduce' } })

test('deep link /#bio scrolls to the bio section after render', async ({ page }) => {
  await page.goto(APP + '/#bio')
  const bio = page.locator('#bio')
  await expect(bio).toBeInViewport()
  // Bio is near the end of the page, so "scrolled to it" means as far as the page allows.
  await expect
    .poll(() =>
      bio.evaluate((el) => {
        const target = Math.min(el.getBoundingClientRect().top + window.scrollY, document.documentElement.scrollHeight - window.innerHeight)
        return Math.abs(window.scrollY - target)
      }),
    )
    .toBeLessThan(5)
  expect(await page.evaluate(() => window.scrollY)).toBeGreaterThan(1000)
})

test('nav click scrolls to the section and highlights it', async ({ page }, info) => {
  test.skip(info.project.name !== 'desktop', 'desktop nav layout')
  await page.goto(APP + '/')
  await page.getByRole('navigation', { name: 'Main' }).getByRole('link', { name: 'Releases' }).click()
  await expect(page.locator('#releases')).toBeInViewport()
  await expect(page.locator('[data-ref="nav-releases"]')).toHaveClass(/is-active/)
  await expect(page.locator('[data-ref="header"]')).toHaveClass(/is-scrolled/)
  // Once scrolled, only the section in view is gold (HOME loses its pill and colour).
  await page.mouse.move(700, 600)
  await expect(page.locator('[data-ref="nav-releases"]')).toHaveCSS('color', 'rgb(216, 149, 0)')
  await expect(page.locator('[data-ref="nav-home"]')).toHaveCSS('color', 'rgb(255, 255, 255)')
  await expect(page.locator('[data-ref="nav-home"]')).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)')
})

test('at the top HOME is a gold pill on black', async ({ page }, info) => {
  test.skip(info.project.name !== 'desktop', 'desktop nav layout')
  await page.goto(APP + '/')
  await expect(page.locator('[data-ref="nav-home"]')).toHaveCSS('color', 'rgb(216, 149, 0)')
  await expect(page.locator('[data-ref="nav-home"]')).toHaveCSS('background-color', 'rgb(0, 0, 0)')
})

test('release page back link returns home at the top', async ({ page }) => {
  await page.goto(APP + '/brasil-com-amor/')
  await page.getByRole('link', { name: 'Back' }).click()
  await expect(page).toHaveURL(APP + '/')
  expect(await page.evaluate(() => window.scrollY)).toBe(0)
})
