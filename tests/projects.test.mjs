import assert from 'node:assert/strict'
import { test, mock } from 'node:test'
import * as projects from '../lib/projects.ts'
import * as client from '../lib/cockpit.ts'
const { getProjects, getFeaturedProjects, getProjectBySlug, getAllProjectSlugs, assetUrlFrom } =
  projects
const { CockpitClient } = client

const project = {
  title: 'Pi-Chat',
  slug: 'pi-chat',
  _state: 1,
  featured: true,
  summary: 'A coding workspace.',
  tags: ['Software'],
  cover: { path: '/pi.png', alt: 'Pi-Chat workspace' },
}
function respond(body, status = 200) {
  return mock.method(
    globalThis,
    'fetch',
    async () =>
      new Response(JSON.stringify(body), {
        status,
        headers: { 'Content-Type': 'application/json' },
      }),
  )
}

test('public array response is used consistently by listing, featured projects, slugs, and lookup', async () => {
  const fetch = respond([project])
  try {
    assert.equal((await getProjects())[0].title, 'Pi-Chat')
    assert.equal((await getFeaturedProjects())[0].slug, 'pi-chat')
    assert.deepEqual(await getAllProjectSlugs(), ['pi-chat'])
    assert.equal((await getProjectBySlug('pi-chat')).summary, project.summary)
    for (const call of fetch.mock.calls) {
      const filter = JSON.parse(new URL(call.arguments[0]).searchParams.get('filter'))
      assert.equal(filter._state, 1)
      assert.equal(filter.published, undefined)
    }
  } finally {
    fetch.mock.restore()
  }
})
test('empty collection is not fabricated', async () => {
  const fetch = respond([])
  try {
    assert.deepEqual(await getProjects(), [])
    assert.deepEqual(await getFeaturedProjects(), [])
    assert.equal(await getProjectBySlug('missing'), null)
  } finally {
    fetch.mock.restore()
  }
})
test('drafts, invalid slugs, and duplicate slugs are not shown', async () => {
  const fetch = respond([
    project,
    { ...project },
    { ...project, slug: 'draft', _state: 0, published: true },
    { ...project, slug: 'unset', _state: undefined, published: true },
    { ...project, slug: '../bad' },
  ])
  try {
    assert.deepEqual(
      (await getProjects()).map(p => p.slug),
      ['pi-chat'],
    )
    assert.equal(await getProjectBySlug('draft'), null)
    assert.equal(await getProjectBySlug('unknown'), null)
  } finally {
    fetch.mock.restore()
  }
})
test('legacy entries wrapper is accepted but an invalid API shape is an error', async () => {
  let fetch = respond({ entries: [project] })
  try {
    assert.equal((await getProjects()).length, 1)
  } finally {
    fetch.mock.restore()
  }
  fetch = respond({ error: 'bad contract' })
  try {
    await assert.rejects(getProjects(), /response/i)
  } finally {
    fetch.mock.restore()
  }
})
test('API failures stay errors instead of returning empty projects', async () => {
  const fetch = respond({ error: 'unavailable' }, 503)
  try {
    await assert.rejects(getProjects(), /503/)
  } finally {
    fetch.mock.restore()
  }
})
test('featured selection does not substitute unfeatured entries', async () => {
  const fetch = respond([
    { ...project, featured: false },
    { ...project, slug: 'robot', featured: true },
  ])
  try {
    assert.deepEqual(
      (await getFeaturedProjects()).map(p => p.slug),
      ['robot'],
    )
  } finally {
    fetch.mock.restore()
  }
})
test('public requests omit credentials and use a consistent cache interval', async () => {
  const fetch = respond([])
  try {
    await new CockpitClient('http://localhost:8080').collection('projects', {
      limit: 10,
      populate: 0,
    })
    const [url, options] = fetch.mock.calls[0].arguments
    assert.equal(new URL(url).searchParams.get('populate'), '0')
    assert.equal(new URL(url).searchParams.get('limit'), '10')
    assert.equal(options.headers?.['api-key'], undefined)
    assert.equal(options.next.revalidate, 60)
  } finally {
    fetch.mock.restore()
  }
})
test('safe asset URLs handle relative and absolute paths', () => {
  assert.match(assetUrlFrom('/pi.png'), /\/storage\/uploads\/pi.png$/)
  assert.match(assetUrlFrom('pi.png'), /\/storage\/uploads\/pi.png$/)
  assert.equal(assetUrlFrom('https://example.com/pi.png'), 'https://example.com/pi.png')
  assert.equal(assetUrlFrom('javascript:alert(1)'), null)
})
test('gallery metadata accepts native Cockpit text and explicit overrides', async () => {
  const fetch = respond([
    {
      ...project,
      gallery: [
        { path: '/first.png', altText: 'Robot side view', description: 'The prototype.' },
        {
          path: '/second.png',
          alt: 'Front view',
          altText: 'Ignored',
          caption: 'Explicit caption',
          description: 'Ignored',
        },
      ],
    },
  ])
  try {
    const [result] = await getProjects()
    assert.equal(result.gallery[0].alt, 'Robot side view')
    assert.equal(result.gallery[0].caption, 'The prototype.')
    assert.equal(result.gallery[1].alt, 'Front view')
    assert.equal(result.gallery[1].caption, 'Explicit caption')
  } finally {
    fetch.mock.restore()
  }
})

test('unsafe external links and malformed optional fields are excluded', async () => {
  const fetch = respond([
    {
      ...project,
      tags: ['Software', 42],
      gallery: [
        null,
        { path: '/photo.png', alt: 'Robot', description: 'The navigation prototype.' },
      ],
      links: { website: 'javascript:alert(1)', github: 'https://github.com/ManuelSelch/pi-chat' },
    },
  ])
  try {
    const [result] = await getProjects()
    assert.deepEqual(result.tags, ['Software'])
    assert.equal(result.gallery.length, 1)
    assert.equal(result.gallery[0].caption, 'The navigation prototype.')
    assert.equal(result.links.website, undefined)
    assert.equal(result.links.github, 'https://github.com/ManuelSelch/pi-chat')
  } finally {
    fetch.mock.restore()
  }
})
