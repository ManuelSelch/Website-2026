import assert from 'node:assert/strict'
import { test } from 'node:test'

const base = process.env.TEST_BASE_URL
const check = (name, fn) => test(name, { skip: !base }, fn)
async function page(path) {
  const response = await fetch(`${base}${path}`)
  // Ignore serialized React boundary definitions; assert on rendered HTML only.
  const html = (await response.text()).replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '')
  return { status: response.status, html }
}

check('homepage uses the approved English Mantine light design and correct contact', async () => {
  const { status, html } = await page('/')
  assert.equal(status, 200)
  assert.match(html, /<html[^>]*lang="en"/)
  assert.match(html, /data-mantine-color-scheme="light"/)
  assert.match(html, /Curiosity, turned/)
  assert.match(html, /things that work/)
  assert.match(html, /mailto:manuel@selch\.de/)
  assert.match(html, /href="\/projects"/)
  assert.doesNotMatch(html, /selch\.dev|Hallo, ich bin|DESIGN STUDY|ILLUSTRATIVE PREVIEW/)
})
test(
  'empty collection renders honest homepage and project-list states',
  { skip: !base || process.env.TEST_EXPECT_EMPTY !== '1' },
  async () => {
    const home = await page('/')
    const projects = await page('/projects')
    assert.equal(projects.status, 200)
    assert.match(home.html, /Project stories are on their way/)
    assert.match(projects.html, /Project stories are on their way/)
    assert.doesNotMatch(projects.html, /href="\/projects\/undefined"/)
  },
)
test(
  'published project is visible in the overview and detail page',
  { skip: !base || !process.env.TEST_PROJECT_SLUG },
  async () => {
    const slug = process.env.TEST_PROJECT_SLUG
    const projects = await page('/projects')
    assert.equal(projects.status, 200)
    assert.ok(projects.html.includes(`href="/projects/${slug}"`))
    const detail = await page(`/projects/${slug}`)
    assert.equal(detail.status, 200)
    assert.doesNotMatch(detail.html, /Project not found|content="noindex"/)
    assert.match(detail.html, /Back to projects/)
    assert.match(detail.html, /class="[^\"]*article-content/)
  },
)
check('navigation targets homepage sections from the projects route', async () => {
  const { html } = await page('/projects')
  assert.match(html, /href="\/#about"/)
  assert.match(html, /href="\/#contact"/)
  assert.match(html, /Back to home/)
})
check('missing project has a helpful English not-found page', async () => {
  const { status, html } = await page('/projects/does-not-exist')
  // Next.js retains HTTP 200 when a loading boundary has already started streaming.
  assert.ok([200, 404].includes(status))
  assert.match(html, /<meta name="robots" content="noindex"/)
  assert.match(html, /Project not found/)
  // A streamed not-found response sends the boundary marker; the client renders its UI.
  assert.match(html, /Back to projects|data-dgst="NEXT_NOT_FOUND"/)
})
