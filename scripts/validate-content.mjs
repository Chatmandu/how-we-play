#!/usr/bin/env node
/* Content validation: runs the design-system diagram validator over every frame, checks that
 * register, formation files and facts agree, and that every lesson and position references a
 * diagram that exists. Errors fail; warnings are listed for the content team. */
import { validate } from '../design-system/diagrams/renderer.mjs';
import { loadModel } from './load-content.mjs';

const model = loadModel('local');
const errors = [], warnings = [];
for (const f of model.formations) {
  const frames = [['shape', { ...f.shape, altSummary: f.shape.altSummary || f.shape.alt }]];
  for (const [k, set] of Object.entries(f.diagrams || {})) set.frames.forEach((fr, i) => frames.push([`${k}[${fr.key || i}]`, fr]));
  for (const [name, fr] of frames) {
    for (const r of validate(fr, { pitch: f.pitch })) (r.level === 'error' ? errors : warnings).push(`${f.id} ${name}: ${r.code} ${r.msg}`);
    if (name !== 'shape' && !fr.caption) errors.push(`${f.id} ${name}: missing caption`);
  }
  for (const r of f.rules || []) if (r.diagram && !f.diagrams[r.diagram]) errors.push(`${f.id} rule ${r.id}: diagram "${r.diagram}" not found`);
  for (const r of f.roles || []) {
    if (r.diagram && !f.diagrams[r.diagram]) errors.push(`${f.id} role ${r.id}: diagram "${r.diagram}" not found`);
    for (const id of r.rules || []) if (!(f.rules || []).some(x => x.id === id)) errors.push(`${f.id} role ${r.id}: unknown rule "${id}"`);
  }
  for (const r of [...(f.rules || []), ...(f.roles || [])]) for (const id of r.reviewRefs || []) if (!(f.review || []).some(x => x.id === id)) errors.push(`${f.id} ${r.id}: unknown review item "${id}"`);
  const slugs = new Set();
  for (const r of f.rules || []) { if (slugs.has(r.id) || r.id === 'positions') errors.push(`${f.id}: lesson slug "${r.id}" clashes`); slugs.add(r.id); }
}
console.log(`Content: ${model.formations.length} formations, ${Object.keys(model.items).length} register items, ${model.facts.facts.length} facts.`);
if (warnings.length) console.log(`${warnings.length} warning(s) for the content team:\n` + warnings.map(w => '  · ' + w).join('\n'));
if (errors.length) { console.error(`${errors.length} error(s):\n` + errors.map(e => '  ✕ ' + e).join('\n')); process.exit(1); }
console.log('✓ content valid');
