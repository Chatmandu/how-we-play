/* Loads content for Node scripts (same model as the Astro build). */
import { readFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildModel, resolveTarget } from '../src/lib/model.mjs';

export const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const json = p => JSON.parse(readFileSync(join(ROOT, p), 'utf8'));

export function loadRaw() {
  const dir = join(ROOT, 'content/formations');
  const formations = readdirSync(dir).flatMap(fmt => readdirSync(join(dir, fmt)).filter(f => f.endsWith('.json')).map(f => json(`content/formations/${fmt}/${f}`)));
  return { site: json('content/site.json'), register: json('content/register.json'), facts: json('content/editorial/format-facts.json'), checklist: json('content/editorial/moving-up-checklist.json'), formations };
}
export const loadModel = (target = resolveTarget(process.env)) => buildModel(loadRaw(), target);
