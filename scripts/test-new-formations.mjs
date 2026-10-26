#!/usr/bin/env node
/* Guards four newly approved formation guides: exact versioned coaching approval,
 * complete public guides and previews, plus automatic withdrawal if content changes. */
import assert from 'node:assert/strict';
import { loadModel, loadRaw } from './load-content.mjs';
import { buildModel, contentVersion } from '../src/lib/model.mjs';
import { motionPaths, validate } from '../design-system/diagrams/renderer.mjs';
import { publishedIssues } from '../src/lib/editorial.mjs';

const versions = {
  '5v5-1-2-1': 'cv-0564e1bb',
  '5v5-2-2': 'cv-b002302f',
  '7v7-2-1-2-1': 'cv-d2c2ecf7',
  '9v9-3-2-3': 'cv-0cb51dd6'
};
const preview = loadModel('preview');
const publicModel = loadModel('public');

for (const [id, approvedVersion] of Object.entries(versions)) {
  const f = preview.formations.find(x => x.id === id);
  assert.ok(f, id + ' must be loaded');
  assert.equal(f.status.content, 'reviewed');
  assert.equal(f.register.content.status, 'reviewed');
  assert.equal(f.status.reviewedBy, 'David Wilson');
  assert.equal(f.register.content.reviewedBy, 'David Wilson');
  assert.equal(f.register.content.reviewedOn, '2026-10-26');
  assert.equal(f.register.content.reviewedVersion, approvedVersion);
  assert.equal(contentVersion(f), approvedVersion, id + ' must match the reviewed content');
  assert.equal(f.register.content.reviewLog.at(-1)?.version, approvedVersion);
  assert.equal(f.register.content.reviewLog.at(-1)?.decision, 'approved');
  assert.equal(f.issue.published, '2026-10-26');
  assert.equal(f.gate.allowed, true, id + ' must remain previewable');
  assert.equal(f.gate.noindex, true, id + ' preview must not be indexable');
  assert.equal(f.gate.watermark, false, id + ' approved content must not carry a draft watermark');
  assert.equal(publicModel.formations.find(x => x.id === id).gate.allowed, true, id + ' may publish only with this sign-off');
  assert.equal(publishedIssues(publicModel).some(x => x.id === id), true, id + ' must be a complete published issue');
  assert.equal(f.rules.length, 4);
  assert.equal(f.issue.chapters.length, 4);
  assert.ok(f.roles.length >= 3);
  assert.equal(f.issue.chapters.find(x => x.id === 'principles').rules.length, 4);
  assert.equal(f.issue.chapters.find(x => x.id === 'jobs').roles.length, f.roles.length);
  assert.equal(f.shape.players.length, Number(f.format[0]));
  assert.equal(validate(f.shape, {pitch:f.pitch}).filter(x => x.level === 'error').length, 0);
  for (const rule of f.rules) {
    const frames = f.diagrams[rule.diagram].frames;
    assert.equal(frames.length, 2, id + ': ' + rule.id + ' must have two reviewed steps');
    assert.equal(frames[0].verdict, 'wrong');
    assert.ok(frames[1].ghosts?.length && frames[1].arrows?.length, id + ': ' + rule.id + ' must show real motion');
    assert.ok(Object.keys(motionPaths(frames[1])).length, id + ': ' + rule.id + ' must animate');
    for (const frame of frames) {
      assert.ok(frame.caption && frame.altSummary, id + ': ' + rule.id + ' missing accessible description');
      assert.equal(validate(frame, {pitch:f.pitch}).filter(x => x.level === 'error').length, 0);
    }
  }
  for (const role of f.roles) assert.ok(f.diagrams[role.diagram]?.frames.length);
  console.log('PASS  ' + id + ': approved ' + approvedVersion + ', four animated principles, roles and public issue');
}

// Simulate a post-review wording change in memory only. No real content is altered.
// An approval must never carry over to a different coaching content version.
const mock = loadRaw();
const f = mock.formations.find(x => x.id === '5v5-1-2-1');
assert.equal(buildModel(mock, 'public').formation('1-2-1').gate.allowed, true);
f.rules[0].cue += ' '; // Any content change invalidates that review.
assert.equal(buildModel(mock, 'public').formation('1-2-1').gate.allowed, false);
console.log('PASS  any unreviewed subsequent content change closes the public gate');
