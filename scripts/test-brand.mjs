#!/usr/bin/env node
/* How We Play Football brand checks. Part of `npm test`. */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import assert from 'node:assert/strict';
import { renderPitch, themeFromTokens } from '../design-system/diagrams/renderer.mjs';
import { resolve } from '../design-system/tokens/build-lib.mjs';

const ROOT = new URL('..', import.meta.url).pathname;
const json = p => JSON.parse(readFileSync(join(ROOT, p), 'utf8'));
const site = json('content/site.json');
assert.equal(site.name, 'How We Play Football', 'official name');
assert.equal(site.url, 'https://howweplayfootball.com', 'canonical domain unchanged');
for (const k of ['youtube', 'instagram', 'tiktok']) assert.equal(site.social[k].handle, '@howweplayfootball', k + ' handle unchanged');

const flat = resolve(json('design-system/tokens/tokens.json'));
const themes = ['blue', 'light', 'mono'].map(t => { try { return [t, themeFromTokens(flat, t)]; } catch { return null; } }).filter(Boolean);
const walk = d => readdirSync(d).flatMap(n => { const p = join(d, n); return statSync(p).isDirectory() ? walk(p) : [p]; });
let n = 0;
for (const file of walk(join(ROOT, 'content/formations')).filter(f => f.endsWith('.json'))) {
  const f = JSON.parse(readFileSync(file, 'utf8'));
  const frames = [f.shape, ...Object.values(f.diagrams || {}).flatMap(x => x.frames || [])].filter(Boolean);
  for (const d of frames) for (const [t, colors] of themes) {
    for (const opts of [{ theme: t }, { theme: t, mode: 'inline', colors }]) {
      const s = renderPitch(d, { pitch: f.pitch, ...opts });
      assert.ok(s.includes('data-hwp-watermark="howweplayfootball.com"'), 'credit missing');
      assert.ok(!/howweplay\.com|>\.COM<|>HOW WE PLAY<\/text>/i.test(s), 'old credit text');
      assert.ok(!/hwp-brand-bg|fill-opacity="\.90"/.test(s), 'credit must not have a background panel');
      const m = s.match(/data-hwp-watermark-mode="(full|mark)"/); assert.ok(m, 'credit mode');
      if (m[1] === 'full') assert.ok(s.includes('>howweplayfootball.com</text>'), 'full credit shows the full domain');
      const compact = renderPitch(d, { pitch: f.pitch, ...opts, numbers: false, labels: false });
      assert.ok(compact.includes('data-hwp-watermark-mode="mark"'), 'compact previews use the mark only');
      assert.ok(!/<text[^>]*>[^<]+<\/text>/.test(compact.replace(/<title[\s\S]*?<\/desc>/, '')), 'compact preview has no text');
      n++;
    }
  }
}
for (const f of readdirSync(join(ROOT, 'design-system/assets/logo')).filter(x => x.endsWith('.svg'))) {
  const s = readFileSync(join(ROOT, 'design-system/assets/logo', f), 'utf8');
  assert.ok(s.includes('>How We Play Football</title>'), f + ' title');
  assert.ok(!/<text\b/.test(s), f + ' must be outlined (no live text)');
}
console.log(`  ✓ brand: name, handles, ${n} diagram renders with the howweplayfootball.com credit, logo titles and outlines`);
