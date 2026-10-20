#!/usr/bin/env node
// Usage (from hwp-design-system/): node tests/run.mjs   (Node 18+, no dependencies)
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import * as R from '../diagrams/renderer.mjs';
import * as G from '../governance/publish-gate.mjs';
import { resolve } from '../tokens/build-lib.mjs';
import { run } from './suite.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const json = p => JSON.parse(readFileSync(join(root, p), 'utf8'));
const ctx = {
  R, G,
  content: { '3-1-3-1': json('../content/formations/9v9/3-1-3-1.json'), '3-3-2': json('../content/formations/9v9/3-3-2.private.json'), '2-2-3-1': json('../content/formations/9v9/2-2-3-1.private.json') },
  register: json('tests/fixtures/content-register.json'), // fixed fixture: tests the gate's rules, not today's live statuses
  liveRegister: json('../content/register.json'), // live content statuses must stay in sync with formation JSON
  flat: resolve(json('tokens/tokens.json'))
};
const results = await run(ctx);
process.exitCode = results.every(r => r.pass) ? 0 : 1;
