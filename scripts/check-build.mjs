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
import { socialImageForRoute, DEFAULT_SOCIAL_IMAGE } from '../src/lib/social-images.mjs';
import { publishedIssues } from '../src/lib/editorial.mjs';

const target = resolveTarget(process.env);
const dist = join(ROOT, process.argv[2] || 'dist');
const model = loadModel(target);
const published = publishedIssues(model);
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
  // All full formation guides share one benefit-led cover, with working and
  // context-aware entry links. Draft-only shells keep their metadata but no CTA.
  if (/^\/formations\/(5v5|7v7|9v9)\/[^/]+\/$/.test(route)) {
    if (!html.includes('issue-cover--refined') || !html.includes('issue-cover__promise') || !html.includes('issue-cover__meta')) {
      fail(route, 'formation guide is missing its refreshed editorial cover');
    }
    if (html.includes('id="shape"')) {
      if (!html.includes('issue-cover__actions')) fail(route, 'full guide is missing cover actions');
      if (html.includes('id="watch"')) {
        if (!html.includes('href="#watch"') || !html.includes('Watch the full explainer')) {
          fail(route, 'guide with a film is missing its watch CTA');
        }
      } else if (!html.includes('Explore the starting shape') || html.includes('Watch the full explainer')) {
        fail(route, 'guide without a film must lead into its starting shape');
      }
      if (!html.includes('href="#principles"') && !html.includes('href="#shape"')) {
        fail(route, 'formation guide is missing its secondary reading action');
      }
    }
  }
  // Metadata
  const h1s = (html.match(/<h1[\s>]/g) || []).length;
  if (h1s !== 1) fail(route, `expected one <h1>, found ${h1s}`);
  if (!/<title>[^<]+<\/title>/.test(html)) fail(route, 'missing <title>');
  if (!/<meta name="description" content="[^"]{20,}"/.test(html)) fail(route, 'missing meta description');
  if (!/<link rel="canonical" href="https:\/\/howweplayfootball\.com\//.test(html)) fail(route, 'missing canonical URL');
  if (target === 'public' && route === '/coaching-in-the-usa/') {
    if (!/<html lang="en-US">/.test(html) || !/<meta property="og:locale" content="en_US">/.test(html)) {
      fail(route, 'US guide must have US English HTML and social locale metadata');
    }
    if (!/<title>[^<]*7v7 &amp; 9v9[^<]*<\/title>/.test(html) || !/name="description" content="[^"]*rec soccer/.test(html)) {
      fail(route, 'US guide must use 7v7, 9v9 and rec soccer discovery terms');
    }
    if (!html.includes('Coaching rec soccer? Start here.') || !html.includes('Recreational soccer') || !html.includes('href="/formations/7v7/2-3-1/"') || !html.includes('href="/formations/9v9/3-1-3-1/"')) {
      fail(route, 'US guide is missing useful rec soccer explanations or formation links');
    }
  }
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
  const formatMatch = target === 'public' && route.match(/^\/formations\/(5v5|7v7|9v9)\/$/);
  if (formatMatch) {
    const format = formatMatch[1];
    const live = published.filter(f => f.format === format);
    if (live.length) {
      const sheets = (html.match(/class="sheet ed-grid"[^>]*data-sheet/g) || []).length;
      if (sheets !== live.length) fail(route, `expected ${live.length} illustrated formation sheets, found ${sheets}`);
      for (const f of live) {
        if (!html.includes(`href="/formations/${format}/${f.slug}/"`)) fail(route, `missing guide link for ${f.name}`);
        if (!(html.match(/<meta name="description" content="([^"]+)"/) || [])[1]?.includes(f.name)) fail(route, `description does not name the ${f.name} guide`);
      }
      if (!og.endsWith(`/og/formats/${format}.png`)) fail(route, 'format hub must have its own social preview');
      const collection = ld.find(x => x['@type'] === 'CollectionPage');
      if (!collection || collection.mainEntity?.itemListElement?.length !== live.length) fail(route, 'format hub missing complete CollectionPage / ItemList schema');
    }
  }
  if (target === 'public' && ['formation_issue', 'lesson', 'position', 'coaching_article'].includes(pageType)) {
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
  // Every published explainer needs its matching first-party poster.
  // The YouTube player must remain opt-in on all formation pages.
  const publishedExplainers = {
    '/formations/9v9/3-1-3-1/': 'KEKPal0Upd4',
    '/formations/9v9/3-2-3/': 'tWzAKTaX2sI'
  };
  if (Object.hasOwn(publishedExplainers, route)) {
    const expectedId = publishedExplainers[route];
    if (!html.includes('id="watch"') || !html.includes(`data-youtube-id="${expectedId}"`)) {
      fail(route, `missing matching full-length YouTube explainer (${expectedId})`);
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
  if (diagramCount && watermarkCount < diagramCount) fail(route, 'one or more pitch SVGs lost the embedded howweplayfootball.com credit');
  if (/howweplay\.com|>\.COM<|>HOW WE PLAY<\/text>/i.test(html)) fail(route, 'old or shortened web address in a diagram credit (must be howweplayfootball.com)');
  if (target === 'public' && route === '/') {
    if (!html.includes('Featured formation') || !html.includes('The 3-1-3-1')) fail(route, 'homepage must feature 3-1-3-1');
    if (!html.includes('Follow How We Play')) fail(route, 'homepage missing dedicated social discovery section');
    if (published.some(f => f.format === '5v5') && !/<title>[^<]*5v5, 7v7 &amp; 9v9/.test(html)) fail(route, 'homepage title must mention all three available formats');
  }
  if (target === 'public') {
    for (const profile of Object.values(model.site.social || {})) {
      if (!profile.url || !html.includes(profile.url)) fail(route, 'missing official social channel link: ' + (profile.handle || 'unknown'));
    }
    if (route.startsWith('/formations/') && route.match(/^\/formations\/(?:7v7|9v9)\/[^/]+\//) && !/meta name="robots" content="noindex/.test(html) && og.endsWith('/og/default.png')) {
      fail(route, 'formation page must not share the default placeholder image');
    }
  }
  // Coaching articles are a separate editorial collection, using the same pitch
  // renderer, source-based social images and accessible newsletter flow.
  if (target === 'public' && route === '/coaching/') {
    if (!html.includes('Coaching guides') || !html.includes('href="/coaching/attacking-corners/"')) fail(route, 'coaching hub missing its first published guide');
    if (!ld.find(x => x['@type'] === 'CollectionPage')) fail(route, 'coaching hub missing CollectionPage schema');
    if (og.endsWith('/og/default.png')) fail(route, 'coaching hub using generic sharing image');
  }
  if (target === 'public' && route === '/coaching/attacking-corners/') {
    for (const marker of ['id="setup"', 'id="choices"', 'id="seven-a-side"', 'id="training"', 'data-cn-location="article"', '2026–27', 'href="/formations/7v7/2-3-1/"']) {
      if (!html.includes(marker)) fail(route, 'coaching article missing ' + marker);
    }
    const diagrams = (html.match(/<svg[^>]*class="hwp-pitch[^"]*"/g) || []).length;
    if (diagrams < 4) fail(route, 'corner guide needs its four illustrated examples');
  }
  // The newsletter should be visible where readers find useful coaching content.
  // Multiple forms on a page must retain unique accessible IDs and placement tracking.
  if (target === 'public') {
    if (!html.includes('data-cn-location="footer"')) fail(route, 'missing footer newsletter');
    if (route === '/' && (!html.includes('id="coaching-notes-signup"') || !html.includes('data-cn-location="home"') || !html.includes('href="/#coaching-notes-signup"'))) {
      fail(route, 'homepage newsletter or its navigation link is missing');
    }
    if (pageType === 'formation_issue' && (!html.includes('id="coaching-notes-guide"') || !html.includes('data-cn-location="guide"'))) {
      fail(route, 'formation guide is missing its inline newsletter');
    }
    const signupIds = [...html.matchAll(/id="(cn-(?:home|guide|article|footer)-(?:email|help|status|h))"/g)].map(x => x[1]);
    if (signupIds.length !== new Set(signupIds).size) fail(route, 'duplicate newsletter element ID');
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
  writeFileSync(join(dist, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n${indexable.sort().map(r => {
    const modified = sitemapLastmod(r, model);
    const preview = socialImageForRoute(r, model).image;
    const imageTag = preview !== DEFAULT_SOCIAL_IMAGE ? `<image:image><image:loc>${escapeXml(site + preview)}</image:loc></image:image>` : '';
    return `  <url><loc>${escapeXml(site + r)}</loc>${modified ? `<lastmod>${modified}</lastmod>` : ''}${imageTag}</url>`;
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
