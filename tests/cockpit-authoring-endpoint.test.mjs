import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

test('authoring route fails closed without addon, uses privileged auth and field allowlists', async () => {
  const endpoint = await readFile(
    new URL('../docs/cockpit/api/portfolio/authoring.post.php', import.meta.url),
    'utf8',
  )
  assert.match(endpoint, /Authoring addon required/)
  assert.match(endpoint, /!\$allowed\('read'\) \|\| !\$allowed\('update'\)/)
  assert.match(endpoint, /\$allowed\('publish'\)/)
  assert.match(endpoint, /array_diff\(array_keys\(\$patch\), \$fields\)/)
  assert.match(endpoint, /\$patch\['_state'\] = 0/)
  assert.doesNotMatch(endpoint, /\$_GET\['api_key'\]/)
})
const php = spawnSync('php', ['--version'])
test(
  'shared editor hooks preserve text, reject conflicts and back up changes',
  {
    skip:
      php.error?.code === 'ENOENT'
        ? 'PHP not installed locally; run php tests/cockpit-authoring-hooks.php on server'
        : false,
  },
  () => {
    const result = spawnSync(
      'php',
      [fileURLToPath(new URL('./cockpit-authoring-hooks.php', import.meta.url))],
      { encoding: 'utf8' },
    )
    assert.equal(result.status, 0, result.stdout + result.stderr)
  },
)
