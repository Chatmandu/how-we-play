#!/usr/bin/env node
/* Branded, accessible search/social image previews generated from reviewed
 * formation data at build-time. Never requires an external image service. */
import { readFileSync, writeFileSync, mkdirSync, rmSync } from 'node:fs';
import { dirname, join } from 'node:path';
import sharp from 'sharp';
import { ROOT, loadModel } from '../load-content.mjs';
import { socialImageSpecs } from '../../src/lib/social-images.mjs';
import { publishedIssues } from '../../src/lib/editorial.mjs';
import { renderPitch, themeFromTokens } from '../../design-system/diagrams/renderer.mjs';
import { resolve } from '../../design-system/tokens/build-lib.mjs';

const tokens = JSON.parse(readFileSync(join(ROOT, 'design-system/tokens/tokens.json'), 'utf8'));
const colors = themeFromTokens(resolve(tokens), 'blue');
const W = 1200, H = 630;
const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
const splitWords = (value, max) => {
  const words = String(value || '').split(/\s+/);
  const rows = []; let line = '';
  for (const word of words) {
    if (line && (line + ' ' + word).length > max) { rows.push(line); line = word; }
    else line += (line ? ' ' : '') + word;
  }
  if (line) rows.push(line);
  return rows;
};
function preview(spec) {
  const titleLines = splitWords(spec.title.toUpperCase(), 17).slice(0, 3);
  const titleSize = titleLines.length === 1 ? 72 : titleLines.length === 2 ? 65 : 55;
  const step = titleSize * 1.09;
  const deckLines = splitWords(spec.deck, 36).slice(0, 3);
  const deckY = Math.min(483, 220 + titleLines.length * step + 42);
  // A drawing from the reviewed source is baked into the right-hand blue panel.
  // renderPitch itself also bakes the brand mark into screenshots and exports.
  const diagram = spec.frame
    ? renderPitch(spec.frame, { theme: 'blue', mode: 'inline', colors, title: spec.title, desc: spec.frame.altSummary || spec.deck })
      .replace('<svg ', '<svg x="800" y="26" width="358" height="578" ')
    : '<g stroke="#9DAEF5" stroke-width="4" fill="none" opacity=".7"><rect x="815" y="65" width="330" height="490"/><line x1="815" y1="310" x2="1145" y2="310"/><circle cx="980" cy="310" r="43"/></g>';
  const wordmark = `
    <g transform="translate(53 37) scale(.9)" fill="none">
      <g stroke="#2747E8" stroke-width="4.4" stroke-linecap="round"><path d="M20 8L7 29M20 8L33 29M7 29H33"/></g>
      <circle cx="20" cy="8" r="7.4" fill="#2747E8"/><circle cx="7" cy="29" r="7.4" fill="#2747E8"/><circle cx="33" cy="29" r="7.4" fill="#2747E8"/>
    </g>
    <text x="98" y="59" font-family="Big Shoulders Display, DejaVu Sans, Arial, sans-serif" font-size="29" font-weight="900" fill="#0E1A24">HOW WE PLAY</text>
    <text x="98" y="74" font-family="Big Shoulders Display, DejaVu Sans, Arial, sans-serif" font-size="13" font-weight="800" letter-spacing="5.5" fill="#2747E8">FOOTBALL</text>`;
  const titles = titleLines.map((line, i) => `<text x="57" y="${Math.round(213 + i * step)}" font-family="Big Shoulders Display, DejaVu Sans, Arial, sans-serif" font-size="${titleSize}" font-weight="900" letter-spacing="-1.8" fill="#0E1A24">${esc(line)}</text>`).join('');
  const body = deckLines.map((line, i) => `<text x="61" y="${Math.round(deckY + i * 31)}" font-family="Schibsted Grotesk, DejaVu Sans, Arial, sans-serif" font-size="20" font-weight="500" fill="#0E1A24">${esc(line)}</text>`).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
    <rect width="1200" height="630" fill="#F2EDE2"/>
    <rect x="754" y="0" width="446" height="630" fill="#2747E8"/>
    ${diagram}
    ${wordmark}
    <text x="60" y="146" font-family="Schibsted Grotesk, DejaVu Sans, Arial, sans-serif" font-size="19" font-weight="700" letter-spacing="1.3" fill="#2747E8">${esc(spec.eyebrow.toUpperCase())}</text>
    ${titles}
    ${body}
    <rect x="0" y="586" width="754" height="44" fill="#0E1A24"/>
    <text x="60" y="616" font-family="Big Shoulders Display, DejaVu Sans, Arial, sans-serif" font-size="21" font-weight="800" fill="#F2EDE2">HOWWEPLAYFOOTBALL.COM</text>
    <text x="685" y="615" font-family="Schibsted Grotesk, DejaVu Sans, Arial, sans-serif" font-size="14" font-weight="700" text-anchor="end" fill="#F2EDE2">© HOW WE PLAY FOOTBALL</text>
  </svg>`;
}

const out = join(ROOT, 'public/og/pages');
const formatOut = join(ROOT, 'public/og/formats');
const formationOut = join(ROOT, 'public/og/formations');
const coachingOut = join(ROOT, 'public/og/coaching');
const diagramsOut = join(ROOT, 'public/diagrams/formations');
for (const dir of [out,formatOut,formationOut,coachingOut,diagramsOut]) rmSync(dir, { recursive: true, force: true });
const publicModel = loadModel('public');
const specs = socialImageSpecs(publicModel);
for (const spec of specs) {
  if (!spec.image.startsWith('/og/') || !spec.image.endsWith('.png')) throw new Error('Invalid image route ' + spec.image);
  const file = join(ROOT, 'public', spec.image.slice(1));
  mkdirSync(dirname(file), { recursive: true });
  await sharp(Buffer.from(preview(spec))).png({compressionLevel: 9}).toFile(file);
}
console.log('Generated ' + specs.length + ' branded, page-specific 1200×630 PNG previews from public coaching and formation guides');

// The reviewed starting shapes also need addressable image files for Google Images,
// image sitemaps and coaches who want to download a clear diagram. Both formats
// come from the exact same approved drawing used inside the formation guide.
let shapes = 0;
for (const f of publishedIssues(publicModel)) {
  if (!f.issue?.chapters || !f.shape) continue;
  const name = `${f.format}-${f.slug}-starting-shape`;
  const file = join(diagramsOut, name);
  const svg = renderPitch(f.shape, {
    theme: 'blue', mode: 'inline', colors,
    title: `${f.name} starting formation for ${f.format} football and youth soccer`,
    desc: f.shape.altSummary || f.shape.title || `${f.format} ${f.name} starting shape`
  });
  mkdirSync(diagramsOut, { recursive: true });
  writeFileSync(file + '.svg', svg, 'utf8');
  // The SVG uses a compact 108-unit coordinate system. Rasterise at print-friendly
  // density rather than Sharp's default 108-pixel interpretation of the viewBox.
  const raster = sharp(Buffer.from(svg), { density: 600 });
  const { width } = await raster.metadata();
  if (width < 800) throw new Error('Formation image too small for the web: ' + name + ' (' + width + 'px)');
  await raster.webp({ quality: 88, effort: 6 }).toFile(file + '.webp');
  shapes++;
}
console.log('Generated ' + shapes + ' reviewed starting shapes as branded SVG + WebP images');
