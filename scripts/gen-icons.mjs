import sharp from 'sharp';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const src = path.join(__dirname, 'source-icon.svg');
const publicDir = path.join(__dirname, '..', 'public');

const targets = [
  { file: 'pwa-192x192.png', size: 192 },
  { file: 'pwa-512x512.png', size: 512 },
  { file: 'apple-touch-icon.png', size: 180 },
];

for (const t of targets) {
  await sharp(src, { density: 384 })
    .resize(t.size, t.size)
    .png()
    .toFile(path.join(publicDir, t.file));
  console.log('wrote', t.file);
}
