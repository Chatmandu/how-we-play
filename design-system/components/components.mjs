/* How We Play components v1.0. Framework-free: every function returns an HTML string.
 * Pair with components.css and behaviours.mjs (progressive enhancement). Works with any server or static generator.
 * Content never lives here: pass data in. Coaching status is shown via the governance labels.
 */
import { renderPitch, renderKey, usedSymbols, validate } from '../diagrams/renderer.mjs';

let ASSETS = '/hwp-design-system/assets/';
export function configure(o = {}) { if (o.assetBase) ASSETS = o.assetBase.replace(/\/?$/, '/'); }
const longDate = iso => /^\d{4}-\d{2}-\d{2}$/.test(iso) ? new Date(iso + 'T12:00:00Z').toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }) : iso;
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
let n = 0; const uid = p => `${p}-${++n}`;
export const icon = (name, label) => `<svg class="hwp-icon" ${label ? `role="img" aria-label="${esc(label)}"` : 'aria-hidden="true" focusable="false"'}><use href="${ASSETS}icons/sprite.svg#hwp-icon-${esc(name)}"/></svg>`;

/* ---------- Navigation ---------- */
export function header({ items = [], current, newsletterHref = '#newsletter', formats, activeFormat } = {}) {
  const id = uid('hwp-mnav');
  const links = items.map(i => `<a href="${esc(i.href)}"${i.id === current ? ' aria-current="page"' : ''}>${esc(i.label)}</a>`).join('');
  return `<header class="hwp-header hwp-container">
  <div class="hwp-header__bar">
    <a class="hwp-header__logo" href="/"><img src="${ASSETS}logo/hwp-lockup-inline.svg" alt="How We Play Football, home" width="236" height="44"></a>
    <nav class="hwp-nav" aria-label="Main">${links}<a class="hwp-btn hwp-btn--secondary" href="${esc(newsletterHref)}" style="padding:0 14px;min-height:40px">Newsletter</a></nav>
    <button class="hwp-nav__toggle" aria-expanded="false" aria-controls="${id}" data-hwp="nav-toggle">${icon('menu')}<span>Menu</span></button>
  </div>
  <nav class="hwp-mobile-nav" id="${id}" aria-label="Main" hidden>${links}<a href="${esc(newsletterHref)}">Newsletter</a></nav>
  ${formats ? formatStrip(formats, activeFormat) : ''}
</header>`;
}
/** formats: [{ id:'9v9', ages:'U12–U13', note:'3 formations', href?, soon? }] */
export function formatStrip(formats, active) {
  return `<nav class="hwp-format-strip" aria-label="Formats">${formats.map(f => f.soon
    ? `<span><b>${esc(f.id)}</b><small>${esc(f.ages)} · coming later</small></span>`
    : `<a href="${esc(f.href || '#')}"${f.id === active ? ' aria-current="true"' : ''}><b>${esc(f.id)}</b><small>${esc(f.ages)}${f.note ? ' · ' + esc(f.note) : ''}</small></a>`).join('')}</nav>`;
}
export function breadcrumbs(items) {
  return `<nav class="hwp-breadcrumbs" aria-label="Breadcrumb"><ol>${items.map((i, k) => k === items.length - 1 ? `<li><span aria-current="page">${esc(i.label)}</span></li>` : `<li><a href="${esc(i.href)}">${esc(i.label)}</a></li>`).join('')}</ol></nav>`;
}
export function inPageNav(items, label = 'On this page') {
  return `<nav class="hwp-inpage" aria-label="${esc(label)}"><span class="hwp-label">${esc(label)}</span><ol>${items.map(i => `<li><a href="#${esc(i.id)}">${esc(i.label)}</a></li>`).join('')}</ol></nav>`;
}
export function footer({ columns = [] } = {}) {
  return `<footer class="hwp-footer"><div class="hwp-container"><div class="hwp-footer__grid">
  <div><img src="${ASSETS}logo/hwp-lockup-inline-reverse.svg" alt="How We Play Football" width="236" height="44"><p class="hwp-small">Helping your team take the next step.</p></div>
  ${columns.map(c => `<div><p class="hwp-label">${esc(c.title)}</p><ul style="list-style:none;padding:0;margin:8px 0 0;display:grid;gap:8px">${c.links.map(l => `<li><a href="${esc(l.href)}">${esc(l.label)}</a></li>`).join('')}</ul></div>`).join('')}
  </div><small>How We Play Football is an independent project. It is not affiliated with or endorsed by The FA or England Football. Official rules link to their source with the date we checked them.</small></div></footer>`;
}

/* ---------- Editorial ---------- */
export function pageHeading({ over, title, number, standfirst: sf, chips = '' }) {
  return `<div class="hwp-page-heading">${over ? `<p class="hwp-label" style="color:var(--hwp-text-link)">${esc(over)}</p>` : ''}
  <div class="hwp-page-heading__row">${number ? `<span class="hwp-big-number" aria-hidden="true">${esc(number)}</span>` : ''}<h1 class="hwp-heading-l">${esc(title)}</h1></div>
  ${sf ? standfirst(sf) : ''}${chips}</div>`;
}
export const standfirst = t => `<p class="hwp-standfirst">${esc(t)}</p>`;
export const sectionDivider = (label, aside = '') => `<div class="hwp-section-divider hwp-rule-section"><span class="hwp-label">${esc(label)}</span>${aside ? `<span class="hwp-label hwp-secondary">${esc(aside)}</span>` : ''}</div>`;
export function cue({ label = 'Say it on the touchline', text, extra }) {
  return `<blockquote class="hwp-cue-block hwp-rule-cue" style="margin:0"><p class="hwp-label hwp-cue__label">${esc(label)}</p><p class="hwp-cue" style="margin:0">${esc(text)}</p>${extra ? `<p class="hwp-small" style="margin:0">${esc(extra)}</p>` : ''}</blockquote>`;
}
export const caption = t => `<p class="hwp-caption" style="margin:0">${esc(t)}</p>`;
export function relatedLinks(items, title = 'Related') {
  return `<section class="hwp-related" aria-label="${esc(title)}">${sectionDivider(title)}${items.map(i => `<a href="${esc(i.href)}"><span><b>${esc(i.title)}</b><br><span class="hwp-small hwp-secondary">${esc(i.meta || '')}</span></span>${icon('arrow-right')}</a>`).join('')}</section>`;
}

/* ---------- Buttons ---------- */
export function button({ label, href, variant = 'primary', iconName, iconAfter, type = 'button', attrs = '' }) {
  const inner = `${iconName ? icon(iconName) : ''}<span>${esc(label)}</span>${iconAfter ? icon(iconAfter) : ''}`;
  return href ? `<a class="hwp-btn hwp-btn--${variant}" href="${esc(href)}" ${attrs}>${inner}</a>` : `<button class="hwp-btn hwp-btn--${variant}" type="${type}" ${attrs}>${inner}</button>`;
}

/* ---------- Status and governance ---------- */
/** statusChips(item): content review, exploratory, official rules and availability. Kept as separate chips. */
export function statusChips(item = {}) {
  const c = item.content || item.status || {}, out = [];
  if (item.availability === 'coming-soon') out.push(['soon', 'Coming soon']);
  const st = c.status || c.content;
  if (st === 'draft') out.push(['draft', 'Draft']);
  if (st === 'review-required') out.push(['review', 'Coaching review required']);
  if (st === 'reviewed') out.push(['reviewed', `✓ Coaching reviewed${c.reviewedOn ? ' · ' + longDate(c.reviewedOn) : ''}`]);
  if (c.exploratory && !c.publicApproval) out.push(['exploratory', 'Exploratory']);
  (item.rules || []).forEach(r => out.push(r.status === 'verified' ? ['verified', `Official rule verified · ${r.checkedOn || ''}`] : ['review', `Rule not yet checked: ${r.fact}`]));
  return `<div class="hwp-chips">${out.map(([k, t]) => `<span class="hwp-chip hwp-chip--${k}">${esc(t)}</span>`).join('')}</div>`;
}
export const reviewNote = (head, text) => `<div class="hwp-review-note" role="note"><strong>${esc(head)}</strong> ${esc(text)}</div>`;
export const exploratoryStrip = () => `<div class="hwp-strip hwp-strip--exploratory" role="note">Exploratory · not reviewed coaching guidance</div>`;
export const privateStrip = () => `<div class="hwp-strip hwp-strip--private" role="note">${icon('lock')}Private preview · not for publication</div>`;

/* ---------- Tactical figures ---------- */
const verdictOf = f => f.stage ? ['stage', `Stage ${f.stage} of ${f.of || '?'}`] : f.verdict === 'wrong' ? ['wrong', '✕ Wrong'] : f.verdict === 'right' ? ['right', '✓ Right'] : null;

/**
 * diagramFigure({ frames, theme, view, label, pitch, sequence, exploratory, private, enlarge, key })
 * frames: diagram objects from the content layer (each with tab, caption, verdict or stage).
 * Renders tabs and panels server-side. behaviours.mjs adds keyboard tabs, Enlarge and Key dialogs, and sequence playback.
 * The frames are also embedded as JSON so video and animation tools reuse the same data.
 */
export function diagramFigure(o) {
  const id = uid('hwp-fig'), frames = o.frames, theme = o.theme || 'blue', light = theme !== 'blue';
  frames.forEach((f, i) => { if (o.sequence) { f.stage = f.stage || i + 1; f.of = frames.length; } });
  const tabs = frames.length > 1 ? `<div class="hwp-tabs" role="tablist" aria-label="${esc(o.label || 'Diagram views')}">${frames.map((f, i) => `<button role="tab" id="${id}-t${i}" aria-controls="${id}-p${i}" aria-selected="${i === 0}" tabindex="${i === 0 ? 0 : -1}">${esc(f.tab || 'View ' + (i + 1))}</button>`).join('')}</div>` : '';
  const panels = frames.map((f, i) => {
    const v = verdictOf(f);
    return `<div class="hwp-tabpanel" role="${frames.length > 1 ? 'tabpanel' : 'group'}" id="${id}-p${i}" ${frames.length > 1 ? `aria-labelledby="${id}-t${i}"` : ''} ${i ? 'hidden' : ''} data-symbols="${usedSymbols(f).join(' ')}">
      <div class="hwp-figure__stage">${renderPitch(f, { theme, view: o.view, pitch: o.pitch, interactive: !!o.interactive })}</div>
      <div class="hwp-figure__foot">${v ? `<span class="hwp-verdict hwp-verdict--${v[0]}">${esc(v[1])}</span>` : ''}<p class="hwp-caption" style="margin:0">${esc(f.caption || '')}</p></div>
      ${f.note ? `<p class="hwp-small" style="margin:0">! ${esc(f.note)}</p>` : ''}</div>`;
  }).join('');
  return `<figure class="hwp-figure${light ? ' hwp-figure--light' : ' hwp-on-pitch'}${o.exploratory ? ' hwp-exploratory-frame' : ''}" data-hwp="figure" data-theme="${esc(theme)}" id="${id}">
  ${o.private ? privateStrip() : ''}${o.exploratory ? exploratoryStrip() : ''}
  ${o.figLabel ? `<div class="hwp-figure__head"><span class="hwp-label">${esc(o.figLabel)}</span>${o.context ? `<span class="hwp-label">${esc(o.context)}</span>` : ''}</div>` : ''}
  ${tabs}${panels}
  <div class="hwp-figure__tools">${o.enlarge !== false ? `<button type="button" data-hwp="enlarge">${icon('enlarge')}Enlarge</button>` : '<span></span>'}${o.sequence ? `<span class="hwp-sequence__controls"><button type="button" data-hwp="seq-prev" aria-label="Previous stage">${icon('step-prev')}</button><button type="button" data-hwp="seq-play">${icon('play')}Play</button><button type="button" data-hwp="seq-next" aria-label="Next stage">${icon('step-next')}</button></span>` : ''}${o.key !== false ? `<button type="button" data-hwp="key">${icon('key')}Key</button>` : ''}</div>
  <script type="application/json" data-hwp-frames>${JSON.stringify({ theme, view: o.view || null, pitch: o.pitch || '9v9', frames }).replace(/</g, '\\u003c')}</script>
</figure>`;
}
/** wrongRight(wrongFrame, rightFrame): static side-by-side comparison, each with its verdict. */
export function wrongRight(w, r, o = {}) {
  const cell = f => `<figure class="hwp-figure${o.theme && o.theme !== 'blue' ? ' hwp-figure--light' : ''}" style="padding:12px">${renderPitch(f, { theme: o.theme || 'blue', view: o.view })}<div class="hwp-figure__foot"><span class="hwp-verdict hwp-verdict--${f.verdict}">${f.verdict === 'wrong' ? '✕ Wrong' : '✓ Right'}</span><p class="hwp-caption" style="margin:0">${esc(f.caption)}</p></div></figure>`;
  return `<div class="hwp-compare">${cell(w)}${cell(r)}</div>`;
}
/** preview(frame, href, title, meta): compact thumbnail (numbers and labels off) linking to the full diagram. */
export function preview(f, { href, title, meta, view } = {}) {
  return `<a class="hwp-preview" href="${esc(href || '#')}"><span class="hwp-preview__thumb">${renderPitch(f, { theme: 'blue', numbers: false, labels: false, notes: false, spine: false, view })}</span><span><b>${esc(title)}</b><br><span class="hwp-small hwp-secondary">${esc(meta || 'Open the full diagram')}</span></span></a>`;
}
export const key = (symbols, theme = 'blue') => renderKey(symbols, { theme });

/* ---------- Formations ---------- */
/** formations: [{ id, name, href, statusText, exploratory }] */
export function formationSelector(formations, current) {
  return `<nav class="hwp-formation-select" aria-label="9v9 formations">${formations.map(f => `<a href="${esc(f.href)}"${f.id === current ? ' aria-current="true"' : ''}${f.exploratory ? ' data-exploratory' : ''}><b>${esc(f.name)}</b><span class="hwp-small">${f.exploratory ? '<span class="hwp-chip hwp-chip--exploratory">Exploratory</span> ' : ''}${esc(f.statusText || '')}</span></a>`).join('')}</nav>`;
}
/** formationComparison(formations): ≤3 panels. Each: { name, notation, shape, facts:[[term, def]], chips } */
export function formationComparison(list) {
  return `<div class="hwp-compare-panels">${list.slice(0, 3).map(f => `<article class="hwp-compare-panel${f.exploratory ? ' hwp-exploratory-frame' : ''}"><div class="hwp-compare-panel__pitch">${renderPitch(f.shape, { theme: 'blue', labels: false })}</div><div class="hwp-compare-panel__body"><h3 class="hwp-heading-m">${esc(f.name)}</h3>${f.chips || ''}<dl>${(f.facts || []).map(([t, d]) => `<dt>${esc(t)}</dt><dd>${esc(d)}</dd>`).join('')}</dl>${f.href ? `<a class="hwp-golink" href="${esc(f.href)}">Open ${esc(f.name)} →</a>` : ''}</div></article>`).join('')}</div>`;
}

/* ---------- Interactive ---------- */
export const disclosure = (summary, bodyHtml, open) => `<details class="hwp-disclosure"${open ? ' open' : ''}><summary>${esc(summary)}</summary><div>${bodyHtml}</div></details>`;
export function checklist(items, { id = uid('hwp-check'), title } = {}) {
  return `<div class="hwp-stack" data-hwp="checklist" data-store="${esc(id)}">${title ? `<div class="hwp-section-divider hwp-rule-section"><span class="hwp-label">${esc(title)}</span><span class="hwp-checklist__count" aria-live="polite"></span></div>` : ''}<ul class="hwp-checklist">${items.map((t, i) => `<li><label><input type="checkbox" name="${esc(id)}-${i}"><span>${esc(t)}</span></label></li>`).join('')}</ul></div>`;
}
export function newsletterForm({ action = '#', formats = ['3v3', '5v5', '7v7', '9v9', '11v11', 'Other'] } = {}) {
  const id = uid('hwp-nl');
  return `<form class="hwp-newsletter" action="${esc(action)}" method="post" novalidate data-hwp="newsletter" aria-labelledby="${id}-h">
  <div><h2 class="hwp-heading-m" id="${id}-h">Get the next guide by email</h2><p class="hwp-small" style="margin:6px 0 0">[Placeholder copy, needs approval] One email when a new guide is ready.</p></div>
  <div class="hwp-field"><label for="${id}-e">Email address</label><input class="hwp-input" id="${id}-e" name="email" type="email" autocomplete="email" aria-describedby="${id}-ee" required><span class="hwp-error" id="${id}-ee"></span></div>
  <div class="hwp-field"><label for="${id}-f">Which format does your team play now? <span class="hwp-hint">(optional)</span></label><select class="hwp-select" id="${id}-f" name="format"><option value="">Choose a format</option>${formats.map(f => `<option>${esc(f)}</option>`).join('')}</select></div>
  <div class="hwp-field"><label style="display:flex;gap:10px;align-items:flex-start;font-weight:400"><input type="checkbox" name="consent" required style="width:22px;height:22px;margin:0;flex:none" aria-describedby="${id}-ce"><span>Yes, email me about new How We Play Football guides. I can unsubscribe at any time.</span></label><span class="hwp-error" id="${id}-ce"></span></div>
  <div>${button({ label: 'Sign up', type: 'submit', variant: 'primary', attrs: 'style="background:var(--hwp-surface-pitch);color:var(--hwp-text-on-pitch)"' })}</div>
  <div data-hwp="nl-status" aria-live="polite"></div>
</form>`;
}
export function feedback(type, text) {
  return `<div class="hwp-feedback hwp-feedback--${type}" role="${type === 'error' ? 'alert' : 'status'}">${icon(type === 'error' ? 'warning' : 'right')}<span><strong>${type === 'error' ? 'There is a problem: ' : 'Done: '}</strong>${esc(text)}</span></div>`;
}

export { validate };
