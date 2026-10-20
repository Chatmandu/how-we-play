#!/usr/bin/env node
/* Coaching review records.
 *
 *   node scripts/review.mjs status
 *       Print every coaching item, its current content version and its review state.
 *   node scripts/review.mjs record --id 9v9-3-1-3-1 --by "David Le Tissier" --on 2026-11-02 \
 *       --decision approved|changes-required|rejected [--limitations "text"] [--evidence "email of 2 Nov 2026"]
 *       Adds an entry to the item's reviewLog for the CURRENT content version. Only "approved" with evidence
 *       sets the item to reviewed; the formation file's status is updated to match.
 *   node scripts/review.mjs confirm --id profile-david-le-tissier --by "David Le Tissier" --on 2026-11-02 --evidence "..."
 *       Records a confirmation (reviewer profile, reproduced documents).
 *   node scripts/review.mjs register
 *       Writes docs/CONTENT-REVIEW-REGISTER.md from the register.
 *
 * A review covers one version. Any material change to the shape, rules, roles or diagrams changes the version,
 * and the build then treats the item as awaiting review again.
 */
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { ROOT, loadRaw } from './load-content.mjs';
import { contentVersion, buildModel } from '../src/lib/model.mjs';

const [cmd, ...rest] = process.argv.slice(2);
const arg = k => { const i = rest.indexOf('--' + k); return i >= 0 ? rest[i + 1] : undefined; };
const regPath = join(ROOT, 'content/register.json');
const register = JSON.parse(readFileSync(regPath, 'utf8'));
const raw = loadRaw();
const formationFile = id => { const dir = join(ROOT, 'content/formations'); for (const fmt of readdirSync(dir)) for (const f of readdirSync(join(dir, fmt))) { const p = join(dir, fmt, f); const j = JSON.parse(readFileSync(p, 'utf8')); if (j.registerId === id) return [p, j]; } return [null, null]; };
const save = (p, j) => writeFileSync(p, JSON.stringify(j, null, 2) + '\n');
const urlFor = id => { const f = raw.formations.find(x => x.registerId === id); return f ? `/formations/${f.format || '9v9'}/${f.slug}/` : '—'; };

if (cmd === 'record') {
  const id = arg('id'), by = arg('by'), on = arg('on'), decision = arg('decision'), evidence = arg('evidence');
  if (!id || !by || !/^\d{4}-\d{2}-\d{2}$/.test(on || '') || !['approved', 'changes-required', 'rejected'].includes(decision)) { console.error('Need --id, --by, --on YYYY-MM-DD and --decision approved|changes-required|rejected'); process.exit(1); }
  if (decision === 'approved' && !evidence) { console.error('An approval needs --evidence (where the written approval is kept).'); process.exit(1); }
  const item = register.find(x => x.id === id); if (!item || item.kind !== 'coaching') { console.error('No coaching item ' + id); process.exit(1); }
  const [fp, fj] = formationFile(id);
  const version = fj ? contentVersion(fj) : null;
  item.content.reviewLog = [...(item.content.reviewLog || []), { version, reviewer: by, date: on, decision, limitations: arg('limitations') || null, evidence: evidence || null }];
  if (decision === 'approved') Object.assign(item.content, { status: 'reviewed', reviewedBy: by, reviewedOn: on, reviewedVersion: version });
  else Object.assign(item.content, { status: 'review-required', reviewedBy: null, reviewedOn: null, reviewedVersion: null });
  save(regPath, register);
  if (fj) { fj.status = { ...fj.status, content: item.content.status, reviewedBy: item.content.reviewedBy, reviewedOn: item.content.reviewedOn }; save(fp, fj); }
  console.log(`Recorded ${decision} for ${id} at ${version}.`);
} else if (cmd === 'confirm') {
  const id = arg('id'), by = arg('by'), on = arg('on'), evidence = arg('evidence');
  const item = register.find(x => x.id === id);
  if (!item || item.kind !== 'confirmation' || !by || !on || !evidence) { console.error('Need a confirmation --id, --by, --on and --evidence'); process.exit(1); }
  Object.assign(item.confirmation, { status: 'confirmed', confirmedBy: by, confirmedOn: on, evidence });
  save(regPath, register); console.log(`Confirmed ${id}.`);
} else if (cmd === 'status' || cmd === 'register') {
  const pub = buildModel(raw, 'public');
  const rows = register.filter(x => x.kind === 'coaching' || x.kind === 'confirmation').map(x => {
    const fj = raw.formations.find(f => f.registerId === x.id);
    const v = fj ? contentVersion(fj) : '—';
    const c = x.content || {}, k = x.confirmation || {};
    const state = x.kind === 'confirmation' ? (k.status === 'confirmed' ? `Confirmed by ${k.confirmedBy}, ${k.confirmedOn}` : 'Awaiting confirmation')
      : c.status === 'reviewed' ? (c.reviewedVersion === v ? `Reviewed by ${c.reviewedBy}, ${c.reviewedOn}` : `Review out of date (reviewed ${c.reviewedVersion || '—'})`) : ({ 'review-required': 'Awaiting coaching review', draft: 'Draft' }[c.status] || c.status);
    return { id: x.id, title: x.title, url: x.kind === 'coaching' ? urlFor(x.id) : '/about/', version: v, state, public: pub.gate[x.id].allowed ? 'Yes' : 'No', reviewer: c.reviewer || k.scope || '', log: c.reviewLog || [], history: c.history || [] };
  });
  if (cmd === 'status') { console.table(rows.map(({ log, history, reviewer, ...r }) => r)); process.exit(0); }
  const md = [
    '# Content-review register', '',
    `Generated by \`node scripts/review.mjs register\` from \`content/register.json\`. Do not edit by hand.`, '',
    'Three separate tracks: **coaching review** (David Le Tissier, intended reviewer), **confirmations** (people and reproduced documents) and **official rules** (checked against England Football; see `content/editorial/format-facts.json`). One never stands in for another.', '',
    '| Item | URL | Content version | Status | Public |', '|---|---|---|---|---|',
    ...rows.map(r => `| ${r.title} | ${r.url} | ${r.version} | ${r.state} | ${r.public} |`), '',
    '## Review log', '',
    ...rows.flatMap(r => [`### ${r.title}`, '', r.reviewer ? `Reviewer or scope: ${r.reviewer}` : '', '',
      r.log.length ? '| Version | Reviewer | Date | Decision | Limitations or amendments | Evidence |\n|---|---|---|---|---|---|\n' + r.log.map(l => `| ${l.version} | ${l.reviewer} | ${l.date} | ${l.decision} | ${l.limitations || '—'} | ${l.evidence || '—'} |`).join('\n') : 'No review recorded.', '',
      ...r.history.map(h => `- ${h.on}: ${h.note}`), '']),
    '## How to record a review', '',
    '```', 'node scripts/review.mjs record --id 9v9-3-1-3-1 --by "David Le Tissier" --on 2026-11-02 \\', '  --decision approved --evidence "Email from David, 2 Nov 2026, filed in project records" \\', '  --limitations "None"', 'npm run review:register', '```', '',
    'A review applies to the content version shown. Changing the shape, rules, roles or diagrams changes the version and the guide goes back to awaiting review automatically.'
  ].join('\n');
  writeFileSync(join(ROOT, 'docs/CONTENT-REVIEW-REGISTER.md'), md + '\n'); console.log('Wrote docs/CONTENT-REVIEW-REGISTER.md');
} else { console.error('Usage: node scripts/review.mjs status|record|confirm|register'); process.exit(1); }
