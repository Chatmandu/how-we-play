#!/usr/bin/env node
/* Seven-a-side publication guard: check real review record, exact version,
 * published pages, independent tactical diagram validation and SEO visibility. */
import assert from 'node:assert/strict';
import { loadModel } from './load-content.mjs';
import { contentVersion } from '../src/lib/model.mjs';
import { publishedIssues } from '../src/lib/editorial.mjs';
import { validate } from '../design-system/diagrams/renderer.mjs';
import { issuePath, issueStructuredData, issueFeedXml, sitemapLastmod } from '../src/lib/seo.mjs';

const pub = loadModel('public');
const pre = loadModel('preview');
const f = pre.formations.find(x => x.format === '7v7' && x.slug === '2-3-1');
assert.ok(f, '7v7 Issue 01 should be in the complete preview model');
assert.equal(f.registerId, '7v7-2-3-1');
assert.equal(f.register.content.status, 'reviewed');
assert.equal(f.status.content, 'reviewed');
assert.equal(f.register.content.reviewedBy, 'David Wilson');
assert.equal(f.status.reviewedBy, 'David Wilson');
assert.equal(f.register.content.reviewedOn, '2026-10-22');
assert.equal(f.status.reviewedOn, '2026-10-22');
assert.equal(f.issue.published, '2026-10-22');
assert.equal(f.register.content.reviewedVersion, contentVersion(f), 'Signed-off version must match exact publication content');
assert.equal(f.register.content.reviewLog.at(-1)?.version, contentVersion(f));
assert.equal(pub.formation('2-3-1').gate.allowed, true, 'Approved issue should be publicly available');
assert.equal(pub.publicFormations.some(x => x.registerId === f.registerId), true);
assert.equal(pre.formation('2-3-1').gate.noindex, true, 'Staging must remain noindex');
assert.equal(pre.formation('2-3-1').gate.watermark, false, 'Reviewed content must not be marked unreviewed');
assert.equal(pub.site.formats.find(x => x.id === '7v7').availability, 'live');
assert.equal(publishedIssues(pub).some(x => x.registerId === f.registerId), true);

const players = f.shape.players;
assert.deepEqual(players.map(p => p.l).sort(), ['2','3','7','8','9','11','GK'].sort());
assert.equal(new Set(players.map(p => p.id)).size, 7);
assert.equal(f.shape.pitch, '7v7');
assert.equal(f.rules.length, 4);
assert.equal(f.roles.length, 5);
assert.equal(f.issue.chapters.length, 4);
assert.deepEqual(f.issue.chapters.map(c => c.id), ['shape','principles','jobs','together']);
assert.equal(f.issue.chapters[1].rules.length, 4);
assert.equal(f.issue.chapters[2].roles.length, 5);

for (const rule of f.rules) {
  assert.ok(f.diagrams[rule.diagram], `Rule has diagrams: ${rule.id}`);
  assert.ok(f.issue.chapters[1].rules.includes(rule.id));
}
for (const role of f.roles) {
  assert.ok(f.diagrams[role.diagram], `Position has diagrams: ${role.id}`);
  assert.ok(role.points.length >= 2 && role.cue);
  for (const rule of role.rules) assert.ok(f.rules.some(r => r.id === rule));
}
let frames = 0;
for (const [name,set] of Object.entries(f.diagrams)) {
  assert.ok(set.frames.length >= 2, `Two states required for ${name}`);
  for(const frame of set.frames) {
    frames++;
    assert.equal(frame.pitch, '7v7', `Correct renderer: ${name}`);
    assert.ok(frame.altSummary?.length >= 40 && frame.caption?.length >= 20, `Accessible caption: ${name}`);
    assert.ok(frame.players.length && frame.players.every(p => /^((us)|(them))-/.test(p.id)));
    const issues = validate(frame, { pitch: '7v7' }).filter(x => x.level === 'error');
    assert.deepEqual(issues, [], `Diagram errors: ${name} ${frame.key} ${JSON.stringify(issues)}`);
    for(const area of frame.highlights || []) assert.ok((frame.labels || []).length, `Labelled area needed: ${name} ${frame.key}`);
  }
}
assert.ok(frames >= 18, `Full diagram set: ${frames}`);

const [article] = issueStructuredData(pub.site, f);
assert.equal(article.url, pub.site.url + '/formations/7v7/2-3-1/');
assert.equal(article.isPartOf.url, pub.site.url + '/formations/7v7/');
assert.equal(article.articleSection, '7v7 formation guides');
assert.equal(article.datePublished, '2026-10-22');
assert.equal(sitemapLastmod(issuePath(f), pub), '2026-10-22');
assert.equal(sitemapLastmod('/formations/7v7/', pub), '2026-10-22');
assert.ok(issueFeedXml(pub).includes(pub.site.url + issuePath(f)), 'Approved issue must appear in public RSS');

console.log(`PASS  Approved 7v7 Issue 01: ${f.rules.length} principles, ${f.roles.length} position groups, ${frames} frames, signed-off ${contentVersion(f)} and public`);


// Issue 02 is a separate coaching publication. Approval of Issue 01 must
// never give this new formation a public route or a misleading review credit.
const draft = pre.formations.find(x => x.format === '7v7' && x.slug === '3-2-1');
assert.ok(draft, 'Issue 02 should exist in the complete review model');
assert.equal(draft.id, '7v7-3-2-1');
assert.equal(draft.registerId, '7v7-3-2-1');
assert.equal(draft.issue.number, 2);
assert.equal(draft.register.content.status, 'review-required');
assert.equal(draft.status.content, 'review-required');
assert.equal(draft.register.content.reviewedBy, null, 'Do not inherit Issue 01 reviewer approval');
assert.equal(draft.register.content.reviewedOn, null);
assert.equal(draft.issue.published, undefined, 'Issue 02 is not published');
assert.equal(pub.formation('3-2-1').gate.allowed, false);
assert.ok(!pub.publicFormations.some(x => x.registerId === draft.registerId));
assert.equal(pre.formation('3-2-1').gate.allowed, true);
assert.equal(pre.formation('3-2-1').gate.noindex, true);
assert.equal(pre.formation('3-2-1').gate.watermark, true);
assert.equal(draft.shape.pitch, '7v7');
assert.deepEqual(draft.shape.players.map(p => p.l).sort(), ['2','3','5','7','9','11','GK'].sort());
assert.equal(new Set(draft.shape.players.map(p => p.id)).size, 7);
assert.equal(draft.rules.length, 4);
assert.equal(draft.roles.length, 5);
assert.deepEqual(draft.issue.chapters.map(c => c.id), ['shape','principles','jobs','together']);
assert.deepEqual(draft.issue.chapters[1].rules, draft.rules.map(r => r.id));
assert.deepEqual(draft.issue.chapters[2].roles, draft.roles.map(r => r.id));
for (const rule of draft.rules) {
  assert.ok(draft.diagrams[rule.diagram], 'Rule has a real diagram: ' + rule.id);
  assert.ok(rule.cue && rule.look.length >= 3);
}
for (const role of draft.roles) {
  assert.ok(draft.diagrams[role.diagram], 'Position has a real diagram: ' + role.id);
  assert.ok(role.cue && role.points.length >= 3);
  for (const rule of role.rules) assert.ok(draft.rules.some(r => r.id === rule), 'Role references real rule');
}
let newFrames = 0;
for (const [name, set] of Object.entries(draft.diagrams)) {
  assert.ok(set.frames.length >= 2, name + ' has two frames');
  for (const state of set.frames) {
    newFrames++;
    assert.equal(state.pitch, '7v7');
    assert.ok(state.caption?.length >= 20 && state.altSummary?.length >= 45);
    const errors = validate(state, { pitch: '7v7' }).filter(x => x.level === 'error');
    assert.deepEqual(errors, [], 'Diagram validation: ' + name + '[' + state.key + '] ' + JSON.stringify(errors));
    for (const ghost of state.ghosts || []) {
      assert.ok(state.players.some(p => p.id === ghost.id), 'Start-position ghost has matching player: ' + name);
    }
    for (const h of state.highlights || []) {
      assert.ok((state.labels || []).length, 'Highlighted space has accessible source label: ' + name);
    }
  }
}
assert.equal(newFrames, 18);
const [draftArticle] = issueStructuredData(pub.site, draft);
assert.equal(draftArticle.url, pub.site.url + '/formations/7v7/3-2-1/');
assert.equal(draftArticle.datePublished, undefined, 'Do not invent publication metadata for a draft');
assert.equal(sitemapLastmod(issuePath(draft), pub), null);
assert.ok(!issueFeedXml(pub).includes(pub.site.url + issuePath(draft)), 'Draft never appears in published RSS');
assert.ok(!publishedIssues(pub).includes(draft), 'Draft never appears as latest published issue');
console.log(`PASS  7v7 Issue 02 draft: ${draft.rules.length} principles, ${draft.roles.length} position groups, ${newFrames} frames, reviewer gate enforced`);
