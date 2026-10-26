#!/usr/bin/env node
/* Guards the four new formation drafts: complete guides in preview, absent from public
 * until David Wilson has reviewed the exact tactical content version. */
import assert from 'node:assert/strict';
import { loadModel, loadRaw } from './load-content.mjs';
import { buildModel, contentVersion } from '../src/lib/model.mjs';
import { motionPaths, validate } from '../design-system/diagrams/renderer.mjs';

const ids = ['5v5-1-2-1', '5v5-2-2', '7v7-2-1-2-1', '9v9-3-2-3'];
const preview = loadModel('preview');
const publicModel = loadModel('public');

for (const id of ids) {
  const f = preview.formations.find(x => x.id === id);
  assert.ok(f, id + ' must be loaded');
  assert.equal(f.status.content, 'review-required');
  assert.equal(f.register.content.status, 'review-required');
  assert.equal(f.register.content.reviewedBy, null);
  assert.equal(f.gate.allowed, true, id + ' must appear in private preview');
  assert.equal(publicModel.formations.find(x => x.id === id).gate.allowed, false, id + ' must not publish without review');
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
  console.log('PASS  ' + id + ': full private playbook, four animated principles, roles and no public leak');
}

// Simulating review is a model test only. It must never alter the real register.
const mock = loadRaw();
const f = mock.formations.find(x => x.id === '5v5-1-2-1');
const reg = mock.register.find(x => x.id === f.registerId);
reg.content.status = 'reviewed';
reg.content.reviewedBy = 'David Wilson';
reg.content.reviewedOn = '2026-10-26';
reg.content.reviewedVersion = contentVersion(f);
f.status.content = 'reviewed';
f.status.reviewedBy = 'David Wilson';
f.status.reviewedOn = '2026-10-26';
f.issue.published = '2026-10-26';
assert.equal(buildModel(mock, 'public').formation('1-2-1').gate.allowed, true);
f.rules[0].cue += ' '; // Any content change invalidates that review.
assert.equal(buildModel(mock, 'public').formation('1-2-1').gate.allowed, false);
console.log('PASS  coaching approval is locked to an exact content version');
