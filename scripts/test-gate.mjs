#!/usr/bin/env node
/* Site-level publishing tests (the design-system suite tests the gate itself). */
import { loadModel } from './load-content.mjs';
import { resolveTarget } from '../src/lib/model.mjs';
let pass = 0, fail = 0;
const t = (name, ok) => { ok ? pass++ : fail++; console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}`); };
const throws = fn => { try { fn(); return false; } catch { return true; } };

const pub = loadModel('public'), pre = loadModel('preview');
t('public build publishes no formation that lacks a recorded coaching review', pub.publicFormations.every(f => f.register.content.status === 'reviewed' && f.register.content.reviewedBy && f.register.content.reviewedOn));
t('public build publishes no exploratory formation without a recorded public approval', pub.publicFormations.every(f => !f.register.content.exploratory || f.register.content.publicApproval?.by));
t('preview build includes every formation, marked private', pre.formations.every(f => f.gate.allowed && f.gate.noindex));
t('the draft checklist is blocked from public', !pub.allowed('moving-up-checklist'));
t('verified Moving Up facts may be public', pub.allowed('moving-up'));
t('Cloudflare production branch resolves to public', resolveTarget({ CF_PAGES: '1', CF_PAGES_BRANCH: 'main' }) === 'public');
t('Cloudflare other branches resolve to preview', resolveTarget({ CF_PAGES: '1', CF_PAGES_BRANCH: 'feature/x' }) === 'preview');
t('a non-public build on the production branch is refused', throws(() => resolveTarget({ CF_PAGES: '1', CF_PAGES_BRANCH: 'main', HWP_TARGET: 'preview' })));
t('local builds default to local', resolveTarget({}) === 'local');
t('an unknown target is refused', throws(() => loadModel('staging')));
console.log(`${pass}/${pass + fail} passed`);
process.exitCode = fail ? 1 : 0;
