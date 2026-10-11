// Optional real-browser check: supply TEST_BASE_URL and an installed Playwright module.
import { createRequire } from 'node:module'
import assert from 'node:assert/strict'
import path from 'node:path'
import os from 'node:os'

const require = createRequire(import.meta.url)
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright')
const base = process.env.TEST_BASE_URL || 'http://localhost:3000'
const browser = await chromium.launch({ headless: true })
const page = await browser.newPage()
const errors = []
page.on('pageerror', error => errors.push(error.message))
page.on('console', message => {
  if (message.type() === 'error') errors.push(message.text())
})
try {
  for (const width of [1280, 390, 320]) {
    await page.setViewportSize({ width, height: 900 })
    for (const route of ['/', '/projects']) {
      await page.goto(`${base}${route}`, { waitUntil: 'domcontentloaded' })
      await page.getByRole('heading', { level: 1 }).waitFor({ state: 'visible' })
      await page.waitForFunction(
        () => getComputedStyle(document.body).backgroundColor === 'rgb(247, 249, 248)',
      )
      const state = await page.evaluate(() => ({
        overflow: document.documentElement.scrollWidth > innerWidth,
        background: getComputedStyle(document.body).backgroundColor,
        scheme: document.documentElement.dataset.mantineColorScheme,
        lang: document.documentElement.lang,
      }))
      assert.equal(state.overflow, false, `Overflow at ${width} ${route}`)
      assert.equal(state.background, 'rgb(247, 249, 248)')
      assert.equal(state.scheme, 'light')
      assert.equal(state.lang, 'en')
      if (route === '/') {
        const expectedTitleSize = width === 1280 ? '86px' : width === 320 ? '36px' : '40px'
        const titleSize = await page
          .locator('h1')
          .evaluate(element => getComputedStyle(element).fontSize)
        assert.equal(
          titleSize,
          expectedTitleSize,
          'Approved hero typography must override Mantine defaults',
        )
        const labelSize = await page
          .locator('.hero .eyebrow')
          .evaluate(element => getComputedStyle(element).fontSize)
        assert.equal(labelSize, width === 1280 ? '10px' : '8px')
      }
      console.log('PASS responsive light page:', width, route)
    }
    await page.goto(`${base}/`, { waitUntil: 'domcontentloaded' })
    if (width !== 320) {
      const file = path.join(os.tmpdir(), `manuel-portfolio-${width}.png`)
      await page.screenshot({ path: file, fullPage: true })
      console.log('Screenshot:', file)
    }
  }
  await page.goto(`${base}/`)
  await page.keyboard.press('Tab')
  assert.equal(await page.locator(':focus').textContent(), 'Skip to content')
  await page.keyboard.press('Enter')
  assert.equal(await page.locator(':focus').getAttribute('id'), 'main-content')
  await page.goto(`${base}/projects`)
  await page.getByRole('link', { name: 'About', exact: true }).click()
  await page.waitForURL('**/#about')
  assert.equal(
    await page.getByRole('link', { name: 'manuel@selch.de' }).getAttribute('href'),
    'mailto:manuel@selch.de',
  )
  assert.deepEqual(errors, [])
  console.log('PASS keyboard skip link, cross-route navigation, email, and no browser errors.')
} finally {
  await browser.close()
}
