#!/usr/bin/env node
import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

const usage = `Usage:
  node --env-file=.env.local scripts/cockpit.mjs check
  node --env-file=.env.local scripts/cockpit.mjs save project.json
  node --env-file=.env.local scripts/cockpit.mjs save project.json --update
  node --env-file=.env.local scripts/cockpit.mjs save project.json --publish
  node --env-file=.env.local scripts/cockpit.mjs find pi-chat

Requires COCKPIT_WRITE_API_KEY. Uses COCKPIT_URL (or NEXT_PUBLIC_COCKPIT_URL),
falling back to http://localhost:8080. Node 22.18+ recommended.

save accepts one project JSON object with title and slug. Defaults to a draft
(_state: 0); --publish explicitly publishes (_state: 1).
Existing _id requires --update; combine --update --publish to keep it published.
No deletion, asset upload, or automatic upsert by slug. find checks existing entries.
check verifies read access only, not write permissions.
The CLI does not read environment files itself; Node loads them when YOU run it.`

export async function run(args, dependencies = {}) {
  const env = dependencies.env || process.env
  const request = dependencies.fetch || globalThis.fetch
  const read = dependencies.readFile || readFile
  const log = dependencies.log || console.log
  if (args.length === 0 || (args.length === 1 && ['--help', 'help'].includes(args[0]))) {
    log(usage)
    return
  }
  const [command, file, ...flags] = args
  const updating = flags.includes('--update')
  const publishing = flags.includes('--publish')
  if (
    !(
      (command === 'check' && args.length === 1) ||
      (command === 'find' && args.length === 2 && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(file)) ||
      (command === 'save' &&
        file &&
        !file.startsWith('--') &&
        flags.every(flag => ['--update', '--publish'].includes(flag)) &&
        new Set(flags).size === flags.length)
    )
  ) {
    throw new Error(usage)
  }
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
      throw new Error()
    base.pathname = base.pathname.replace(/\/$/, '') + '/'
  } catch {
    throw new Error('Cockpit URL must be HTTP(S), without credentials, query or fragment.')
  }

  let data
  if (command === 'save') {
    try {
      data = JSON.parse(await read(file, 'utf8'))
    } catch {
      throw new Error('Unable to read valid project JSON.')
    }
    if (
      !data ||
      typeof data !== 'object' ||
      Array.isArray(data) ||
      typeof data.title !== 'string' ||
      !data.title.trim() ||
      typeof data.slug !== 'string' ||
      !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(data.slug)
    ) {
      throw new Error('Project JSON must be an object with a title and lowercase hyphenated slug.')
    }
    if (Object.hasOwn(data, '_id') && (typeof data._id !== 'string' || !data._id.trim())) {
      throw new Error('Existing _id must be a nonempty string.')
    }
    if (data._id && !updating)
      throw new Error('Existing _id requires --update (saves as draft and unpublishes the item).')
    if (updating && !data._id) throw new Error('--update requires an existing _id.')
    data = { ...data, _state: publishing ? 1 : 0 }
  }
  const url = new URL(
    command !== 'save' ? 'api/content/items/projects' : 'api/content/item/projects',
    base,
  )
  if (command === 'check') url.searchParams.set('limit', '1')
  if (command === 'find') url.searchParams.set('filter', JSON.stringify({ slug: file }))
  let response
  try {
    response = await request(url, {
      method: command !== 'save' ? 'GET' : 'POST',
      headers: { 'api-key': key, 'Content-Type': 'application/json' },
      ...(data ? { body: JSON.stringify({ data }) } : {}),
      redirect: 'error',
      signal: AbortSignal.timeout(15000),
    })
  } catch {
    throw new Error('Cockpit request failed or timed out.')
  }
  if (!response.ok) throw new Error(`Cockpit request failed (HTTP ${response.status}).`)
  let result
  try {
    result = await response.json()
  } catch {
    throw new Error('Cockpit returned invalid JSON; check CMS before retrying a save.')
  }
  if (command !== 'save') {
    if (!Array.isArray(result) && !Array.isArray(result?.entries))
      throw new Error('Cockpit returned an unexpected projects response.')
    if (command === 'check')
      log('Projects read succeeded. Write permissions have not been tested. No content changed.')
    else {
      const entries = Array.isArray(result) ? result : result.entries
      const matches = entries
        .filter(item => item.slug === file)
        .map(item => ({ _id: item._id, slug: item.slug, _state: item._state }))
      log(JSON.stringify(matches).replaceAll(key, '[redacted]'))
    }
  } else {
    if (typeof result?._id !== 'string')
      throw new Error('Unexpected save response; check CMS before retrying.')
    // Never print API response bodies or user-controlled content, which may contain secrets.
    const id = result._id.replaceAll(key, '[redacted]').replace(/[\r\n\x1b]/g, '')
    log(`Project saved as ${publishing ? 'published' : 'draft'}. Item ID: ${id}`)
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  run(process.argv.slice(2)).catch(error => {
    console.error(error.message)
    process.exitCode = 1
  })
}
