import assert from 'node:assert/strict'
import { test } from 'node:test'
import { run } from '../scripts/cockpit.mjs'

function fixture(response = new Response(JSON.stringify({ _id: 'created-id' }))) {
  const calls = [],
    output = []
  return {
    calls,
    output,
    options: {
      env: { COCKPIT_URL: 'http://localhost:8080/cms', COCKPIT_WRITE_API_KEY: 'secret-token' },
      fetch: async (...args) => {
        calls.push(args)
        return response
      },
      readFile: async () => JSON.stringify({ title: 'Example', slug: 'example', _state: 1 }),
      log: message => output.push(message),
    },
  }
}
test('help requires no secret and performs no request', async () => {
  const f = fixture()
  await run(['--help'], { ...f.options, env: {} })
  assert.equal(f.calls.length, 0)
  assert.match(f.output.join(''), /save/)
})
test('check performs a bounded authenticated read without printing secrets', async () => {
  const f = fixture(new Response('[]'))
  await run(['check'], f.options)
  const [url, options] = f.calls[0]
  assert.equal(url.pathname, '/cms/api/content/items/projects')
  assert.equal(url.searchParams.get('limit'), '1')
  assert.equal(options.headers['api-key'], 'secret-token')
  assert.doesNotMatch(f.output.join(''), /secret-token/)
})
test('save wraps a project in data and forces draft publication state', async () => {
  const f = fixture()
  await run(['save', 'project.json'], f.options)
  const [url, options] = f.calls[0]
  assert.equal(url.pathname, '/cms/api/content/item/projects')
  assert.equal(options.method, 'POST')
  assert.deepEqual(JSON.parse(options.body), {
    data: { title: 'Example', slug: 'example', _state: 0 },
  })
  assert.match(f.output.join(''), /created-id/)
})
test('updating requires explicit opt-in and always saves as a draft', async () => {
  const f = fixture()
  f.options.readFile = async () =>
    JSON.stringify({ _id: 'existing', title: 'Example', slug: 'example' })
  await assert.rejects(run(['save', 'project.json'], f.options), /--update/)
  assert.equal(f.calls.length, 0)
  await run(['save', 'project.json', '--update'], f.options)
  assert.equal(JSON.parse(f.calls[0][1].body).data._id, 'existing')
  assert.equal(JSON.parse(f.calls[0][1].body).data._state, 0)
})
test('rejects invalid input, credentials and URLs before making requests', async () => {
  for (const content of ['[]', '{bad', '{}', '{"title":"X","slug":"Bad Slug"}']) {
    const f = fixture()
    f.options.readFile = async () => content
    await assert.rejects(run(['save', 'project.json'], f.options))
    assert.equal(f.calls.length, 0)
  }
  const f = fixture()
  await assert.rejects(run(['check'], { ...f.options, env: {} }), /COCKPIT_WRITE_API_KEY/)
  await assert.rejects(
    run(['check'], {
      ...f.options,
      env: { ...f.options.env, COCKPIT_URL: 'https://user:secret@example.com' },
    }),
    /URL/,
  )
  await assert.rejects(run(['save', 'project.json', '--publish'], f.options), /Usage/)
  assert.equal(f.calls.length, 0)
})
test('HTTP and transport errors do not disclose response bodies or secrets', async () => {
  const f = fixture(new Response('secret-token backend error', { status: 403 }))
  await assert.rejects(run(['check'], f.options), { message: 'Cockpit request failed (HTTP 403).' })
  f.options.fetch = async () => {
    throw new Error('secret-token')
  }
  await assert.rejects(run(['check'], f.options), {
    message: 'Cockpit request failed or timed out.',
  })
})
test('redirects are not followed with the credential', async () => {
  const f = fixture(new Response('', { status: 302 }))
  await assert.rejects(run(['check'], f.options), /HTTP 302/)
  assert.equal(f.calls[0][1].redirect, 'error')
})
