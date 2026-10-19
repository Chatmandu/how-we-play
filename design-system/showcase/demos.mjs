/* Showcase demos: compose real components with real content. Shared by components.html and frame.html. */
import * as C from '../components/components.mjs';
import * as R from '../diagrams/renderer.mjs';
import * as G from '../governance/publish-gate.mjs';
import { resolve } from '../tokens/build-lib.mjs';

C.configure({ assetBase: '../assets/' });
const NOW = new Date('2026-10-19');

export async function loadData() {
  const j = p => fetch('../' + p).then(r => { if (!r.ok) throw new Error(p + ' ' + r.status); return r.json(); });
  const [f3131, f332, f2231, register, tokens, checklist] = await Promise.all([j('../content/formations/9v9/3-1-3-1.json'), j('../content/formations/9v9/3-3-2.private.json'), j('../content/formations/9v9/2-2-3-1.private.json'), j('../content/register.json'), j('tokens/tokens.json'), j('../content/editorial/moving-up-checklist.json')]);
  return { f3131, f332, f2231, register, flat: resolve(tokens), checklist, content: { '3-1-3-1': f3131, '3-3-2': f332, '2-2-3-1': f2231 } };
}

export const target = () => new URLSearchParams(location.search).get('mode') === 'public' ? 'public' : 'preview';
const reg = (D, id) => D.register.find(i => i.id === id);
/** gated(D, id, html): returns html if the publish gate allows it for the current target, else a placeholder. */
export function gated(D, id, html) {
  const item = reg(D, id), res = G.evaluate(item, target(), { now: NOW });
  if (!res.allowed) return `<div class="hwp-review-note" role="note"><strong>Not published:</strong> ${item.title}. ${res.reasons.join(' ')} <span class="hwp-secondary">(Public build view. Switch to Private preview to see it.)</span></div>`;
  return (res.watermark ? C.privateStrip() : '') + html;
}
const frames = (c, set) => c.diagrams[set].frames;
const rule = (c, id) => c.rules.find(r => r.id === id);

const FORMATS = [{ id: '5v5', ages: 'U8–U9', soon: true }, { id: '7v7', ages: 'U10–U11', soon: true }, { id: '9v9', ages: 'U12–U13', note: '3 formations', href: '#' }, { id: '11v11', ages: 'U14+', soon: true }];
const NAV = [{ id: '9v9', label: '9v9', href: '#' }, { id: 'up', label: 'Moving up', href: '#' }, { id: 'other', label: 'Other formats', href: '#' }, { id: 'about', label: 'About', href: '#' }];
export const headerDemo = () => C.header({ items: NAV, current: '9v9', formats: FORMATS, activeFormat: '9v9' });

export function lesson3131(D) {
  const c = D.f3131, r = rule(c, 'one-goes-one-stays');
  return gated(D, '9v9-3-1-3-1', `<article class="hwp-stack" style="gap:20px">
    ${C.breadcrumbs([{ label: '9v9', href: '#' }, { label: '3-1-3-1', href: '#' }, { label: 'Rule 2' }])}
    ${C.pageHeading({ over: '9v9 · 3-1-3-1 · Rule 2 of 4', number: '02', title: r.title, standfirst: r.tag, chips: C.statusChips({ status: c.status }) })}
    <div class="hwp-split" style="align-items:start">
      ${C.diagramFigure({ frames: JSON.parse(JSON.stringify(frames(c, 'one-goes'))), label: 'One goes, one stays views', figLabel: 'Fig. 2 · One goes, one stays', context: 'Playbook p. 4' })}
      <div class="hwp-stack">
        <p class="hwp-body" style="margin:0">${r.summary}</p>
        ${C.cue({ text: r.cue, extra: r.extra })}
        ${C.sectionDivider('What to look for')}
        <ol class="hwp-small" style="margin:0;padding-left:20px;display:grid;gap:6px">${r.look.map(l => `<li>${l}</li>`).join('')}</ol>
        ${C.reviewNote('Needs coach review:', c.review.find(x => x.id === 'three-forwards').qs[0])}
        <p class="hwp-small hwp-secondary" style="margin:0">Redrawn from the source playbook, ${r.src}. Pictures show ideas, not fixed moves.</p>
      </div>
    </div></article>`);
}
export function lesson332(D) {
  const c = D.f332, r = c.rules[0];
  return gated(D, '9v9-3-3-2', `<article class="hwp-stack">${C.pageHeading({ over: '9v9 · 3-3-2 · Rule 3', title: r.title, standfirst: r.tag, chips: C.statusChips({ status: c.status }) })}
    ${C.diagramFigure({ frames: JSON.parse(JSON.stringify(frames(c, 'one-comes'))), figLabel: 'Draft fig. · One comes, one goes', context: r.src, private: true })}
    ${C.cue({ text: r.cue, extra: r.extra })}${C.reviewNote('Offside, to check:', 'the offside line is drawn for context only. A checked, child-friendly offside section is required before release.')}</article>`);
}
export function lesson2231(D) {
  const c = D.f2231, r = c.rules[0];
  return gated(D, '9v9-2-2-3-1', `<article class="hwp-stack">${C.pageHeading({ over: '9v9 · 2-2-3-1 · Rule 4', title: r.title, standfirst: r.tag, chips: C.statusChips({ status: c.status }) })}
    ${C.diagramFigure({ frames: JSON.parse(JSON.stringify(frames(c, 'wb-recovery'))), figLabel: 'Draft sequence · wing-back recovery', context: r.src, sequence: true, exploratory: true, private: true })}
    ${C.cue({ text: r.cue, extra: r.extra })}${C.reviewNote('Reviewer question:', c.review[0].qs[0])}</article>`);
}
export function formationsDemo(D) {
  const pub = target() === 'public';
  const list = [
    { id: '3-1-3-1', reg: '9v9-3-1-3-1', name: '3-1-3-1', href: '#', statusText: 'From the playbook · review required', c: D.f3131, facts: [['Notation', '1-3-1-3-1'], ['Back', '3 (3, 5, 2) + screen 6'], ['Front', '11, 10, 7 and 9'], ['Source', 'Playbook p. 1']] },
    { id: '3-3-2', reg: '9v9-3-3-2', name: '3-3-2', href: '#', statusText: 'Research draft · review required', c: D.f332, facts: [['Notation', '1-3-3-2'], ['Back', '3 (3, 5, 2)'], ['Front', '11, 8, 7 and 9, 10'], ['Source', 'Draft 0.1, p. 1']] },
    { id: '2-2-3-1', reg: '9v9-2-2-3-1', name: '2-2-3-1', href: '#', statusText: 'Not reviewed', exploratory: true, c: D.f2231, facts: [['Notation', '1-2-2-3-1'], ['Back', '4, 5 + wing-backs 3, 2'], ['Front', '11, 6, 8 and 9'], ['Source', 'Draft 0.1, p. 1']] }
  ].filter(f => !pub || G.evaluate(reg(D, f.reg), 'public', { now: NOW }).allowed);
  if (!list.length) return `<div class="hwp-review-note" role="note"><strong>Public build:</strong> no 9v9 formation has passed coaching review yet, so the selector and comparison show nothing. This is the gate working as intended.</div>`;
  return `<div class="hwp-stack" style="gap:24px">${C.formationSelector(list, '3-1-3-1')}${C.formationComparison(list.map(f => ({ name: f.name, shape: f.c.shape, facts: f.facts, exploratory: f.exploratory, chips: C.statusChips({ status: f.c.status }), href: '#' })))}</div>`;
}
export function checklistDemo(D) {
  return D.checklist.groups.map(g => C.checklist(g.items.map(i => i.text), { id: 'demo-' + g.heading.replace(/\W+/g, '-').toLowerCase(), title: g.heading })).join('');
}
export const DEMOS = { header: () => headerDemo(), lesson3131, lesson332, lesson2231, formations: formationsDemo };
export { C, R, G, NOW };
