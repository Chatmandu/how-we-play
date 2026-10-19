#!/usr/bin/env node
// Usage: node tokens/build.mjs   (from the hwp-design-system folder)
// Regenerates tokens.css and docs/contrast-report.md from tokens.json. No dependencies.
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { toCSS, contrastReport } from './build-lib.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const tokens = JSON.parse(readFileSync(join(here, 'tokens.json'), 'utf8'));
writeFileSync(join(here, 'tokens.css'), toCSS(tokens));

const rows = contrastReport(tokens);
const md = ['# Contrast report (generated)', '', '| Use | Foreground | Background | Ratio | Min | Result |', '|---|---|---|---|---|---|',
  ...rows.map(r => `| ${r.use} | ${r.fgHex} | ${r.bgHex} | ${r.ratio.toFixed(2)}:1 | ${r.min}:1 | ${r.pass ? 'Pass' : '**Fail / restricted**'} |`)].join('\n');
writeFileSync(join(here, '..', 'docs', 'contrast-report.md'), md + '\n');
const fails = rows.filter(r => !r.pass);
console.log(`tokens.css written. Contrast: ${rows.length - fails.length}/${rows.length} pass.`);
fails.forEach(f => console.log('  restricted:', f.use, f.ratio));
