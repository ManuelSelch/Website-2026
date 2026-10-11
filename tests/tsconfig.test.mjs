import assert from 'node:assert/strict'
import { test } from 'node:test'
import { createRequire } from 'node:module'
import path from 'node:path'

const require = createRequire(import.meta.url)
const ts = require('typescript')
const root = path.resolve(import.meta.dirname, '..')
const { config, error } = ts.readConfigFile(path.join(root, 'tsconfig.json'), ts.sys.readFile)

test('path aliases resolve without the deprecated baseUrl option', () => {
  assert.equal(error, undefined)
  assert.equal(config.compilerOptions.baseUrl, undefined)
  const parsed = ts.parseJsonConfigFileContent(config, ts.sys, root)
  assert.deepEqual(parsed.errors, [])
  const result = ts.resolveModuleName('@/lib/projects', path.join(root, 'app/page.tsx'), parsed.options, ts.sys)
  assert.equal(result.resolvedModule?.resolvedFileName, path.join(root, 'lib/projects.ts'))
})
