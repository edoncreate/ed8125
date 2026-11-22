import { expect, test, type Browser, type BrowserContext, type Page } from '@playwright/test'
import { mkdirSync, writeFileSync } from 'node:fs'

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

type Measure = {
  x: number
  y: number
  w: number
  h: number
  fontSize: string
  color: string
  style: Record<string, string>
} | null

const FREEZE = `*,*::before,*::after{animation:none!important;transition:none!important;scroll-behavior:auto!important}
.elementor-invisible{visibility:visible!important}`

/** Hosts the original pages may reach besides the reference server (web fonts only). */
const REF_ALLOWED_HOSTS = new Set(['localhost', 'fonts.googleapis.com', 'fonts.gstatic.com'])

/**
 * Opens a page of the original site in its own browser context (separate from
 * the app's cookies/storage), with every third-party request blocked except
 * web fonts — no analytics, tag manager or share widgets run.
 */
export async function openReference(
  browser: Browser,
  path: string,
  options: { viewport?: { width: number; height: number } | null; isMobile?: boolean; hasTouch?: boolean } = {},
): Promise<{ context: BrowserContext; page: Page }> {
  const context = await browser.newContext(options)
  await context.route('**/*', (route) => {
    const host = new URL(route.request().url()).hostname
    return REF_ALLOWED_HOSTS.has(host) ? route.continue() : route.abort('blockedbyclient')
  })
  const page = await context.newPage()
  await page.goto(REF + path, { waitUntil: 'load' })
  return { context, page }
}

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
      style: {
        font: `${c.fontWeight} ${c.fontSize}/${c.lineHeight} ${c.fontFamily.split(',')[0]}`,
        ls: c.letterSpacing,
        tt: c.textTransform,
        margin: c.margin,
        padding: c.padding,
        bg: c.backgroundColor,
        radius: c.borderRadius,
        align: c.textAlign,
      },
    }
  }, selector)
}

/**
 * Loads `path` in the original site and in the app at the current viewport and
 * asserts every landmark's box is within `tolerancePx` (and, for text
 * landmarks, that font-size and colour match). Full-page screenshots of both
 * are attached to the report for visual review.
 */
export async function compareLandmarks(
  page: Page,
  path: string,
  landmarks: Landmark[],
  tolerancePx: number,
  /** Selector to wait for in the original before measuring (async widgets). */
  refReady?: string,
) {
  const appContext = page.context()
  const browser = appContext.browser()!
  const { context: refContext, page: refPage } = await openReference(browser, path, {
    viewport: page.viewportSize(),
    isMobile: test.info().project.use.isMobile,
    hasTouch: test.info().project.use.hasTouch,
  })
  try {
    await prepare(refPage, REF + path)
    if (refReady) await refPage.waitForSelector(refReady, { timeout: 15_000 })
    await prepare(page, APP + path)

    const info = test.info()
    for (const [label, p] of [['ref', refPage], ['app', page]] as const) {
      try {
        await info.attach(`${label}${path.replace(/\//g, '_')}.png`, {
          body: await p.screenshot({ fullPage: true, timeout: 15_000 }),
          contentType: 'image/png',
        })
      } catch (err) {
        // Screenshots are review aids; a capture failure must not hide the measurements.
        console.warn(`${label} screenshot failed: ${(err as Error).message.split('\n')[0]}`)
      }
    }

    const report: Record<string, unknown>[] = []
    for (const lm of landmarks) {
      const r = await measure(refPage, lm.ref)
      const a = await measure(page, lm.app)
      report.push({
        name: lm.name,
        delta: r && a ? { x: a.x - r.x, y: a.y - r.y, w: a.w - r.w, h: a.h - r.h } : null,
        ref: r,
        app: a,
      })
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
    // FIDELITY_REPORT=1 writes every measurement for tuning.
    if (process.env.FIDELITY_REPORT) {
      const file = `test-results/fidelity-${info.project.name}${path.replace(/\//g, '_')}.json`
      mkdirSync('test-results', { recursive: true })
      writeFileSync(file, JSON.stringify(report, null, 1))
    }
  } finally {
    await refContext.close()
  }
}

/** `.elementor-element-<id>` shortcut; `inner` targets the text node wrapper. */
export const el = (id: string, inner = '') => `.elementor-element-${id}${inner ? ' ' + inner : ''}`
export const heading = (id: string) => el(id, '.elementor-heading-title')
export const dataRef = (name: string) => `[data-ref="${name}"]`
