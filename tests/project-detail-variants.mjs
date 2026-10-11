// Isolated read-only CMS fixture; never writes to the user's Cockpit backend.
import assert from 'node:assert/strict'
import { createServer } from 'node:http'
import { spawn } from 'node:child_process'
import { createRequire } from 'node:module'
import { setTimeout as delay } from 'node:timers/promises'

const require = createRequire(import.meta.url)
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright')
const entries = [
  {
    _state: 1,
    slug: 'no-photos',
    title: 'No photos',
    content: '<p>A short story.</p>',
    links: { github: 'https://example.com' },
    gallery: [],
  },
  {
    _state: 1,
    slug: 'long-story',
    title: 'Long story',
    content: '<p>' + 'word '.repeat(181) + '</p>',
    links: { website: 'https://example.com' },
    gallery: [{ path: '/image.svg', caption: 'A prototype diagram.' }],
  },
  {
    _state: 1,
    slug: 'mixed-gallery',
    title: 'Mixed gallery',
    content: '<p>A short story.</p>',
    gallery: [
      { path: '/image.svg' },
      { path: '/video.mp4', type: 'video', alt: 'Prototype video' },
    ],
  },
]
const fixture = createServer((request, response) => {
  const url = new URL(request.url, 'http://localhost')
  if (url.pathname.endsWith('/image.svg')) {
    response.setHeader('Content-Type', 'image/svg+xml')
    return response.end(
      '<svg xmlns="http://www.w3.org/2000/svg" width="640" height="480"><rect width="640" height="480" fill="#e1ebe4"/><text x="40" y="80" font-size="28">Test project diagram</text></svg>',
    )
  }
  if (url.pathname.endsWith('/video.mp4')) {
    response.setHeader('Content-Type', 'video/mp4')
    return response.end() // Playback is out of scope; check the native controls/selection contract.
  }
  const filter = JSON.parse(url.searchParams.get('filter') || '{}')
  response.setHeader('Content-Type', 'application/json')
  response.end(JSON.stringify(entries.filter(item => !filter.slug || item.slug === filter.slug)))
})
await new Promise(resolve => fixture.listen(0, '127.0.0.1', resolve))
const reserve = createServer()
await new Promise(resolve => reserve.listen(0, '127.0.0.1', resolve))
const port = reserve.address().port
await new Promise(resolve => reserve.close(resolve))
const base = `http://127.0.0.1:${port}`
const child = spawn(
  process.execPath,
  ['node_modules/next/dist/bin/next', 'dev', '--hostname', '127.0.0.1', '--port', String(port)],
  {
    env: {
      ...process.env,
      COCKPIT_URL: `http://127.0.0.1:${fixture.address().port}`,
      NEXT_DIST_DIR: '.next-fixture',
    },
    stdio: ['ignore', 'pipe', 'pipe'],
  },
)
let log = ''
child.stdout.on('data', value => {
  log = (log + value).slice(-12000)
})
child.stderr.on('data', value => {
  log = (log + value).slice(-12000)
})
let browser
try {
  let ready = false
  for (let attempt = 0; attempt < 80; attempt++) {
    if (child.exitCode !== null) throw new Error(log)
    try {
      const response = await fetch(`${base}/projects/no-photos`, {
        signal: AbortSignal.timeout(1000),
      })
      await response.text()
      if (response.ok) {
        ready = true
        break
      }
    } catch {}
    await delay(250)
  }
  assert.ok(ready, log)
  browser = await chromium.launch({ headless: true })
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } })
  await page.goto(`${base}/projects/no-photos`, { waitUntil: 'load' })
  await page.getByText('Photos will be added here soon.').waitFor()
  assert.equal(await page.locator('.detail-cover').count(), 0)
  assert.equal(await page.getByRole('button', { name: 'Open image fullscreen' }).count(), 0)
  const information = await page.locator('.information-card').boundingBox()
  const emptyGallery = await page.locator('.project-gallery').boundingBox()
  assert.ok(
    information.height < emptyGallery.height,
    'Short link card must not stretch to gallery height',
  )
  assert.equal(
    await page.getByRole('link', { name: 'GitHub' }).getAttribute('href'),
    'https://example.com',
  )
  console.log(
    'PASS empty gallery, no cover fallback, and a content-height links-only information card.',
  )

  await page.goto(`${base}/projects/long-story`, { waitUntil: 'load' })
  await page.locator('.expanded-details').waitFor()
  const story = await page.locator('.details-card').boundingBox()
  const gallery = await page.locator('.project-gallery').boundingBox()
  assert.ok(story.y >= gallery.y + gallery.height)
  assert.ok(story.width > gallery.width)
  assert.equal(
    await page.getByRole('button', { name: 'Next image', exact: true }).isDisabled(),
    true,
  )
  await page.getByText('A prototype diagram.').waitFor()
  await page.setViewportSize({ width: 390, height: 900 })
  const mobileStory = await page.locator('.details-card').boundingBox()
  const mobileInfo = await page.locator('.information-card').boundingBox()
  assert.ok(
    mobileInfo.y >= mobileStory.y + mobileStory.height,
    'Long-story mobile order must be gallery, details, information',
  )
  console.log(
    'PASS long descriptions below gallery, single-image controls, captions, and mobile ordering.',
  )

  await page.goto(`${base}/projects/mixed-gallery`, { waitUntil: 'load' })
  await page.getByRole('button', { name: 'Show video 2', exact: true }).click()
  await page.locator('.gallery-main video').waitFor()
  const video = await page
    .locator('.gallery-main video')
    .evaluate(element => ({
      controls: element.controls,
      autoplay: element.autoplay,
      paused: element.paused,
    }))
  assert.deepEqual(video, { controls: true, autoplay: false, paused: true })
  assert.equal(await page.getByRole('button', { name: 'Open image fullscreen' }).count(), 0)
  await page.getByRole('button', { name: 'Show image 1', exact: true }).click()
  await page.locator('.gallery-main img').waitFor()
  console.log(
    'PASS explicit video selection, native controls, no autoplay, and switching back to images (not video playback).',
  )
} catch (error) {
  console.error(log)
  throw error
} finally {
  await browser?.close()
  child.kill('SIGTERM')
  await Promise.race([new Promise(resolve => child.once('exit', resolve)), delay(5000)])
  if (child.exitCode === null && child.signalCode === null) child.kill('SIGKILL')
  fixture.closeAllConnections()
  await new Promise(resolve => fixture.close(resolve))
}
