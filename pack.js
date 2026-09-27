// pack.js — Build the production site and zip dist/ into release/vega-evx-site.zip.
// Usage: npm run package   (runs `vite build` first, then this script)
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import archiver from 'archiver'; // devDependency

const ROOT = process.cwd();
const DIST = path.join(ROOT, 'dist');
const RELEASE_DIR = path.join(ROOT, 'release');
const ZIP_PATH = path.join(RELEASE_DIR, 'vega-evx-site.zip');

// 1) Ensure a fresh production build
console.log('▶ Building production bundle (vite build)…');
execSync('npm run build', { stdio: 'inherit' });

if (!fs.existsSync(DIST)) {
  console.error('✖ dist/ not found after build. Aborting.');
  process.exit(1);
}

// 2) Zip the *contents* of dist/ (so unzipping yields index.html at top level)
fs.mkdirSync(RELEASE_DIR, { recursive: true });
const output = fs.createWriteStream(ZIP_PATH);
const archive = archiver('zip', { zlib: { level: 9 } }); // max compression

output.on('close', () => {
  const mb = (archive.pointer() / (1024 * 1024)).toFixed(2);
  console.log(`✔ Wrote ${ZIP_PATH} (${mb} MB)`);
});
archive.on('warning', (err) => { if (err.code !== 'ENOENT') throw err; });
archive.on('error', (err) => { throw err; });

archive.pipe(output);
archive.directory(DIST, false); // false = place contents at zip root
await archive.finalize();
