import { access, readFile, writeFile } from 'node:fs/promises'
import { basename, extname } from 'node:path'

export async function uploadImage(base, key, file, output, dependencies = {}) {
  const read = dependencies.readFile || readFile
  const write = dependencies.writeFile || writeFile
  const exists = dependencies.access || access
  const request = dependencies.fetch || fetch
  const log = dependencies.log || console.log
  const mime = {
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.webp': 'image/webp',
  }[extname(file).toLowerCase()]
  if (!mime) throw new Error('Upload accepts PNG, JPEG or WebP files only.')
  try {
    await exists(output)
    throw new Error('Output already exists; choose a new asset JSON filename.')
  } catch (error) {
    if (error.code !== 'ENOENT') throw new Error('Output already exists or cannot be accessed.')
  }
  let bytes
  try {
    bytes = await read(file)
  } catch {
    throw new Error('Unable to read image file.')
  }
  if (!bytes.length || bytes.length > 10 * 1024 * 1024)
    throw new Error('Image must be between 1 byte and 10 MiB.')
  const form = new FormData()
  form.append('file', new Blob([bytes], { type: mime }), basename(file))
  let response
  try {
    response = await request(new URL('api/portfolio/upload', base), {
      method: 'POST',
      headers: { 'api-key': key },
      body: form,
      redirect: 'error',
      signal: AbortSignal.timeout(30000),
    })
  } catch {
    throw new Error('Cockpit upload failed or timed out; check Assets before retrying.')
  }
  if (!response.ok) {
    let detail = ''
    try {
      const message = (await response.json()).error
      if (
        typeof message === 'string' &&
        message.length <= 120 &&
        /^[a-zA-Z0-9 ,.;'-]+$/.test(message) &&
        !message.includes(key)
      )
        detail = ` ${message}`
    } catch {}
    throw new Error(`Cockpit upload failed (HTTP ${response.status}).${detail}`)
  }
  let asset
  try {
    asset = (await response.json()).asset
  } catch {
    throw new Error('Invalid upload response; check Assets before retrying.')
  }
  if (!asset || typeof asset._id !== 'string' || typeof asset.path !== 'string' || !asset.path) {
    throw new Error('Upload did not return a native asset; check Assets before retrying.')
  }
  // Cockpit's native asset objects have title/altText but may omit name.
  asset.name = typeof asset.name === 'string' && asset.name ? asset.name : basename(file)
  const json = JSON.stringify(asset, null, 2)
  if (json.includes(key))
    throw new Error('Unexpected credential in upload response; refusing to save it.')
  try {
    await write(output, json + '\n', { flag: 'wx' })
  } catch {
    throw new Error('Asset uploaded but JSON could not be saved; check Assets before retrying.')
  }
  log('Uploaded into projects; native asset reference saved to your output JSON.')
}
