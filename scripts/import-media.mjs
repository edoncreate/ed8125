#!/usr/bin/env node
// Copies the media the site uses from the FTP copy of the old WordPress install
// into public/media/, renamed to lowercase ASCII paths. Only files listed in
// scripts/media-manifest.json are copied (images, mp3s, the Bebas Neue font) —
// nothing executable leaves the compromised install.
//
// Usage: npm run import-media   (ED8125_FTP overrides the FTP copy location)
import { copyFileSync, mkdirSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const ftp = process.env.ED8125_FTP ?? '~/Documents/EDONCREATE/ftp/ed8125'
const uploads = join(ftp, 'wp-content', 'uploads')
const manifest = JSON.parse(readFileSync(join(root, 'scripts', 'media-manifest.json'), 'utf8'))

/** Resolve `rel` under uploads, matching each file name NFC/NFD-insensitively. */
function resolveSource(rel) {
  const parts = rel.split('/')
  const name = parts.pop().normalize('NFC')
  const dir = join(uploads, ...parts)
  const hit = readdirSync(dir).find((f) => f.normalize('NFC') === name)
  return hit ? join(dir, hit) : null
}

const missing = []
let bytes = 0
for (const { src, dest } of manifest) {
  if (!/^[a-z0-9/._-]+$/.test(dest)) throw new Error(`dest must be lowercase ascii: ${dest}`)
  const from = resolveSource(src)
  if (!from) {
    missing.push(src)
    continue
  }
  const to = join(root, 'public', 'media', dest)
  mkdirSync(dirname(to), { recursive: true })
  copyFileSync(from, to)
  bytes += statSync(to).size
}

if (missing.length) {
  console.error(`Missing ${missing.length} source file(s):\n  ${missing.join('\n  ')}`)
  process.exit(1)
}
console.log(`Copied ${manifest.length} files, ${(bytes / 1024 / 1024).toFixed(1)} MB → public/media/`)
