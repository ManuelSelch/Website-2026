import { test } from 'node:test'
import assert from 'node:assert/strict'
import { run } from '../scripts/cockpit.mjs'

test('upload sends multipart and saves native asset reference without secrets', async () => {
  const calls = [],
    saved = []
  await run(['upload', 'image.png', 'asset.json'], {
    env: { COCKPIT_WRITE_API_KEY: 'secret', COCKPIT_URL: 'http://localhost:8080/cms' },
    readFile: async () => Buffer.from('image'),
    access: async () => {
      throw Object.assign(new Error(), { code: 'ENOENT' })
    },
    writeFile: async (...args) => saved.push(args),
    fetch: async (...args) => {
      calls.push(args)
      return new Response(
        JSON.stringify({
          asset: {
            _id: 'native',
            path: '/image.png',
            title: 'Image',
            altText: 'image.png',
            folder: 'projects-id',
          },
        }),
      )
    },
    log: () => {},
  })
  assert.equal(calls[0][0].pathname, '/cms/api/portfolio/upload')
  assert.equal(calls[0][1].headers['api-key'], 'secret')
  assert.equal(calls[0][1].headers['Content-Type'], undefined)
  assert.equal(calls[0][1].redirect, 'error')
  assert.equal(calls[0][1].body.get('file').name, 'image.png')
  assert.equal(JSON.parse(saved[0][1])._id, 'native')
  assert.equal(JSON.parse(saved[0][1]).name, 'image.png')
  assert.equal(saved[0][2].flag, 'wx')
})
test('upload rejects unsupported extensions and existing output before contacting CMS', async () => {
  let contacted = false
  const deps = {
    env: { COCKPIT_WRITE_API_KEY: 'fake' },
    fetch: async () => {
      contacted = true
    },
    access: async () => {},
  }
  await assert.rejects(run(['upload', 'script.php', 'asset.json'], deps), /PNG/)
  await assert.rejects(run(['upload', 'image.png', 'asset.json'], deps), /already exists/)
  assert.equal(contacted, false)
})
test('upload failures never print server body and do not save fabricated references', async () => {
  const deps = {
    env: { COCKPIT_WRITE_API_KEY: 'fake' },
    readFile: async () => Buffer.from('image'),
    access: async () => {
      throw Object.assign(new Error(), { code: 'ENOENT' })
    },
    log: () => {},
  }
  await assert.rejects(
    run(['upload', 'image.png', 'asset.json'], {
      ...deps,
      fetch: async () => new Response('sensitive backend details', { status: 403 }),
    }),
    /Cockpit upload failed \(HTTP 403\)/,
  )
  await assert.rejects(
    run(['upload', 'image.png', 'asset.json'], {
      ...deps,
      fetch: async () => new Response('{"asset":{"path":"/image.png"}}'),
    }),
    /native asset/,
  )
})
