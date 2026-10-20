import { createHash } from 'node:crypto'
import { mkdir, readFile, readdir, stat, unlink, writeFile } from 'node:fs/promises'
import { join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('../', import.meta.url))
const output = join(root, 'dist')
const map = await readFile(join(root, 'public/assets/map.png'))
const chunkSize = 4 * 1024 * 1024
const paths = []
const parts = []
await mkdir(join(output, 'assets/map-parts'), { recursive: true })
for (let offset = 0, index = 0; offset < map.length; offset += chunkSize, index++) {
  const path = `/assets/map-parts/part-${String(index).padStart(3, '0')}`
  const part = map.subarray(offset, offset + chunkSize)
  await writeFile(join(output, path.slice(1)), part)
  paths.push(path)
  parts.push(part)
}
const digest = data => createHash('sha256').update(data).digest('hex')
if (digest(map) !== digest(Buffer.concat(parts))) throw new Error('Map reconstruction checksum mismatch')
await writeFile(join(output, 'assets/map-parts.json'), JSON.stringify(paths))
// Only remove Vite's generated copy; the original public asset stays untouched.
await unlink(join(output, 'assets/map.png'))

async function inspect(directory) {
  const files = []
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name)
    if (entry.isDirectory()) files.push(...await inspect(path))
    else files.push({ path: relative(output, path), bytes: (await stat(path)).size })
  }
  return files
}
const files = await inspect(output)
const oversized = files.filter(file => file.bytes > 25 * 1024 * 1024)
if (oversized.length) throw new Error(`Cloudflare asset limit exceeded: ${JSON.stringify(oversized)}`)
const cover = files.find(file => /^assets\/cover-[^/]+\.png$/.test(file.path))
if (!cover) throw new Error('Bundled welcome cover is missing')
const sourceCover = await readFile(join(root, 'src/modules/welcome/assets/cover.png'))
const deployedCover = await readFile(join(output, cover.path))
if (digest(sourceCover) !== digest(deployedCover)) throw new Error('Welcome cover checksum mismatch')
const report = { files: files.length, cover, coverSha256: digest(sourceCover), mapParts: paths.length, mapSha256: digest(map), oversized }
await mkdir(join(root, 'deployment-logs'), { recursive: true })
await writeFile(join(root, 'deployment-logs/asset-check.json'), `${JSON.stringify(report, null, 2)}\n`)
console.log(JSON.stringify(report, null, 2))
