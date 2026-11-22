import { expect, test, type Page } from '@playwright/test'

export const APP = 'http://localhost:5173'
export const REF = 'http://localhost:8125'

/** One element that must sit in the same place in the original site and in the app. */
export type Landmark = {
  name: string
  /** CSS selector in the original (Elementor) page. */
  ref: string
  /** CSS selector in the React app, usually `[data-ref="<name>"]`. */
  app: string
  /** Also compare font-size and colour (for text elements). */
  text?: boolean
}

type Measure = { x: number; y: number; w: number; h: number; fontSize: string; color: string } | null

const FREEZE = `*,*::before,*::after{animation:none!important;transition:none!important;scroll-behavior:auto!important}
.elementor-invisible{visibility:visible!important}`

async function prepare(page: Page, url: string) {
  await page.goto(url, { waitUntil: 'load' })
  await page.addStyleTag({ content: FREEZE })
  await page.evaluate(() => {
    document.querySelectorAll('.elementor-invisible').forEach((e) => e.classList.remove('elementor-invisible'))
    document.querySelectorAll('.reveal').forEach((e) => e.classList.add('is-visible'))
  })
  await page.evaluate(() => document.fonts.ready)
  await page.waitForTimeout(300)
}

async function measure(page: Page, selector: string): Promise<Measure> {
  return page.evaluate((sel) => {
    const el = document.querySelector(sel)
    if (!el) return null
    const r = el.getBoundingClientRect()
    const c = getComputedStyle(el)
    return {
      x: Math.round(r.left + window.scrollX),
      y: Math.round(r.top + window.scrollY),
      w: Math.round(r.width),
      h: Math.round(r.height),
      fontSize: c.fontSize,
      color: c.color,
    }
  }, selector)
}

/**
 * Loads `path` in the original site and in the app at the current viewport and
 * asserts every landmark's box is within `tolerancePx` (and, for text
 * landmarks, that font-size and colour match). Full-page screenshots of both
 * are attached to the report for visual review.
 */
export async function compareLandmarks(page: Page, path: string, landmarks: Landmark[], tolerancePx: number) {
  const refPage = await page.context().newPage()
  try {
    await prepare(refPage, REF + path)
    await prepare(page, APP + path)

    const info = test.info()
    await info.attach(`ref${path.replace(/\//g, '_')}.png`, {
      body: await refPage.screenshot({ fullPage: true }),
      contentType: 'image/png',
    })
    await info.attach(`app${path.replace(/\//g, '_')}.png`, {
      body: await page.screenshot({ fullPage: true }),
      contentType: 'image/png',
    })

    for (const lm of landmarks) {
      const r = await measure(refPage, lm.ref)
      const a = await measure(page, lm.app)
      expect.soft(r, `${lm.name}: reference selector ${lm.ref} not found`).not.toBeNull()
      expect.soft(a, `${lm.name}: app selector ${lm.app} not found`).not.toBeNull()
      if (!r || !a) continue
      for (const k of ['x', 'y', 'w', 'h'] as const) {
        expect
          .soft(Math.abs(a[k] - r[k]), `${lm.name}.${k}: app ${a[k]} vs ref ${r[k]}`)
          .toBeLessThanOrEqual(tolerancePx)
      }
      if (lm.text) {
        expect.soft(a.fontSize, `${lm.name}.fontSize`).toBe(r.fontSize)
        expect.soft(a.color, `${lm.name}.color`).toBe(r.color)
      }
    }
  } finally {
    await refPage.close()
  }
}

/** `.elementor-element-<id>` shortcut; `inner` targets the text node wrapper. */
export const el = (id: string, inner = '') => `.elementor-element-${id}${inner ? ' ' + inner : ''}`
export const heading = (id: string) => el(id, '.elementor-heading-title')
export const dataRef = (name: string) => `[data-ref="${name}"]`
