import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

const root = new URL('../content/projects/', import.meta.url)
const json = async file => JSON.parse(await readFile(new URL(file, root), 'utf8'))

test('imported legacy media retains native receipts and existing draft identities', async () => {
  const sources = await json('image-sources.json')
  let count = 0
  for (const [slug, images] of Object.entries(sources)) {
    const project = await json(`${slug}.json`)
    const saved = await json(`assets/${slug}/save-receipt.json`)
    assert.equal(saved.state, 0)
    assert.equal(saved.id, project._id)
    assert.equal(saved.galleryCount, images.length)
    assert.equal(project.gallery.length, images.length)
    assert.ok(project.gallery.some(asset => asset._id === project.cover._id))
    for (const [index, source] of images.entries()) {
      const receipt = await json(`assets/${slug}/${String(index + 1).padStart(2, '0')}.asset.json`)
      const asset = project.gallery[index]
      for (const field of ['_id', 'path', 'folder']) {
        assert.ok(receipt[field])
        assert.equal(asset[field], receipt[field])
      }
      assert.equal(asset.alt, source.alt)
      assert.ok(asset.path.startsWith('/'))
      count++
    }
  }
  assert.equal(count, 29)
})
