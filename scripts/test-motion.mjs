#!/usr/bin/env node
/* Verify the new issue animations only interpolate already-published tactical snapshots.
 * No content-file changes and no new coaching decisions are permitted here. */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { inferStepMotion } from '../src/scripts/figure-motion.mjs';
import { frameAt, motionPaths, renderPitch, validate } from '../design-system/diagrams/renderer.mjs';

const read = name => JSON.parse(readFileSync(new URL('../content/formations/9v9/' + name + '.private.json', import.meta.url)));
const formations = [read('3-3-2'), read('2-2-3-1')];
let checks = 0;
const check = (name, fn) => { fn(); checks++; console.log('PASS  ' + name); };
const diagram = (f, k) => f.diagrams[k].frames;

check('3-3-2: middle-first animates 8 from its authored earlier position', () => {
  const frames = diagram(formations[0], 'middle-first');
  const next = inferStepMotion(frames, 1);
  const eight = next.ghosts.find(g => g.id === 'us-8');
  assert.deepEqual([eight.x, eight.y], [75, 97]);
  assert.deepEqual(next.players.find(p => p.id === 'us-8') && [50, 99], [50, 99]);
  assert.deepEqual(motionPaths(next)['us-8'].to, [50, 99]);
  assert.deepEqual([frameAt(next, 0).players.find(p => p.id === 'us-8').x, frameAt(next, 0).players.find(p => p.id === 'us-8').y], [75, 97]);
  assert.deepEqual([frameAt(next, 1).players.find(p => p.id === 'us-8').x, frameAt(next, 1).players.find(p => p.id === 'us-8').y], [50, 99]);
});
check('2-2-3-1: centre-back cover and central protection animate without new positions', () => {
  for (const [key, player] of [['two-connected', 'us-5'], ['protect-middle', 'us-6']]) {
    const frames = diagram(formations[1], key);
    const next = inferStepMotion(frames, 1);
    assert.ok(next.ghosts.some(g => g.id === player), key + ' should animate ' + player);
    assert.ok(motionPaths(next)[player]);
  }
});
check('existing reviewed animation paths take priority', () => {
  for (const [f, key, index] of [[formations[0], 'one-comes', 1], [formations[0], 'ball-side-wide', 1], [formations[1], 'wb-recovery', 1], [formations[1], 'width-cover', 1]]) {
    const frames = diagram(f, key);
    assert.strictEqual(inferStepMotion(frames, index), frames[index], 'Authored path was changed: ' + key);
  }
});
check('alternative what-if picture stays static', () => {
  const frames = diagram(formations[0], 'ball-side-wide');
  assert.strictEqual(inferStepMotion(frames, 2, { skipKeys: ['choose'] }), frames[2]);
});
check('each new issue has motion in all four principle lessons', () => {
  for (const f of formations) for (const r of f.rules) {
    const frames = diagram(f, r.diagram);
    const prepared = frames.map((_, i) => inferStepMotion(frames, i, { skipKeys: ['choose'] }));
    assert.ok(prepared.some(frame => frame.ghosts?.length), f.name + ': ' + r.title + ' is entirely static');
  }
});
check('inferred frames never mutate coaching source or invent endpoints', () => {
  for (const f of formations) for (const r of f.rules) {
    const frames = diagram(f, r.diagram), original = JSON.stringify(frames);
    for (let i = 0; i < frames.length; i++) {
      const animated = inferStepMotion(frames, i, { skipKeys: ['choose'] });
      assert.deepEqual(animated.players, frames[i].players);
      assert.deepEqual(animated.ball, frames[i].ball);
      assert.deepEqual(animated.caption, frames[i].caption);
      assert.deepEqual(animated.altSummary, frames[i].altSummary);
      for (const ghost of animated.ghosts || []) if (!(frames[i].ghosts || []).length) {
        const prior = frames[i - 1]?.players.find(p => p.id === ghost.id);
        assert.ok(prior, 'Unmatched inferred motion');
        assert.deepEqual([ghost.x, ghost.y], [prior.x, prior.y]);
      }
      assert.equal(validate(animated).filter(x => x.level === 'error').length, 0);
      const svg = renderPitch(animated, { theme: 'blue', title: animated.caption, desc: animated.altSummary || animated.alt });
      assert.ok(svg.includes('<title') && svg.includes('<desc'));
    }
    assert.equal(JSON.stringify(frames), original);
  }
});
console.log(checks + '/' + checks + ' motion checks passed');
