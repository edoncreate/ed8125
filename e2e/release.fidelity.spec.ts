import { test } from '@playwright/test'
import { compareLandmarks } from './fidelity'
import { ALBUM_PAGE, BEATS_PAGE } from './landmarks'

test('album page matches the original', async ({ page }, info) => {
  const phone = info.project.name === 'phone'
  await compareLandmarks(page, '/brasil-com-amor/', ALBUM_PAGE(phone), phone ? 10 : 6, '.ai-track')
})

test('latest-beats page matches the original', async ({ page }, info) => {
  const phone = info.project.name === 'phone'
  await compareLandmarks(page, '/latest-beats/', BEATS_PAGE, phone ? 10 : 6, '.ai-track')
})
