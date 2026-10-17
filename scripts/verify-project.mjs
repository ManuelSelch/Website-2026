import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { createRequire } from 'node:module'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { isDeepStrictEqual } from 'node:util'
import { loadLocalEnv } from './local-env.mjs'

// Public GET only: deliberately never attaches an API key.
export async function verifyContent(expected, { env = process.env, fetch: request = fetch } = {}) {
  const base = env.COCKPIT_URL || env.NEXT_PUBLIC_COCKPIT_URL || 'http://localhost:8080'
  const url = new URL('api/content/items/projects', base.replace(/\/$/, '') + '/')
  url.searchParams.set('filter', JSON.stringify({ slug: expected.slug }))
  const response = await request(url, { signal: AbortSignal.timeout(10000) })
  assert.ok(response.ok, `Public CMS HTTP ${response.status}`)
  const data = await response.json()
  const matches = (Array.isArray(data) ? data : data.entries || []).filter(
    p => p.slug === expected.slug,
  )
  assert.equal(matches.length, 1, 'Expected exactly one public project with this slug')
  assert.equal(matches[0]._state, 1, 'Project must be published')
  const assets = [expected.cover, ...(expected.gallery || [])].filter(asset => asset?._id)
  for (const asset of new Map(assets.map(asset => [asset._id, asset])).values()) {
    const response = await request(
      new URL(`api/assets/${encodeURIComponent(asset._id)}`, base.replace(/\/$/, '') + '/'),
      { signal: AbortSignal.timeout(10000) },
    )
    assert.ok(response.ok, 'Native asset lookup failed')
    const native = await response.json()
    assert.ok(
      native?._id === asset._id && native.path === asset.path && native.folder === asset.folder,
      'Native asset reference mismatch',
    )
  }
  for (const field of ['title', 'summary', 'content', 'cover', 'gallery', 'links', 'featured']) {
    if (field in expected)
      assert.ok(
        isDeepStrictEqual(matches[0][field], expected[field]),
        `CMS field mismatch: ${field}`,
      )
  }
}

async function verifyPage(project) {
  const require = createRequire(import.meta.url)
  let playwright
  try {
    playwright = require(process.env.PLAYWRIGHT_MODULE || 'playwright')
  } catch {
    playwright = require(
      require.resolve('playwright', {
        paths: [process.env.HOME + '/.pi/agent/npm/node_modules/pi-browser-debug'],
      }),
    )
  }
  const browser = await playwright.chromium.launch({ headless: true })
  try {
    const page = await browser.newPage({ viewport: { width: 1280, height: 900 } })
    const errors = []
    page.on('pageerror', error => errors.push(error.message))
    const base = (process.env.TEST_BASE_URL || 'http://localhost:3000').replace(/\/$/, '')
    const path = `/projects/${project.slug}`
    const loadedImages = async () =>
      page.waitForFunction(() =>
        [...document.images].every(img => img.complete && img.naturalWidth > 0),
      )
    await page.goto(`${base}/projects`, { waitUntil: 'domcontentloaded' })
    await loadedImages()
    await page.locator(`a.project-visual[href="${path}"]`).click()
    await page.waitForURL(`${base}${path}`)
    await page.getByRole('heading', { level: 1, name: project.title, exact: true }).waitFor()
    const thumbnails = page.locator('.gallery-thumbnail')
    assert.equal(await thumbnails.count(), project.gallery?.length || 0, 'Gallery count mismatch')
    for (let i = 0; i < (project.gallery?.length || 0); i++) {
      await thumbnails.nth(i).click()
      await page.waitForFunction(
        index =>
          document.querySelectorAll('.gallery-thumbnail')[index]?.getAttribute('aria-pressed') ===
          'true',
        i,
      )
      await loadedImages()
    }
    if (await page.getByRole('button', { name: 'Open image fullscreen' }).count()) {
      await page.getByRole('button', { name: 'Open image fullscreen' }).click()
      await page.getByRole('dialog').waitFor()
      await page.keyboard.press('Escape')
      await page.getByRole('dialog').waitFor({ state: 'hidden' })
    }
    await page.setViewportSize({ width: 390, height: 900 })
    assert.equal(
      await page.evaluate(() => document.documentElement.scrollWidth > innerWidth),
      false,
      'Mobile overflow',
    )
    if (project.featured) {
      await page.goto(base, { waitUntil: 'domcontentloaded' })
      await page.locator(`a.project-visual[href="${path}"]`).waitFor()
      await loadedImages()
    }
    assert.equal(errors.length, 0, 'Browser errors detected')
  } finally {
    await browser.close()
  }
}

async function main() {
  const slug = process.argv[2]
  if (process.argv.length !== 3 || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug || ''))
    throw new Error('Usage: npm run verify:project -- <slug>')
  loadLocalEnv()
  const project = JSON.parse(await readFile(`content/projects/${slug}.json`, 'utf8'))
  assert.equal(project.slug, slug, 'Local JSON slug mismatch')
  // One bounded retry window for CMS/page revalidation. No writes or automatic fixes.
  for (let attempt = 0; ; attempt++) {
    try {
      await verifyContent(project)
      console.log('PASS public CMS publication and content')
      await verifyPage(project)
      console.log(
        'PASS collection cover, detail, images, fullscreen, mobile and featured placement',
      )
      return
    } catch (error) {
      if (attempt === 6) throw error
      console.log('Waiting for CMS/site cache; retrying in 10s…')
      await new Promise(resolve => setTimeout(resolve, 10000))
    }
  }
}
if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  main().catch(error => {
    console.error(`FAIL ${error.message}`)
    process.exitCode = 1
  })
}
