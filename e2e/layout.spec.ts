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
