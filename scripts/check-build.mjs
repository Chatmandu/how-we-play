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
import { sitemapLastmod, issueFeedXml, escapeXml } from '../src/lib/seo.mjs';

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

// Generate the public issue feed before checking references, because the shared
// layout advertises it on every indexable page. Preview builds never expose it.
if (target === 'public') writeFileSync(join(dist, 'feed.xml'), issueFeedXml(model));

const walk = d => readdirSync(d).flatMap(n => { const p = join(d, n); return statSync(p).isDirectory() ? walk(p) : [p]; });
const files = walk(dist);
const pages = files.filter(f => f.endsWith('.html'));
const exists = urlPath => {
  const clean = decodeURIComponent(urlPath.split('#')[0].split('?')[0]);
  if (!clean || clean === '/') return existsSync(join(dist, 'index.html'));
  const p = join(dist, clean);
  return existsSync(p) && statSync(p).isFile() || existsSync(join(p, 'index.html'));
};
const exploratoryIds = Object.values(model.items).filter(i => i.content?.exploratory && !i.content?.publicApproval).map(i => i.id);
const teaserOk = ['/404.html', '/coaching-notes/', '/formations/5v5/', '/formations/7v7/'];
const indexable = [];
const seenTitles = new Map();

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
  // Every page has a real, crawlable sharing image. Guide pages must have
  // their own source-derived PNG, not the generic fallback image.
  const og = (html.match(/<meta property="og:image" content="([^"]+)"/) || [])[1] || '';
  const tw = (html.match(/<meta name="twitter:image" content="([^"]+)"/) || [])[1] || '';
  const ogAlt = (html.match(/<meta property="og:image:alt" content="([^"]+)"/) || [])[1] || '';
  if (!og.startsWith(model.site.url + '/og/') || !og.endsWith('.png')) fail(route, 'missing absolute PNG Open Graph image');
  if (tw !== og) fail(route, 'Twitter sharing image differs from Open Graph image');
  if (!ogAlt.trim()) fail(route, 'missing readable Open Graph image alternative text');
  if (og.startsWith(model.site.url + '/')) {
    const image = new URL(og).pathname;
    if (!exists(image)) fail(route, 'sharing image missing from built files: ' + image);
    else {
      const bytes = readFileSync(join(dist, image));
      if (bytes.subarray(0, 8).toString('hex') !== '89504e470d0a1a0a' || bytes.readUInt32BE(16) !== 1200 || bytes.readUInt32BE(20) !== 630) {
        fail(route, 'sharing image is not an actual 1200×630 PNG');
      }
    }
  }
  // Rendered, static JSON-LD must be valid and describe the page it appears on.
  const ld = [...html.matchAll(/<script\b[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)].map(match => {
    try { return JSON.parse(match[1]); }
    catch { fail(route, 'malformed JSON-LD block'); return null; }
  }).filter(Boolean);
  const pageType = (html.match(/data-hwp-type="([^"]+)"/) || [])[1] || '';
  if (target === 'public' && ['formation_issue', 'lesson', 'position'].includes(pageType)) {
    const article = ld.find(o => o['@type'] === 'Article');
    const webpage = ld.find(o => o['@type'] === 'WebPage');
    if (!article || !webpage) fail(route, 'missing Article / WebPage schema for published coaching guide');
    else {
      if (article.url !== model.site.url + route || article.mainEntityOfPage?.['@id'] !== article.url) fail(route, 'Article schema canonical URL mismatch');
      if (!article.datePublished || !/^\d{4}-\d{2}-\d{2}$/.test(article.datePublished)) fail(route, 'Article missing real publication date');
      if (!article.author?.name || !article.publisher?.name || article.isAccessibleForFree !== true) fail(route, 'Article missing grounded author, publisher or free-access description');
      if (webpage['@id'] !== article.url || webpage.mainEntity?.['@id'] !== article['@id']) fail(route, 'WebPage to Article relation mismatch');
      if (!article.isPartOf) fail(route, 'Article missing parent issue or collection relationship');
      const articleImage = article.image?.[0]?.url;
      if (articleImage !== og) fail(route, 'Article image JSON-LD does not match page-specific social image');
      if (webpage.primaryImageOfPage?.url !== og) fail(route, 'WebPage primaryImageOfPage does not match the page image');
      if (og.endsWith('/og/default.png')) fail(route, 'published coaching guide is using the generic image');
    }
  }
  // The only public video explainer belongs to Issue 01; it should be a
  // first-party poster until a visitor explicitly chooses to load YouTube.
  if (route === '/formations/9v9/3-1-3-1/') {
    if (!html.includes('id="watch"') || !html.includes('data-youtube-id="KEKPal0Upd4"')) {
      fail(route, 'missing original full-length YouTube explainer');
    }
    if (!html.includes('data-youtube-play') || !html.includes('href="/privacy/#video"')) {
      fail(route, 'video must be opt-in and link to its privacy explanation');
    }
    if (/<iframe\b/i.test(html) || /src="https:\/\/www\.youtube-nocookie\.com\//.test(html)) {
      fail(route, 'YouTube iframe must not load before a visitor activates the poster');
    }
  }
  if (route === '/privacy/' && !html.includes('id="video"')) {
    fail(route, 'privacy notice must explain optional YouTube embeds');
  }
  if (['/formations/9v9/3-3-2/', '/formations/9v9/2-2-3-1/'].includes(route) && html.includes('data-youtube-embed')) {
    fail(route, 'video must not appear on issues without a published film');
  }
  const noindex = /<meta name="robots" content="noindex/.test(html);
  // Diagrams
  for (const m of html.matchAll(/<svg[^>]*class="hwp-pitch[^"]*"[^>]*role="(?:img|group)"[^>]*>([\s\S]*?)<\/svg>/g)) {
    const t = (m[1].match(/<title[^>]*>([^<]*)<\/title>/) || [])[1];
    const d = (m[1].match(/<desc[^>]*>([^<]*)<\/desc>/) || [])[1];
    if (!t || !t.trim() || !d || !d.trim()) { fail(route, 'diagram without a title and description'); break; }
  }
  // SVG branding is baked into the actual diagrams, so screenshotting or
  // downloading the image retains a small source attribution.
  const diagramCount = (html.match(/<svg[^>]*class="hwp-pitch[^"]*"[^>]*data-view="/g) || []).length;
  const watermarkCount = (html.match(/data-hwp-watermark="howweplayfootball\.com"/g) || []).length;
  if (diagramCount && watermarkCount < diagramCount) fail(route, 'one or more pitch SVGs lost embedded How We Play branding');
  if (target === 'public' && route === '/') {
    if (!html.includes('Featured formation') || !html.includes('The 3-1-3-1')) fail(route, 'homepage must feature 3-1-3-1');
    if (!html.includes('Follow How We Play')) fail(route, 'homepage missing dedicated social discovery section');
  }
  if (target === 'public') {
    for (const profile of Object.values(model.site.social || {})) {
      if (!profile.url || !html.includes(profile.url)) fail(route, 'missing official social channel link: ' + (profile.handle || 'unknown'));
    }
    if (route.startsWith('/formations/') && route.match(/^\/formations\/(?:7v7|9v9)\/[^/]+\//) && !/meta name="robots" content="noindex/.test(html) && og.endsWith('/og/default.png')) {
      fail(route, 'formation page must not share the default placeholder image');
    }
  }
  // Target rules
  if (target === 'public') {
    const scan = html.replace(/<dl[^>]*data-hwp-legend[\s\S]*?<\/dl>/g, ''); // the About page's label key is allowed to show every chip
    if (/data-hwp-private="true"|hwp-strip--private|hwp-chip--review(?!ed)|hwp-chip--draft|hwp-strip--exploratory|hwp-chip--exploratory|nl-status|data-hwp="newsletter"|data-hwp-reviewer-only/.test(scan)) fail(route, 'public page contains private, unreviewed, exploratory or demo content');
    if (noindex && !teaserOk.includes(route)) fail(route, 'public page is noindex');
    if (!noindex) {
      indexable.push(route);
      const titleText = (html.match(/<title>([^<]+)<\/title>/) || [])[1];
      if (titleText) {
        if (seenTitles.has(titleText)) fail(route, `duplicate page title (same as ${seenTitles.get(titleText)})`);
        else seenTitles.set(titleText, route);
      }
    }
  } else {
    if (!noindex) fail(route, `${target} build page is indexable`);
  }
  const items = ((html.match(/data-hwp-items="([^"]*)"/) || [])[1] || '').split(' ').filter(Boolean);
  if (target !== 'public' && items.some(i => exploratoryIds.includes(i)) && !html.includes('hwp-strip--exploratory')) fail(route, 'exploratory content without the exploratory strip');
}

// Generated files
const site = model.site.url;
if (target === 'public') {
  writeFileSync(join(dist, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${indexable.sort().map(r => {
    const modified = sitemapLastmod(r, model);
    return `  <url><loc>${escapeXml(site + r)}</loc>${modified ? `<lastmod>${modified}</lastmod>` : ''}</url>`;
  }).join('\n')}\n</urlset>\n`);
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
