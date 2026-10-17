import { test } from 'node:test'
import assert from 'node:assert/strict'
import { verifyContent } from '../scripts/verify-project.mjs'
import { loadLocalEnv } from '../scripts/local-env.mjs'

const project = {
  slug: 'example',
  title: 'Example',
  summary: 'Summary',
  content: '<p>Story</p>',
  gallery: [{ path: 'https://example.com/image.png', alt: 'Image' }],
  links: { github: 'https://example.com' },
  featured: true,
}
function options(entry = { ...project, _state: 1 }) {
  const requests = []
  return {
    requests,
    env: {},
    fetch: async (url, init) => {
      requests.push({ url, init })
      return new Response(JSON.stringify([entry]))
    },
  }
}
test('public verification compares expected fields without authentication', async () => {
  const f = options()
  await verifyContent(project, f)
  assert.equal(f.requests[0].init.headers, undefined)
  assert.match(f.requests[0].url.pathname, /api\/content\/items\/projects/)
})
test('verification detects missing featured field, mismatches, duplicates and drafts', async () => {
  for (const patch of [
    { featured: undefined },
    { title: 'Wrong' },
    { _state: 0 },
    { gallery: [] },
  ]) {
    await assert.rejects(verifyContent(project, options({ ...project, _state: 1, ...patch })))
  }
  await assert.rejects(
    verifyContent(project, {
      env: {},
      fetch: async () =>
        new Response(
          JSON.stringify([
            { ...project, _state: 1 },
            { ...project, _state: 1 },
          ]),
        ),
    }),
  )
})
test('native references must resolve to the stored asset and folder', async () => {
  const asset = { _id: 'native-id', path: '/photo.png', folder: 'projects-id' }
  const expected = { ...project, cover: asset, gallery: [asset] }
  let wrong = false,
    lookups = 0
  const deps = {
    env: {},
    fetch: async (url, init) => {
      assert.equal(init.headers, undefined)
      if (url.pathname.includes('/api/assets/')) {
        lookups++
        return new Response(
          JSON.stringify({ ...asset, folder: wrong ? 'wrong-folder' : asset.folder }),
        )
      }
      return new Response(JSON.stringify([{ ...expected, _state: 1 }]))
    },
  }
  await verifyContent(expected, deps)
  assert.equal(lookups, 1)
  wrong = true
  await assert.rejects(verifyContent(expected, deps), /Native asset reference mismatch/)
})

test('environment loading tolerates missing file but sanitizes other errors', () => {
  assert.doesNotThrow(() =>
    loadLocalEnv(() => {
      throw Object.assign(new Error('missing'), { code: 'ENOENT' })
    }),
  )
  assert.throws(
    () =>
      loadLocalEnv(() => {
        throw new Error('secret')
      }),
    { message: 'Unable to load .env.local.' },
  )
})
