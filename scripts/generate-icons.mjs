// Run after editing app/icon.svg: node scripts/generate-icons.mjs
// Uses the Sharp installation provided by Next.js.
import sharp from 'sharp'
import { readFile, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'

const source = await readFile(new URL('../app/icon.svg', import.meta.url))
await sharp(source)
  .resize(180, 180)
  .png()
  .toFile(fileURLToPath(new URL('../app/apple-icon.png', import.meta.url)))
const sizes = [16, 32, 48]
const images = await Promise.all(
  sizes.map(size => sharp(source).resize(size, size).png().toBuffer()),
)
const header = Buffer.alloc(6 + images.length * 16)
header.writeUInt16LE(1, 2)
header.writeUInt16LE(images.length, 4)
let offset = header.length
images.forEach((image, index) => {
  const entry = 6 + index * 16
  header[entry] = header[entry + 1] = sizes[index]
  header.writeUInt16LE(1, entry + 4)
  header.writeUInt16LE(32, entry + 6)
  header.writeUInt32LE(image.length, entry + 8)
  header.writeUInt32LE(offset, entry + 12)
  offset += image.length
})
await writeFile(new URL('../app/favicon.ico', import.meta.url), Buffer.concat([header, ...images]))
console.log('Generated 16/32/48px favicon and 180px Apple touch icon.')
