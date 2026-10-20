#!/usr/bin/env node
/* Post-build checks and generated files. Runs after `astro build` (see package.json).
 *
 * Fails the build (exit 1) if:
 *   - any internal link, image, script or stylesheet points at a file that isn't in the build
 *     (this is what catches a page linking to an item the publishing gate removed);
 *   - a public build contains anything marked private, unreviewed or exploratory, or any noindex page
 *     other than the deliberate teasers and 404;
 *   - a preview or local build has a page without noindex;
 *   - a page built from exploratory content is missing the exploratory strip;
 *   - a page lacks one <h1>, a <title>, a meta description or a canonical URL;
 *   - a diagram lacks a non-empty <title> and <desc>.
 * Then writes sitemap.xml (public only), robots.txt and _headers for the target.
 *
 * Usage: HWP_TARGET=public node scripts/check-build.mjs [distDir]
 */
import { readFileSync, writeFileSync, existsSync, readdirSync, statSync, rmSync } from 'node:fs';
import { join, relative, dirname } from 'node:path';
import { loadModel, ROOT } from './load-content.mjs';
import { resolveTarget } from '../src/lib/model.mjs';

const target = resolveTarget(process.env);
const dist = join(ROOT, process.argv[2] || 'dist');
const model = loadModel(target);
const errors = [], notes = [];
const fail = (page, msg) => errors.push(`${page}: ${msg}`);

// Gated static assets: files listed under a register item's `assets` are removed from any build that item is
// blocked from, so an unlinked file can't be found at its URL. A page that still references one then fails below.
for (const item of Object.values(model.items)) {
  if (!item.assets || model.gate[item.id].allowed) continue;
  for (const a of item.assets) { const p = join(dist, a); if (existsSync(p)) { rmSync(p); notes.push(`removed gated asset ${a} (${item.id})`); } }
}

const walk = d => readdirSync(d).flatMap(n => { const p = join(d, n); return statSync(p).isDirectory() ? walk(p) : [p]; });
const files = walk(dist);
const pages = files.filter(f => f.endsWith('.html'));
const exists = urlPath => {
  const clean = decodeURIComponent(urlPath.split('#')[0].split('?')[0]);
  if (!clean || clean === '/') return existsSync(join(dist, 'index.html'));
  const p = join(dist, clean);
  return existsSync(p) && statSync(p).isFile() || existsSync(join(p, 'index.html'));
};
const exploratoryIds = Object.values(model.items).filter(i => i.content?.exploratory).map(i => i.id);
const teaserOk = ['/404.html', '/coaching-notes/', '/football-explained/', '/formations/5v5/', '/formations/7v7/'];
const indexable = [];

for (const file of pages) {
  const html = readFileSync(file, 'utf8');
  const route = '/' + relative(dist, file).replace(/index\.html$/, '').replace(/\\/g, '/');
  // References
  for (const m of html.matchAll(/\s(?:href|src)="([^"]+)"/g)) {
    const ref = m[1];
    if (/^(https?:|mailto:|tel:|data:|#|javascript:)/.test(ref)) continue;
    const abs = ref.startsWith('/') ? ref : '/' + relative(dist, join(dirname(file), ref)).replace(/\\/g, '/');
    if (!exists(abs)) fail(route, `broken reference ${ref}`);
  }
  for (const m of html.matchAll(/href="#([^"]+)"/g)) {
    if (!html.includes(`id="${m[1]}"`)) fail(route, `in-page link #${m[1]} has no target`);
  }
  // Metadata
  const h1s = (html.match(/<h1[\s>]/g) || []).length;
  if (h1s !== 1) fail(route, `expected one <h1>, found ${h1s}`);
  if (!/<title>[^<]+<\/title>/.test(html)) fail(route, 'missing <title>');
  if (!/<meta name="description" content="[^"]{20,}"/.test(html)) fail(route, 'missing meta description');
  if (!/<link rel="canonical" href="https:\/\/howweplayfootball\.com\//.test(html)) fail(route, 'missing canonical URL');
  const noindex = /<meta name="robots" content="noindex/.test(html);
  // Diagrams
  for (const m of html.matchAll(/<svg[^>]*class="hwp-pitch[^"]*"[^>]*role="(?:img|group)"[^>]*>([\s\S]*?)<\/svg>/g)) {
    const t = (m[1].match(/<title[^>]*>([^<]*)<\/title>/) || [])[1];
    const d = (m[1].match(/<desc[^>]*>([^<]*)<\/desc>/) || [])[1];
    if (!t || !t.trim() || !d || !d.trim()) { fail(route, 'diagram without a title and description'); break; }
  }
  // Target rules
  if (target === 'public') {
    const scan = html.replace(/<dl[^>]*data-hwp-legend[\s\S]*?<\/dl>/g, ''); // the About page's label key is allowed to show every chip
    if (/data-hwp-private="true"|hwp-strip--private|hwp-chip--review(?!ed)|hwp-chip--draft|hwp-strip--exploratory|hwp-chip--exploratory|nl-status|data-hwp="newsletter"|data-hwp-reviewer-only/.test(scan)) fail(route, 'public page contains private, unreviewed, exploratory or demo content');
    if (noindex && !teaserOk.includes(route)) fail(route, 'public page is noindex');
    if (!noindex) indexable.push(route);
  } else {
    if (!noindex) fail(route, `${target} build page is indexable`);
  }
  const items = ((html.match(/data-hwp-items="([^"]*)"/) || [])[1] || '').split(' ').filter(Boolean);
  if (items.some(i => exploratoryIds.includes(i)) && !html.includes('hwp-strip--exploratory')) fail(route, 'exploratory content without the exploratory strip');
}

// Generated files
const site = model.site.url;
if (target === 'public') {
  writeFileSync(join(dist, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${indexable.sort().map(r => `  <url><loc>${site}${r}</loc></url>`).join('\n')}\n</urlset>\n`);
  writeFileSync(join(dist, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${site}/sitemap.xml\n`);
  writeFileSync(join(dist, '_headers'), `/*\n  X-Content-Type-Options: nosniff\n  Referrer-Policy: strict-origin-when-cross-origin\n  Permissions-Policy: camera=(), microphone=(), geolocation=()\n\n/fonts/*\n  Cache-Control: public, max-age=31536000, immutable\n/_astro/*\n  Cache-Control: public, max-age=31536000, immutable\n`);
} else {
  writeFileSync(join(dist, 'robots.txt'), 'User-agent: *\nDisallow: /\n');
  writeFileSync(join(dist, '_headers'), `/*\n  X-Robots-Tag: noindex, nofollow\n  X-Content-Type-Options: nosniff\n  Referrer-Policy: strict-origin-when-cross-origin\n`);
}

console.log(`\nHow We Play build check · target: ${target} · ${pages.length} pages${target === 'public' ? ` · ${indexable.length} in sitemap` : ''}`);
for (const [id, g] of Object.entries(model.gate)) if (!g.allowed) notes.push(`blocked ${id}: ${g.reasons.join('; ')}`);
for (const [id, g] of Object.entries(model.gate)) for (const w of g.warnings) notes.push(`warning ${id}: ${w}`);
if (target === 'public' && notes.length) console.log(notes.map(n => '  · ' + n).join('\n'));
if (errors.length) { console.error(`\n${errors.length} problem(s):\n` + errors.map(e => '  ✕ ' + e).join('\n')); process.exit(1); }
console.log('  ✓ all checks passed');
