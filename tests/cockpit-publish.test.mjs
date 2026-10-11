import { test } from 'node:test'
import assert from 'node:assert/strict'
import { run } from '../scripts/cockpit.mjs'

test('publishing requires explicit flag and sends native published state', async () => {
  let sent
  const output = []
  await run(['save', 'pi-chat.json', '--publish'], {
    env: { COCKPIT_WRITE_API_KEY: 'fake' },
    readFile: async () => JSON.stringify({ title: 'Pi-Chat', slug: 'pi-chat' }),
    fetch: async (url, options) => {
      sent = JSON.parse(options.body)
      return new Response('{"_id":"id"}')
    },
    log: value => output.push(value),
  })
  assert.equal(sent.data._state, 1)
  assert.match(output.join(''), /published/)
})
test('find queries all publication states for exact slug without changing data', async () => {
  let requested
  const output = []
  await run(['find', 'pi-chat'], {
    env: { COCKPIT_WRITE_API_KEY: 'fake' },
    fetch: async (url, options) => {
      requested = url
      assert.equal(options.method, 'GET')
      return new Response('[{"_id":"id","slug":"pi-chat","_state":0,"private":"not printed"}]')
    },
    log: value => output.push(value),
  })
  assert.deepEqual(JSON.parse(requested.searchParams.get('filter')), { slug: 'pi-chat' })
  assert.match(output.join(''), /id/)
  assert.doesNotMatch(output.join(''), /private|not printed/)
})
