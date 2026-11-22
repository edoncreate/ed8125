import { expect, test } from '@playwright/test'
import { APP } from './fidelity'

test.use({ contextOptions: { reducedMotion: 'reduce' } })

// Below 910px the home nav is a fixed bottom tab bar; the footer must stay reachable above it.
for (const width of [375, 600, 820]) {
  test(`footer link is not covered by the bottom tab bar at ${width}px`, async ({ page }, info) => {
    test.skip(info.project.name !== 'desktop', 'sets its own viewport')
    await page.setViewportSize({ width, height: 812 })
    await page.goto(APP + '/')
    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight))
    const link = page.getByRole('contentinfo').getByRole('link', { name: 'EDONCREATE' })
    await expect(link).toBeVisible()
    const box = (await link.boundingBox())!
    const topmostIsLink = await page.evaluate(
      ({ x, y }) => document.elementFromPoint(x, y)?.closest('a')?.textContent === 'EDONCREATE',
      { x: box.x + box.width / 2, y: box.y + box.height / 2 },
    )
    expect(topmostIsLink).toBe(true)
  })
}

test('beats carousel survives keyboard tabbing and has focusable dots', async ({ page }, info) => {
  test.skip(info.project.name !== 'desktop', 'desktop layout')
  await page.goto(APP + '/')
  const carousel = page.locator('[data-ref="beats-carousel"]')
  await carousel.scrollIntoViewIfNeeded()
  await carousel.getByRole('link').first().focus()
  for (let i = 0; i < 6; i++) await page.keyboard.press('Tab')
  // Swiper must move the slides itself; the browser must not scroll the container natively.
  expect(await carousel.evaluate((el) => el.scrollLeft)).toBe(0)
  await expect(carousel.locator('.swiper-pagination')).toBeInViewport()
  const dots = carousel.locator('.swiper-pagination-bullet')
  await expect(dots).toHaveCount(10)
  for (const dot of await dots.all()) await expect(dot).toHaveAttribute('tabindex', '0')
})
