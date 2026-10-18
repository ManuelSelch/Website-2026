#!/usr/bin/env node
import { readFile, writeFile } from 'node:fs/promises'
import { loadLocalEnv } from './local-env.mjs'
import { uploadImage } from './cockpit-upload.mjs'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

const usage = `Usage:
  npm run cockpit -- check
  npm run cockpit -- get <slug> <new-snapshot.json>
  npm run cockpit -- create <new-project.json>
  npm run cockpit -- set-media <snapshot.json> <media-patch.json>
  npm run cockpit -- edit-text <snapshot.json> <text-patch.json>
  npm run cockpit -- publish <snapshot.json>
  npm run cockpit -- unpublish <snapshot.json>
  npm run cockpit -- history <slug> <new-history.json>
  npm run cockpit -- upload <image.png> <new-asset.json>

Cockpit is the source of truth. Install the PortfolioAuthoring addon and API route first.
Fetch a fresh snapshot before editing; updates send only explicit fields and its revision.
A conflict aborts; no retries, automatic merges, or full-project replacement.
create always creates a draft; publish/unpublish are separate explicit actions.
Snapshots/history are private local files. Output files must not already exist.
Requires COCKPIT_WRITE_API_KEY. COCKPIT_URL selects the server.
.env.local is loaded internally; exported variables take precedence.`
const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
const textFields = ['title', 'summary', 'content', 'tags', 'links', 'date']
const mediaFields = ['cover', 'gallery']
const object = value => value && typeof value === 'object' && !Array.isArray(value)

export async function run(args, dependencies = {}) {
  const env = dependencies.env || process.env
  const request = dependencies.fetch || globalThis.fetch
  const read = dependencies.readFile || readFile
  const write = dependencies.writeFile || writeFile
  const log = dependencies.log || console.log
  const [command, first, second] = args
  if (!args.length || (args.length === 1 && ['help', '--help'].includes(command))) {
    log(usage)
    return
  }
  if (['save', 'find'].includes(command))
    throw new Error(
      'Full-project save/find is disabled. Use get and field-scoped edits; publishing is separate.',
    )
  const valid =
    (command === 'check' && args.length === 1) ||
    (['get', 'history'].includes(command) && args.length === 3 && slugPattern.test(first)) ||
    (['create', 'publish', 'unpublish'].includes(command) && args.length === 2) ||
    (['set-media', 'edit-text', 'upload'].includes(command) && args.length === 3)
  if (!valid || args.slice(1).some(value => !value || value.startsWith('--')))
    throw new Error(usage)
  const key = env.COCKPIT_WRITE_API_KEY
  if (!key?.trim()) throw new Error('Set COCKPIT_WRITE_API_KEY in your local environment.')
  let base
  try {
    base = new URL(env.COCKPIT_URL || env.NEXT_PUBLIC_COCKPIT_URL || 'http://localhost:8080')
    if (
      !['http:', 'https:'].includes(base.protocol) ||
      base.username ||
      base.password ||
      base.search ||
      base.hash
    )
      throw Error()
    base.pathname = base.pathname.replace(/\/$/, '') + '/'
  } catch {
    throw new Error('Cockpit URL must be HTTP(S), without credentials, query or fragment.')
  }
  if (command === 'upload') return uploadImage(base, key, first, second, dependencies)
  const readJson = async file => {
    try {
      return JSON.parse(await read(file, 'utf8'))
    } catch {
      throw new Error('Unable to read valid authoring JSON.')
    }
  }
  let payload = { action: command }
  if (['get', 'history'].includes(command)) payload.slug = first
  if (command === 'create') {
    const data = await readJson(first)
    const allowed = ['title', 'slug', ...textFields, ...mediaFields, 'featured']
    if (
      !object(data) ||
      typeof data.title !== 'string' ||
      !data.title.trim() ||
      !slugPattern.test(data.slug || '') ||
      Object.keys(data).some(key => !allowed.includes(key))
    )
      throw new Error('Create accepts a new project only: no _id, _state or revision.')
    payload.data = data
  }
  if (['set-media', 'edit-text', 'publish', 'unpublish'].includes(command)) {
    const snapshot = await readJson(first)
    if (
      !object(snapshot?.item) ||
      typeof snapshot.item._id !== 'string' ||
      !snapshot.item._id ||
      !/^[a-f0-9]{64}$/.test(snapshot.revision || '')
    )
      throw new Error('Invalid snapshot. Fetch a fresh snapshot with get first.')
    payload = { ...payload, id: snapshot.item._id, revision: snapshot.revision }
    if (second) {
      const patch = await readJson(second)
      const allowed = command === 'set-media' ? mediaFields : textFields
      if (
        !object(patch) ||
        !Object.keys(patch).length ||
        Object.keys(patch).some(field => !allowed.includes(field))
      )
        throw new Error(
          'Patch contains empty or disallowed fields; use only the requested field group.',
        )
      payload.patch = patch
    }
  }
  let response
  try {
    response = await request(new URL('api/portfolio/authoring', base), {
      method: 'POST',
      headers: { 'api-key': key, 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      redirect: 'error',
      signal: AbortSignal.timeout(15000),
    })
  } catch {
    throw new Error('Cockpit request failed or timed out.')
  }
  if (response.status === 409)
    throw new Error(
      'CMS content changed or slug exists. Fetch a fresh snapshot and review before retrying.',
    )
  if (!response.ok) throw new Error(`Cockpit request failed (HTTP ${response.status}).`)
  let result
  try {
    result = await response.json()
  } catch {
    throw new Error('Invalid Cockpit response; check CMS before retrying a write.')
  }
  if (['get', 'history'].includes(command)) {
    if (
      command === 'get' &&
      (!object(result?.item) ||
        typeof result.item._id !== 'string' ||
        !/^[a-f0-9]{64}$/.test(result.revision || ''))
    )
      throw new Error('Unexpected authoring snapshot response.')
    if (command === 'history' && !Array.isArray(result?.history))
      throw new Error('Unexpected history response.')
    const json = JSON.stringify(result, null, 2)
    if (json.includes(key))
      throw new Error('Unexpected credential in response; refusing to save it.')
    try {
      await write(second, json + '\n', { flag: 'wx', mode: 0o600 })
    } catch {
      throw new Error('Could not save output; choose a new file in an existing private directory.')
    }
    log('Private authoring snapshot/history saved. Do not commit it.')
  } else {
    if (command !== 'check' && !object(result?.item) && result?.ok !== true)
      throw new Error('Unexpected write response; check CMS before retrying.')
    log(
      command === 'check'
        ? 'Authoring endpoint ready. No content changed.'
        : 'Requested fields saved. Fetch a new snapshot before the next edit.',
    )
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  Promise.resolve()
    .then(() => {
      if (process.argv.length > 2 && !['--help', 'help'].includes(process.argv[2])) loadLocalEnv()
      return run(process.argv.slice(2))
    })
    .catch(error => {
      console.error(error.message)
      process.exitCode = 1
    })
}
