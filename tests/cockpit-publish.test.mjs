import { test } from 'node:test'
import assert from 'node:assert/strict'
import { run } from '../scripts/cockpit.mjs'

test('publication is an independent revision-guarded action without other fields', async () => {
  for (const action of ['publish', 'unpublish']) {
    let sent
    await run([action, 'snapshot.json'], {
      env: { COCKPIT_WRITE_API_KEY: 'fake' },
      readFile: async () =>
        JSON.stringify({ item: { _id: 'id', title: 'Not sent' }, revision: 'b'.repeat(64) }),
      fetch: async (_url, options) => {
        sent = JSON.parse(options.body)
        return new Response('{"ok":true}')
      },
      log: () => {},
    })
    assert.deepEqual(sent, { action, id: 'id', revision: 'b'.repeat(64) })
  }
})
