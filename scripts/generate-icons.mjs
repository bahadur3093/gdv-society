import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';

const SIZES = [
  { name: 'icon-192.png', size: 192, maskable: false },
  { name: 'icon-384.png', size: 384, maskable: false },
  { name: 'icon-512.png', size: 512, maskable: false },
  { name: 'icon-maskable-192.png', size: 192, maskable: true },
  { name: 'icon-maskable-512.png', size: 512, maskable: true },
  { name: 'apple-touch-icon.png', size: 180, maskable: false },
  { name: 'favicon-32.png', size: 32, maskable: false },
];

function makeSvg(size, maskable) {
  // Maskable icons need ~20% safe area padding
  const padding = maskable ? size * 0.1 : size * 0.05;
  const contentSize = size - padding * 2;
  const fontSize = contentSize * 0.55;
  const radius = maskable ? size * 0.16 : size * 0.22;

  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
      <defs>
        <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#4F8AFF"/>
          <stop offset="50%" stop-color="#8B5CF6"/>
          <stop offset="100%" stop-color="#EC4899"/>
        </linearGradient>
      </defs>
      <rect width="${size}" height="${size}" rx="${maskable ? 0 : radius}" fill="${maskable ? '#0A0A0C' : 'url(#g)'}"/>
      ${maskable
        ? `<rect x="${padding}" y="${padding}" width="${contentSize}" height="${contentSize}" rx="${contentSize * 0.18}" fill="url(#g)"/>`
        : ''}
      <text x="${size / 2}" y="${size / 2}" font-family="Inter, system-ui, sans-serif" font-size="${fontSize}" font-weight="800" fill="white" text-anchor="middle" dominant-baseline="central" letter-spacing="-0.04em">G</text>
    </svg>
  `;
}

async function generate() {
  await mkdir('./public/icons', { recursive: true });
  
  for (const { name, size, maskable } of SIZES) {
    const svg = makeSvg(size, maskable);
    await sharp(Buffer.from(svg))
      .png()
      .toFile(`./public/icons/${name}`);
    console.log(`✓ ${name} (${size}×${size}${maskable ? ' maskable' : ''})`);
  }
  
  console.log(`\n🎨 Generated ${SIZES.length} icons in public/icons/`);
}

generate().catch(console.error);