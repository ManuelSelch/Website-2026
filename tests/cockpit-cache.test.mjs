import { test } from 'node:test'
import assert from 'node:assert/strict'
import { CockpitClient } from '../lib/cockpit.ts'

test('Cockpit bypasses development caching but retains production revalidation', async () => {
  const originalFetch = globalThis.fetch
  const originalEnv = process.env.NODE_ENV
  try {
    for (const env of ['development', 'production']) {
      process.env.NODE_ENV = env
      let options
      globalThis.fetch = async (_url, init) => {
        options = init
        return new Response('[]')
      }
      await new CockpitClient('https://cms.example.com').collection('projects')
      if (env === 'development') {
        assert.equal(options.cache, 'no-store')
        assert.equal(options.next, undefined)
      } else {
        assert.equal(options.cache, undefined)
        assert.deepEqual(options.next, { revalidate: 60 })
      }
    }
  } finally {
    globalThis.fetch = originalFetch
    if (originalEnv === undefined) delete process.env.NODE_ENV
    else process.env.NODE_ENV = originalEnv
  }
})
