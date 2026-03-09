/**
 * Genera todos los assets de ícono y OG image para renglón.
 * Ejecutar con: node scripts/generate-icons.mjs
 */
import sharp from 'sharp';
import { writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PUBLIC = resolve(__dirname, '../public');

const BORRAVINO = '#64313E';
const PAPEL = '#F5F0E8';
const TINTA_SUAVE = '#5C5147';

// ─── SVG helpers ────────────────────────────────────────────────────────────

function iconSvg(size) {
  const radius = Math.round(size * 0.18);
  const fontSize = Math.round(size * 0.72);
  const y = Math.round(size * 0.82);
  return `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" fill="${PAPEL}" rx="${radius}"/>
  <text x="${size / 2}" y="${y}" font-family="Georgia, serif" font-style="italic"
    font-size="${fontSize}" fill="${BORRAVINO}" text-anchor="middle" font-weight="400">r</text>
</svg>`;
}

function iconSvgLarge(size) {
  const radius = Math.round(size * 0.18);
  const fontSize = Math.round(size * 0.64);
  // centrar la "r" usando dominant-baseline="central"
  const textY = Math.round(size * 0.5);
  // línea justo debajo de la baseline (baseline ≈ centro + 22% del font-size)
  const lineY = Math.round(textY + fontSize * 0.22);
  const lineX1 = Math.round(size * 0.2);
  const lineX2 = Math.round(size * 0.8);
  const strokeWidth = Math.max(1, Math.round(size / 128));
  return `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" fill="${PAPEL}" rx="${radius}"/>
  <text x="${size / 2}" y="${textY}" font-family="Georgia, serif" font-style="italic"
    font-size="${fontSize}" fill="${BORRAVINO}" text-anchor="middle"
    dominant-baseline="central" font-weight="400">r</text>
  <line x1="${lineX1}" y1="${lineY}" x2="${lineX2}" y2="${lineY}"
    stroke="${BORRAVINO}" stroke-width="${strokeWidth}" opacity="0.3"/>
</svg>`;
}

function ogImageSvg() {
  const W = 1200, H = 630;
  // puntos de fondo sutiles
  const dots = Array.from({ length: 40 }, (_, i) =>
    Array.from({ length: 22 }, (_, j) =>
      `<circle cx="${60 + i * 28}" cy="${16 + j * 28}" r="1" fill="#9e8e7e" opacity="0.18"/>`
    ).join('')
  ).join('');

  // renglones horizontales (zona central)
  const lines = Array.from({ length: 10 }, (_, i) =>
    `<line x1="80" y1="${220 + i * 40}" x2="1120" y2="${220 + i * 40}" stroke="#D6CFBF" stroke-width="1" opacity="0.6"/>`
  ).join('');

  return `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
  <!-- fondo -->
  <rect width="${W}" height="${H}" fill="${PAPEL}"/>
  <!-- puntos -->
  ${dots}
  <!-- renglones -->
  ${lines}
  <!-- lomo borravino izquierdo -->
  <rect x="0" y="0" width="20" height="${H}" fill="${BORRAVINO}"/>
  <!-- costuras del lomo -->
  ${[80, 200, 320, 440].map(y => `<circle cx="10" cy="${y}" r="3" fill="${PAPEL}" opacity="0.5"/>`).join('')}
  <!-- logo "renglón" -->
  <text x="${W / 2 + 10}" y="330" font-family="Georgia, serif" font-style="italic"
    font-size="90" fill="${BORRAVINO}" text-anchor="middle" font-weight="400">renglón</text>
  <!-- tagline -->
  <text x="${W / 2 + 10}" y="395" font-family="Georgia, serif" font-style="italic"
    font-size="26" fill="${TINTA_SUAVE}" text-anchor="middle">El hábito de escribir, un renglón a la vez.</text>
</svg>`;
}

// ─── Helpers ────────────────────────────────────────────────────────────────

async function toPng(svg) {
  return sharp(Buffer.from(svg)).png().toBuffer();
}

/** Crea un .ico con un único frame PNG embebido */
function makeFavico(pngBuffer) {
  const size = 32;
  const pngSize = pngBuffer.length;
  const headerSize = 6;
  const dirEntrySize = 16;
  const dataOffset = headerSize + dirEntrySize;

  const ico = Buffer.alloc(dataOffset + pngSize);
  // ICO header
  ico.writeUInt16LE(0, 0);        // reserved
  ico.writeUInt16LE(1, 2);        // type: ICO
  ico.writeUInt16LE(1, 4);        // count: 1 image
  // Directory entry
  ico.writeUInt8(size, 6);        // width
  ico.writeUInt8(size, 7);        // height
  ico.writeUInt8(0, 8);           // color count
  ico.writeUInt8(0, 9);           // reserved
  ico.writeUInt16LE(1, 10);       // planes
  ico.writeUInt16LE(32, 12);      // bit count
  ico.writeUInt32LE(pngSize, 14); // data size
  ico.writeUInt32LE(dataOffset, 18); // data offset
  // PNG data
  pngBuffer.copy(ico, dataOffset);
  return ico;
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function run() {
  console.log('Generando iconos...');

  // favicon 32x32
  const png32 = await toPng(iconSvg(32));
  writeFileSync(`${PUBLIC}/favicon-32x32.png`, png32);
  writeFileSync(`${PUBLIC}/favicon.ico`, makeFavico(png32));
  console.log('  ✓ favicon.ico + favicon-32x32.png');

  // favicon 16x16
  const png16 = await toPng(iconSvg(16));
  writeFileSync(`${PUBLIC}/favicon-16x16.png`, png16);
  console.log('  ✓ favicon-16x16.png');

  // apple-touch-icon 180x180
  const png180 = await toPng(iconSvgLarge(180));
  writeFileSync(`${PUBLIC}/apple-touch-icon.png`, png180);
  console.log('  ✓ apple-touch-icon.png');

  // PWA 192x192
  const png192 = await toPng(iconSvgLarge(192));
  writeFileSync(`${PUBLIC}/icon-192x192.png`, png192);
  console.log('  ✓ icon-192x192.png');

  // PWA 512x512
  const png512 = await toPng(iconSvgLarge(512));
  writeFileSync(`${PUBLIC}/icon-512x512.png`, png512);
  console.log('  ✓ icon-512x512.png');

  // OG image 1200x630
  const ogPng = await toPng(ogImageSvg());
  writeFileSync(`${PUBLIC}/og-image.png`, ogPng);
  console.log('  ✓ og-image.png');

  console.log('\nListo. Todos los assets en /public.');
}

run().catch((err) => { console.error(err); process.exit(1); });
