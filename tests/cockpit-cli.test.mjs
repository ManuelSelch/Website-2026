import assert from 'node:assert/strict'
import { test } from 'node:test'
import { run } from '../scripts/cockpit.mjs'

const item = { _id: 'id', slug: 'example', title: 'Latest CMS text', _state: 1 }
const snapshot = { revision: 'a'.repeat(64), item }
function fixture() {
  const calls = [],
    writes = [],
    output = []
  return {
    calls,
    writes,
    output,
    options: {
      env: { COCKPIT_URL: 'https://cms.example.com', COCKPIT_WRITE_API_KEY: 'secret-token' },
      readFile: async file =>
        JSON.stringify(file === 'snapshot.json' ? snapshot : { content: '<p>New</p>' }),
      writeFile: async (...args) => writes.push(args),
      fetch: async (...args) => {
        calls.push(args)
        return new Response(JSON.stringify(snapshot))
      },
      log: text => output.push(text),
    },
  }
}
test('help needs no credentials and obsolete full saves fail before any request', async () => {
  const f = fixture()
  await run(['--help'], { ...f.options, env: {} })
  for (const args of [
    ['save', 'project.json'],
    ['save', 'project.json', '--update'],
    ['save', 'project.json', '--publish'],
  ]) {
    await assert.rejects(run(args, f.options), /disabled/)
  }
  assert.equal(f.calls.length, 0)
})
test('get saves an exclusive current snapshot including drafts without printing content', async () => {
  const f = fixture()
  await run(['get', 'example', 'snapshot.json'], f.options)
  assert.equal(f.calls[0][0].pathname, '/api/portfolio/authoring')
  assert.deepEqual(JSON.parse(f.calls[0][1].body), { action: 'get', slug: 'example' })
  assert.equal(f.writes[0][2].flag, 'wx')
  assert.deepEqual(JSON.parse(f.writes[0][1]), snapshot)
  assert.doesNotMatch(f.output.join(''), /Latest CMS text|secret-token/)
})
test('text updates send only explicit text fields and snapshot revision, never state', async () => {
  const f = fixture()
  await run(['edit-text', 'snapshot.json', 'patch.json'], f.options)
  assert.deepEqual(JSON.parse(f.calls[0][1].body), {
    action: 'edit-text',
    id: 'id',
    revision: snapshot.revision,
    patch: { content: '<p>New</p>' },
  })
})
test('media edits cannot overwrite text or publication status', async () => {
  const f = fixture()
  f.options.readFile = async file =>
    JSON.stringify(file === 'snapshot.json' ? snapshot : { cover: { _id: 'asset' }, gallery: [] })
  await run(['set-media', 'snapshot.json', 'media.json'], f.options)
  const sent = JSON.parse(f.calls[0][1].body)
  assert.deepEqual(sent.patch, { cover: { _id: 'asset' }, gallery: [] })
  assert.equal(sent.patch.title, undefined)
  assert.equal(sent.patch._state, undefined)
})
test('rejects mixed fields, empty patches and invalid snapshots without contacting CMS', async () => {
  for (const patch of [{ title: 'Oops' }, { _state: 1 }, {}, { gallery: [], content: 'Oops' }]) {
    const f = fixture()
    f.options.readFile = async file => JSON.stringify(file === 'snapshot.json' ? snapshot : patch)
    await assert.rejects(run(['set-media', 'snapshot.json', 'patch.json'], f.options))
    assert.equal(f.calls.length, 0)
  }
  const f = fixture()
  f.options.readFile = async () => '{}'
  await assert.rejects(run(['publish', 'snapshot.json'], f.options), /snapshot/)
  assert.equal(f.calls.length, 0)
})
test('conflicts abort without retry or unsafe fallback', async () => {
  const f = fixture()
  f.options.fetch = async (...args) => {
    f.calls.push(args)
    return new Response('sensitive details', { status: 409 })
  }
  await assert.rejects(
    run(['edit-text', 'snapshot.json', 'patch.json'], f.options),
    /changed.*fresh snapshot/i,
  )
  assert.equal(f.calls.length, 1)
})
test('HTTP and network errors never expose response bodies or credentials', async () => {
  const f = fixture()
  f.options.fetch = async () => new Response('secret-token', { status: 403 })
  await assert.rejects(run(['get', 'example', 'snapshot.json'], f.options), /HTTP 403/)
  f.options.fetch = async () => {
    throw Error('secret-token')
  }
  await assert.rejects(run(['get', 'example', 'snapshot.json'], f.options), {
    message: 'Cockpit request failed or timed out.',
  })
})
test('snapshot cannot be saved if it contains the credential; redirects are refused', async () => {
  const f = fixture()
  f.options.fetch = async (...args) => {
    f.calls.push(args)
    return new Response(JSON.stringify({ ...snapshot, item: { ...item, title: 'secret-token' } }))
  }
  await assert.rejects(run(['get', 'example', 'snapshot.json'], f.options), /credential/)
  assert.equal(f.writes.length, 0)
  assert.equal(f.calls[0][1].redirect, 'error')
})
test('create accepts no identity or publication fields and cannot upsert', async () => {
  const f = fixture()
  f.options.readFile = async () => JSON.stringify({ title: 'New', slug: 'new' })
  await run(['create', 'new.json'], f.options)
  assert.deepEqual(JSON.parse(f.calls[0][1].body), {
    action: 'create',
    data: { title: 'New', slug: 'new' },
  })
  f.options.readFile = async () => JSON.stringify({ _id: 'id', title: 'New', slug: 'new' })
  await assert.rejects(run(['create', 'new.json'], f.options))
})
