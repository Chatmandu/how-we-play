#!/usr/bin/env node
/* Editorial safeguards for published coaching articles and diagrams. */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { validate } from '../design-system/diagrams/renderer.mjs';
import { coachingArticles, coachingTopics, cornerDiagrams } from '../src/lib/coaching.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = path => readFileSync(join(root, path), 'utf8');
assert.equal(coachingArticles.length, 2, 'publish only the two reviewed coaching guides');
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
const transition = read('src/pages/coaching/moving-from-7v7-to-9v9-england/index.astro');
assert(transition.includes('Reviewed by {article.reviewer.name}'), 'only publish with reviewer acknowledgement');
assert(transition.includes('2026/27') && transition.includes('U10 and U11 play 7v7'), 'state the England FutureFit age pathway');
assert(transition.includes('2,035 square metres') && transition.includes('3,358 square metres'), 'publish correct pitch areas');
assert(transition.includes('offside is introduced') && transition.includes('there is no retreat line'), 'explain the two main rule changes');
assert(transition.includes('7v7-vs-9v9-england.svg'), 'use an original pitch comparison');
assert(transition.includes('<CoachingNotes placement="article" />'), 'transition article needs newsletter');
assert(!transition.includes('[DAVID REVIEW') && !transition.includes('[EDITORIAL CHECK'), 'never expose internal review annotations');
assert(read('public/graphics/coaching/7v7-vs-9v9-england.svg').includes('Shared scale: 7 px = 1 metre'), 'show both pitches at a consistent scale');
assert(read('src/pages/formations/7v7/index.astro').includes('/coaching/moving-from-7v7-to-9v9-england/'), 'link from 7v7 formation hub');
assert(read('src/pages/formations/9v9/index.astro').includes('/coaching/moving-from-7v7-to-9v9-england/'), 'link from 9v9 formation hub');
assert(hub.includes('coachingTopics'), 'hub should be organised by categories');
assert(read('src/layouts/Base.astro').includes("label: 'Coaching Guides'"), 'main nav link');
assert(read('src/pages/index.astro').includes('coach-feature--home'), 'homepage discovery');
assert(read('src/lib/social-images.mjs').includes('/og/coaching/'), 'first-party social previews');
// The 9v9 hub is a comparison page, not a duplicate of four full team sheets.
const nineHub = read('src/pages/formations/9v9/index.astro');
const nineComparison = read('src/components/NineV9Comparison.astro');
const sevenHub = read('src/pages/formations/7v7/index.astro');
assert(nineHub.includes('<NineV9Comparison issues={published} />'), 'published 9v9 guides should use the comparison');
assert(nineHub.includes('Compare 4 Shapes') && nineHub.includes('Compare four 9v9 football formations'), '9v9 hub should have comparison-led SEO metadata');
assert(nineHub.includes('href="#compare-9v9"'), '9v9 introduction must link to the comparison');
assert(nineComparison.includes('id="compare-9v9"') && nineComparison.includes('id="nine-previews-title"'), 'both comparison and diagrams need labelled sections');
assert(!nineHub.includes('<TeamSheet') && !nineHub.includes('<FormationChooser'), 'remove duplicated 9v9 hub team sheets');
assert(sevenHub.includes('<FormationChooser format="7v7"') && sevenHub.includes('<TeamSheet f={f}'), 'keep the current 7v7 hub intact');
for (const slug of ['3-1-3-1', '3-3-2', '2-2-3-1', '3-2-3']) {
  assert(nineComparison.includes(`'${slug}': {`), `missing 9v9 comparison copy for ${slug}`);
}
assert.equal((nineComparison.match(/question:/g) || []).length, 4, 'one coaching consideration per formation');
assert.equal((nineComparison.match(/preview:/g) || []).length, 4, 'one preview summary per formation');
assert(nineComparison.includes('An alternative to explore'), '2-2-3-1 needs an explicit alternative label');
assert(nineComparison.includes('renderPitch('), 'use approved diagram data rather than a replacement image');
assert(nineHub.includes('/coaching/moving-from-7v7-to-9v9-england/') && nineHub.includes('/coaching/attacking-corners/'), 'preserve the coaching resource links');
console.log('Coaching content, diagrams, age-group guidance and discovery checks passed');
