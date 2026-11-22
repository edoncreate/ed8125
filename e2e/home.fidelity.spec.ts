import { test } from '@playwright/test'
import { compareLandmarks } from './fidelity'
import { HOME_DESKTOP, HOME_PHONE } from './landmarks'

test('home matches the original', async ({ page }, info) => {
  const phone = info.project.name === 'phone'
  await compareLandmarks(page, '/', phone ? HOME_PHONE : HOME_DESKTOP, phone ? 10 : 6)
})
