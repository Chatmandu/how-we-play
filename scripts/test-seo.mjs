#!/usr/bin/env node
/* Search-discovery regression tests. These intentionally use the real public
 * content model, so changing the publication gate changes the expected feed.
 */
import assert from 'node:assert/strict';
import { loadModel } from './load-content.mjs';
import { publishedIssues } from '../src/lib/editorial.mjs';
import {
  siteIdentity, issueStructuredData, lessonStructuredData,
  positionStructuredData, collectionStructuredData, sitemapLastmod,
  issueFeedXml, issuePath, escapeXml
} from '../src/lib/seo.mjs';

const model = loadModel('public');
const site = model.site;
const issues = publishedIssues(model);
let passed = 0;
function test(name, fn) {
  fn();
  console.log('PASS  ' + name);
  passed++;
}

test('WebSite, publisher and author are linked entities on the homepage', () => {
  const entities = siteIdentity(site);
  assert.deepEqual(entities.map(x => x['@type']), ['WebSite', 'Organization', 'Person']);
  assert.equal(entities[0].url, 'https://howweplayfootball.com/');
  assert.equal(entities[0].publisher['@id'], entities[1]['@id']);
  assert.equal(entities[1].founder['@id'], entities[2]['@id']);
  assert.equal(entities[2].name, site.author.name);
});

test('Formation issues have real dates, current URLs and discoverable child pages', () => {
  assert.ok(issues.length, 'There should be at least one public issue');
  for (const f of issues) {
    const [article, page] = issueStructuredData(site, f);
    const url = site.url + issuePath(f);
    assert.equal(article.url, url);
    assert.equal(article.datePublished, f.issue.published);
    assert.equal(article.dateModified, undefined, 'Do not invent modifications without a source date');
    assert.equal(article.isAccessibleForFree, true);
    assert.equal(article.author.name, site.author.name);
    assert.equal(page.mainEntity['@id'], article['@id']);
    assert.equal(page['@id'], url);
    assert.equal(article.hasPart.length, f.rules.length + f.roles.length);
    const items = new Set(article.hasPart.map(x => x.url));
    for (const r of f.rules) assert.ok(items.has(url + r.id + '/'));
    for (const r of f.roles) assert.ok(items.has(url + 'positions/' + r.id + '/'));
    assert.equal(page.reviewedBy.name, f.register.content.reviewedBy);
  }
});

test('Individual principles and positions point to their parent issue', () => {
  for (const f of issues) {
    for (const r of f.rules) {
      const [article, page] = lessonStructuredData(site, f, r);
      assert.equal(article.isPartOf.url, site.url + issuePath(f));
      assert.equal(page['@id'], article.url);
      assert.equal(article.datePublished, f.issue.published);
    }
    for (const r of f.roles) {
      const [article, page] = positionStructuredData(site, f, r);
      assert.equal(article.isPartOf.url, site.url + issuePath(f));
      assert.ok(article.description.includes(r.head));
      assert.equal(page['@id'], article.url);
    }
  }
});

test('9v9 collection exposes complete published issues only', () => {
  const collection = collectionStructuredData(site, issues)[0];
  assert.equal(collection['@type'], 'CollectionPage');
  assert.equal(collection.mainEntity.itemListElement.length, issues.length);
  for (const it of collection.mainEntity.itemListElement) {
    assert.ok(issues.some(f => it.url === site.url + issuePath(f)));
  }
});

test('Sitemap publication dates are stable and never fabricated from build time', () => {
  for (const f of issues) {
    assert.equal(sitemapLastmod(issuePath(f), model), f.issue.published);
    assert.equal(sitemapLastmod(issuePath(f) + f.rules[0].id + '/', model), f.issue.published);
    assert.equal(sitemapLastmod(issuePath(f) + 'positions/' + f.roles[0].id + '/', model), f.issue.published);
  }
  assert.equal(sitemapLastmod('/', model), null);
  assert.equal(sitemapLastmod('/about/', model), null);
  assert.equal(sitemapLastmod('/formations/5v5/', model), null);
  assert.equal(sitemapLastmod('/privacy/', model), site.privacy.lastUpdated);
});

test('RSS feed contains only approved full issues and no lessons or private drafts', () => {
  const xml = issueFeedXml(model);
  assert.ok(xml.startsWith('<?xml version="1.0"'));
  assert.equal((xml.match(/<item>/g) || []).length, issues.length);
  assert.ok(xml.includes('<rss version="2.0">'));
  assert.ok(xml.includes('atom:link'));
  assert.ok(!xml.includes('<pubDate>'), 'Do not fabricate a publication time');
  for (const f of issues) {
    assert.ok(xml.includes(site.url + issuePath(f)));
    for (const r of f.rules) assert.ok(!xml.includes(site.url + issuePath(f) + r.id + '/'));
  }
  for (const f of model.formations.filter(f => !f.gate.allowed)) {
    assert.ok(!xml.includes(site.url + issuePath(f)));
  }
});

test('XML values are escaped, not injected', () => {
  assert.equal(escapeXml('a & b < c "x"'), 'a &amp; b &lt; c &quot;x&quot;');
});

console.log(passed + '/' + passed + ' search-discovery tests passed');
