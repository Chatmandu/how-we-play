#!/usr/bin/env node
/* Editorial safeguards for the first coaching article and diagrams. */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { validate } from '../design-system/diagrams/renderer.mjs';
import { coachingArticles, coachingTopics, cornerDiagrams } from '../src/lib/coaching.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = path => readFileSync(join(root, path), 'utf8');
assert.equal(coachingArticles.length, 1, 'publish only complete coaching articles');
assert.equal(new Set(coachingArticles.map(a => a.slug)).size, coachingArticles.length);
for (const a of coachingArticles) {
  assert.match(a.published, /^\d{4}-\d{2}-\d{2}$/);
  assert(coachingTopics.some(t => t.id === a.topic), 'article must have a listed topic');
  assert(a.href === `/coaching/${a.slug}/`);
}
for (const [name, frame] of Object.entries(cornerDiagrams)) {
  const errors = validate(frame).filter(x => x.level === 'error');
  assert.deepEqual(errors, [], `${name} should be an accessible, valid pitch diagram`);
}
assert.equal(cornerDiagrams.setup9v9.players.filter(p => p.t === 'us').length, 8, '9v9 corner should show eight outfield players');
assert.equal(cornerDiagrams.setup7v7.players.filter(p => p.t === 'us').length, 6, '7v7 corner should show six outfield players');
assert(cornerDiagrams.setup9v9.players.some(p => p.id === 'us-cover-a'), 'leave cover behind');
const article = read('src/pages/coaching/attacking-corners/index.astro');
const hub = read('src/pages/coaching/index.astro');
assert(article.includes('no deliberate heading') || article.includes('deliberate heading is not allowed'), '7v7 must mention U11 heading restrictions');
assert(article.includes('2026–27'), 'refer to the current season for rules');
assert(article.includes('englandfootball.com/participate/learn/brain-health/heading-in-football'), 'link to official heading rules');
assert(article.includes('<CoachingNotes placement="article" />'), 'article needs its newsletter');
assert(hub.includes('coachingTopics'), 'hub should be organised by categories');
assert(read('src/layouts/Base.astro').includes("label: 'Coaching Guides'"), 'main nav link');
assert(read('src/pages/index.astro').includes('coach-feature--home'), 'homepage discovery');
assert(read('src/lib/social-images.mjs').includes('/og/coaching/'), 'first-party social previews');
console.log('Coaching content, diagrams, age-group guidance and discovery checks passed');
