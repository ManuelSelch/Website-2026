import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

test('favicon artwork is self-contained and matches the portfolio palette', async () => {
  const svg = await readFile(new URL('../app/icon.svg', import.meta.url), 'utf8')
  assert.match(svg, /viewBox="0 0 64 64"/)
  for (const color of ['#f7f9f8', '#252d2a', '#466553']) assert.ok(svg.includes(color))
  assert.doesNotMatch(svg, /<text|<image|href=/)
})

test('browser and Apple icons have the expected sizes', async () => {
  const apple = await readFile(new URL('../app/apple-icon.png', import.meta.url))
  assert.equal(apple.readUInt32BE(16), 180)
  assert.equal(apple.readUInt32BE(20), 180)
  const ico = await readFile(new URL('../app/favicon.ico', import.meta.url))
  assert.equal(ico.readUInt16LE(2), 1)
  assert.equal(ico.readUInt16LE(4), 3)
  assert.deepEqual(
    [6, 22, 38].map(offset => ico[offset]),
    [16, 32, 48],
  )
})
