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
  for (const width of [1280, 900, 761, 760, 390, 320]) {
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
        const portrait = page.getByRole('img', {
          name: 'Illustrated black-and-white portrait of Manuel Selch',
        })
        await portrait.waitFor({ state: 'visible', timeout: 10000 })
        await portrait.evaluate(image => image.decode())
        const picture = await portrait.boundingBox()
        const heading = await page.locator('.hero-heading').boundingBox()
        const introduction = await page.locator('.hero-introduction').boundingBox()
        assert.ok(picture.width > 0 && Math.abs(picture.width - picture.height) < 1)
        if (width > 760) {
          assert.ok(picture.x >= heading.x + heading.width, 'Portrait must sit beside the hero')
          assert.ok(Math.abs(picture.width - Math.min(300, Math.max(220, width * 0.25))) < 1)
        } else {
          assert.equal(Math.round(picture.width), 144)
          assert.ok(picture.y >= heading.y + heading.height, 'Mobile portrait follows the headline')
          assert.ok(
            introduction.y >= picture.y + picture.height,
            'Mobile introduction follows the portrait',
          )
        }
        assert.equal(await page.getByRole('link', { name: /Explore my work/ }).count(), 0)
        const expectedTitleSize =
          width <= 760
            ? Math.min(61, Math.max(40, width * 0.08))
            : Math.min(76, Math.max(44, width * 0.059))
        const titleSize = await page
          .locator('h1')
          .evaluate(element => getComputedStyle(element).fontSize)
        assert.ok(
          Math.abs(parseFloat(titleSize) - expectedTitleSize) < 0.1,
          'Approved hero typography must override Mantine defaults',
        )
        const labelSize = await page
          .locator('.hero .eyebrow')
          .evaluate(element => getComputedStyle(element).fontSize)
        assert.equal(labelSize, width > 640 ? '10px' : '8px')
      }
      console.log('PASS responsive light page:', width, route)
    }
    await page.goto(`${base}/`, { waitUntil: 'domcontentloaded' })
    if (width === 1280 || width === 390) {
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
  await page.goto(`${base}/projects/does-not-exist`, { waitUntil: 'domcontentloaded' })
  await page.getByRole('heading', { name: /^Project not found/ }).waitFor()
  assert.match(await page.locator('meta[name="robots"]').first().getAttribute('content'), /noindex/)
  await page.getByRole('link', { name: 'Back to projects' }).click()
  await page.waitForURL('**/projects')
  console.log('PASS hydrated not-found UI, noindex, and back-to-projects navigation.')
} finally {
  await browser.close()
}
