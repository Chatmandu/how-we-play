#!/usr/bin/env node
/* Video SEO safeguards use the real public publication gate and the verified
 * channel inventory, not guessed upload dates or generic video descriptions. */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { loadModel, loadRaw } from './load-content.mjs';
import { buildModel } from '../src/lib/model.mjs';
import { publishedVideos, videoForFormation, videoStructuredData, videoSitemapXml } from '../src/lib/videos.mjs';
import { socialImageForRoute } from '../src/lib/social-images.mjs';

const repoFile = file => readFileSync(new URL('../' + file, import.meta.url), 'utf8');
const pub = loadModel('public');
const pre = loadModel('preview');
const videos = publishedVideos(pub);
const ids = ['KEKPal0Upd4', 's_ENKf0Sb1E', 'tWzAKTaX2sI', 'CazFYOmIWqQ', 'T25DkHCSDHI', 'EXjeIrXdNjA'];
assert.equal(videos.length, 6, 'six complete explainers have approved public formation guides');
assert.deepEqual(videos.map(v => v.youtubeId), ids);
assert.equal(new Set(videos.map(v => v.href)).size, videos.length);
assert.equal(new Set(videos.map(v => v.youtubeId)).size, videos.length);
assert.equal(new Set(videos.map(v => v.thumbnail)).size, videos.length);
assert.equal(new Set(videos.map(v => v.title)).size, videos.length);
assert.equal(publishedVideos(pre).length, videos.length, 'same reviewed films allowed in private noindex preview');
const newRelease = videoForFormation(pub, '9v9', '2-2-3-1');
assert.equal(newRelease?.youtubeId, 'EXjeIrXdNjA', 'new 2-2-3-1 video on reviewed guide and in library');
assert.equal(newRelease?.href, '/videos/9v9-2-2-3-1/', 'new video has a dedicated watch page');
assert.equal(videoForFormation(pre, '9v9', '2-2-3-1')?.youtubeId, 'EXjeIrXdNjA', 'new video available in preview');
assert.equal(newRelease?.uploadDate, null, 'unverified upload timestamp is not invented');
assert.equal(newRelease?.duration, null, 'unverified running time is not invented');


const expected = {
  KEKPal0Upd4: ['2026-10-22T12:26:06Z', 291],
  s_ENKf0Sb1E: ['2026-10-24T10:09:10Z', 311],
  tWzAKTaX2sI: ['2026-10-28T13:16:41Z', 227],
  CazFYOmIWqQ: ['2026-10-31T15:43:08Z', 311],
  T25DkHCSDHI: ['2026-11-02T11:33:53Z', 219],
  EXjeIrXdNjA: [null, null]
};
for (const v of videos) {
  assert.equal(v.uploadDate, expected[v.youtubeId][0]);
  assert.equal(v.durationSeconds, expected[v.youtubeId][1]);
  assert.equal(v.href, '/videos/' + v.slug + '/');
  assert.equal(v.guideHref, '/formations/' + v.format + '/' + v.formation + '/');
  assert.equal(v.thumbnail, '/og/videos/' + v.slug + '.png');
  assert.equal(videoForFormation(pub, v.format, v.formation)?.youtubeId, v.youtubeId);
  assert.equal(v.f.gate.allowed, true);
  assert.equal(v.f.register.content.status, 'reviewed');
  assert.equal(v.f.rules.length, 4);
  assert(v.f.rules.every(r => v.description.includes(r.title)), 'only list reviewed principles');
  assert.equal(socialImageForRoute(v.href, pub).image, v.thumbnail);
  const [video, webpage] = videoStructuredData(pub.site, v);
  assert.equal(video['@type'], 'VideoObject');
  assert.equal(video.name, v.title);
  assert.equal(video.description, v.description);
  assert.equal(video.uploadDate, v.uploadDate ?? undefined);
  assert.equal(video.duration, v.duration ?? undefined);
  assert.equal(video.embedUrl, v.embedUrl);
  assert.equal(video.thumbnailUrl[0], pub.site.url + v.thumbnail);
  assert.equal(video.contentUrl, undefined, 'YouTube file bytes are not ours to declare');
  assert.equal(webpage.mainEntity['@id'], video['@id']);
  assert.equal(webpage.url, pub.site.url + v.href);
}

const verified = videos.filter(v => v.uploadDate && v.durationSeconds != null);
const xml = videoSitemapXml(pub);
assert(xml.includes('xmlns:video="http://www.google.com/schemas/sitemap-video/1.1"'));
assert.equal((xml.match(/<video:video>/g) || []).length, verified.length);
assert.equal((xml.match(/<loc>/g) || []).length, verified.length);
for (const v of verified) {
  assert(xml.includes('<loc>' + pub.site.url + v.href + '</loc>'));
  assert(xml.includes('<video:thumbnail_loc>' + pub.site.url + v.thumbnail + '</video:thumbnail_loc>'));
  assert(xml.includes('<video:player_loc>' + v.embedUrl + '</video:player_loc>'));
  assert(xml.includes('<video:publication_date>' + v.uploadDate + '</video:publication_date>'));
  assert(xml.includes('<video:duration>' + v.durationSeconds + '</video:duration>'));
}
assert(!xml.includes('eLIhEpv2QYA'), 'unembedded Shorts not in site watch page sitemap');
assert(!xml.includes('EXjeIrXdNjA'), 'unverified 2-2-3-1 publication data omitted from video sitemap');

const watch = repoFile('src/pages/videos/[slug]/index.astro');
const library = repoFile('src/pages/videos/index.astro');
const player = repoFile('src/components/IssueVideo.astro');
const base = repoFile('src/layouts/Base.astro');
assert(watch.includes('getStaticPaths()') && watch.includes('videoStructuredData(model.site, v)'), 'static watch routes have video metadata');
assert(watch.includes('ids={[f.registerId]}'), 'watch pages gated by reviewed formation');
assert(watch.includes('principlesHref={v.guideHref + \'#principles\'}'), 'watch page principle link points to real guide');
assert(library.includes('publishedVideos(model)') && library.includes('href={v.href}'), 'video index links to each watched film');
assert(base.includes("label: 'Videos'") && base.includes("href: '/videos/'"), 'videos discoverable from nav and footer');
assert(player.includes('data-youtube-play') && player.includes('watchPageHref'), 'consent-first player links to video pages');
assert(!player.includes('<iframe'), 'no static iframe on initial page');
for (const format of ['7v7', '9v9']) {
  const guide = repoFile(`src/pages/formations/${format}/[formation]/index.astro`);
  assert(guide.includes('videoForFormation(model, f.format, f.slug)'), format + ' guide uses central video inventory');
  assert(guide.includes('watchPageHref={explainer.href}'), format + ' guide links to video watch page');
}
const raw = loadRaw();
const changed = raw.formations.find(f => f.format === '9v9' && f.slug === '3-1-3-1');
changed.rules[0].cue += ' ';
const gateClosed = buildModel(raw, 'public');
assert(!publishedVideos(gateClosed).some(v => v.youtubeId === 'KEKPal0Upd4'), 'losing review approval removes a video watch page');
console.log('PASS  Six reviewed videos: watch pages, privacy, metadata, verified sitemap and publication gate');
