import { createRequire } from 'node:module'
import assert from 'node:assert/strict'
import path from 'node:path'
import os from 'node:os'

const require = createRequire(import.meta.url)
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright')
const base = process.env.TEST_BASE_URL || 'http://localhost:3000'
const slug = process.env.TEST_PROJECT_SLUG || 'delivery-robot'
const browser = await chromium.launch({ headless: true })
const page = await browser.newPage()
const errors = []
page.on('pageerror', error => errors.push(error.message))
try {
  await page.setViewportSize({ width: 1280, height: 900 })
  await page.goto(`${base}/projects`, { waitUntil: 'load' })
  const coverLink = page.locator(`a.project-visual[href="/projects/${slug}"]`)
  await coverLink.waitFor({ timeout: 5000 })
  assert.ok(await coverLink.getAttribute('aria-label'), 'Cover link needs an accessible name')
  await coverLink.click()
  await page.waitForURL(`**/projects/${slug}`)
  await page.goto(`${base}/projects`, { waitUntil: 'load' })
  await coverLink.focus()
  await page.keyboard.press('Enter')
  await page.waitForURL(`**/projects/${slug}`)
  console.log('PASS project cover opens its details with click and keyboard Enter.')
  await page
    .getByRole('heading', { name: 'Project details', exact: true })
    .waitFor({ timeout: 5000 })
  assert.equal(await page.locator('.detail-cover').count(), 0)
  assert.equal(await page.getByText('Click the image to enlarge', { exact: true }).count(), 0)
  const gallery = page.getByRole('region', { name: 'Project gallery' })
  const sidebar = page.locator('.project-sidebar')
  const left = await gallery.boundingBox()
  const right = await sidebar.boundingBox()
  assert.ok(left.x + left.width <= right.x, 'Gallery must be left of the cards')
  assert.ok(left.width > right.width * 1.7, 'Gallery should occupy about two thirds')
  assert.ok(Math.abs(left.y - right.y) < 3, 'Cards must be top-aligned')
  await page.getByRole('heading', { name: 'Project information', exact: true }).waitFor()
  const thumbnails = gallery.getByRole('button', { name: /^Show (image|video) / })
  assert.equal(await thumbnails.count(), 3)
  const first = gallery.locator('.gallery-main img')
  await first.waitFor()
  const firstSrc = await first.getAttribute('src')
  await page.waitForLoadState('load')
  await thumbnails.nth(1).click()
  await page.waitForFunction(
    () =>
      document.querySelectorAll('.gallery-thumbnail')[1]?.getAttribute('aria-pressed') === 'true',
  )
  assert.equal(await thumbnails.nth(1).getAttribute('aria-pressed'), 'true')
  assert.notEqual(await first.getAttribute('src'), firstSrc)
  const selectedSrc = await first.getAttribute('src')
  await page.waitForTimeout(1800)
  assert.equal(await first.getAttribute('src'), selectedSrc, 'Gallery must not autoplay')
  assert.equal(await first.evaluate(img => getComputedStyle(img).objectFit), 'contain')
  await gallery.getByRole('button', { name: 'Open image fullscreen' }).click()
  const dialog = page.getByRole('dialog')
  await dialog.waitFor()
  assert.equal(await dialog.getByRole('button', { name: /^Zoom (in|out)$/ }).count(), 0)
  assert.equal(await dialog.locator('[data-zoomed]').count(), 0)
  assert.equal(
    await dialog.locator('.lightbox-image').evaluate(img => getComputedStyle(img).objectFit),
    'contain',
  )
  await page.screenshot({ path: path.join(os.tmpdir(), 'manuel-project-gallery-fullscreen.png') })
  const lightboxSrc = await dialog.locator('img.lightbox-image').getAttribute('src')
  await page.keyboard.press('ArrowRight')
  await page.waitForFunction(
    previous => document.querySelector('img.lightbox-image')?.getAttribute('src') !== previous,
    lightboxSrc,
  )
  assert.notEqual(await dialog.locator('img.lightbox-image').getAttribute('src'), lightboxSrc)
  await page.keyboard.press('ArrowLeft')
  await page.waitForFunction(
    previous => document.querySelector('img.lightbox-image')?.getAttribute('src') === previous,
    lightboxSrc,
  )
  assert.equal(await dialog.locator('img.lightbox-image').getAttribute('src'), lightboxSrc)
  await page.keyboard.press('Escape')
  await dialog.waitFor({ state: 'hidden' })
  assert.equal(await page.locator(':focus').getAttribute('aria-label'), 'Open image fullscreen')
  console.log(
    'PASS desktop columns, content-height cards, thumbnails, no autoplay, image fitting, fullscreen without zoom or hint, keyboard navigation, Escape and focus return.',
  )
  for (const width of [1280, 390, 320]) {
    await page.setViewportSize({ width, height: 900 })
    assert.equal(
      await page.evaluate(() => document.documentElement.scrollWidth > innerWidth),
      false,
    )
    if (width < 640) {
      const media = await gallery.boundingBox()
      const cards = await sidebar.boundingBox()
      assert.ok(cards.y >= media.y + media.height, 'Mobile must stack gallery before cards')
    }
    await page.evaluate(() => {
      document.activeElement?.blur()
      window.scrollTo({ top: 0, behavior: 'instant' })
    })
    await page.waitForFunction(() => window.scrollY === 0)
    if (width !== 320)
      await page.screenshot({
        path: path.join(os.tmpdir(), `manuel-project-detail-${width}.png`),
        fullPage: true,
      })
    console.log('PASS responsive project detail:', width)
  }
  assert.deepEqual(errors, [])
} finally {
  await browser.close()
}
