/* How We Play content model. Pure functions, no file or framework access, so the
 * Astro build and the Node scripts (validation, build checks) share one implementation.
 *
 * Publishing decisions come from design-system/governance/publish-gate.mjs, never from
 * labels in templates. A page asks `access([...ids])` and gets one answer per target.
 */
import { evaluate } from '../../design-system/governance/publish-gate.mjs';

export const TARGETS = ['public', 'preview', 'local'];

/** Which build is this? HWP_TARGET wins. On Cloudflare Pages, the production branch (main) is
 * always public and every other branch is preview, so a missing variable can't leak drafts.
 * Building anything other than public on the production branch is refused. */
export function resolveTarget(env = {}) {
  // Cloudflare Pages sets CF_PAGES_BRANCH; Cloudflare Workers Builds sets WORKERS_CI_BRANCH.
  const branch = env.CF_PAGES ? env.CF_PAGES_BRANCH : (env.WORKERS_CI_BRANCH || null);
  const production = env.HWP_PRODUCTION_BRANCH || 'main';
  // With no variable and no known CI branch, build PUBLIC: an unconfigured build must never contain drafts.
  // `npm run dev` sets HWP_TARGET=local explicitly.
  const target = env.HWP_TARGET || (branch ? (branch === production ? 'public' : 'preview') : 'public');
  if (branch === production && target !== 'public') throw new Error(`Refusing to build "${target}" on the production branch (${production}). Production builds are always public.`);
  return target;
}

export function buildModel({ site, register, facts, formations, checklist }, target = 'local', now = new Date()) {
  if (!TARGETS.includes(target)) throw new Error(`HWP_TARGET must be one of ${TARGETS.join(', ')} (got "${target}")`);
  const factById = Object.fromEntries(facts.facts.map(f => [f.id, f]));
  const expandFact = id => {
    const f = factById[id];
    if (!f) throw new Error(`Unknown fact id "${id}" in content/register.json`);
    return { id: f.id, fact: f.fact, status: f.status, source: facts.sources[f.source].title, checkedOn: f.checkedOn, season: f.season };
  };
  const items = {};
  for (const raw of register) {
    if (items[raw.id]) throw new Error(`Duplicate register id "${raw.id}"`);
    items[raw.id] = raw.factIds ? { ...raw, rules: raw.factIds.map(expandFact) } : raw;
  }
  // Coaching content version: a fingerprint of everything a reviewer approves. A review only counts for the
  // version it was given; any material change to the shape, rules, roles or diagrams needs a further review.
  const versions = Object.fromEntries(formations.map(f => [f.registerId, contentVersion(f)]));
  for (const [id, v] of Object.entries(versions)) {
    const c = items[id] && items[id].content;
    if (c && c.status === 'reviewed' && c.reviewedVersion !== v) {
      items[id] = { ...items[id], content: { ...c, status: 'review-required', staleReview: { reviewedVersion: c.reviewedVersion || null, currentVersion: v } } };
    }
  }
  const gate = Object.fromEntries(Object.values(items).map(i => [i.id, i.kind === 'confirmation' ? confirmationGate(i, target) : evaluate(i, target, { now })]));

  // Formations: the register owns status; the content file must agree, so the two can never drift.
  const list = formations
    .map(f => {
      const reg = items[f.registerId];
      if (!reg) throw new Error(`Formation ${f.id} has no register entry "${f.registerId}"`);
      const a = f.status || {}, b = reg.content || {};
      if (a.content !== (b.staleReview ? 'reviewed' : b.status) || !!a.exploratory !== !!b.exploratory) {
        throw new Error(`Status mismatch for ${f.id}: content file says ${a.content}${a.exploratory ? ' (exploratory)' : ''}, register says ${b.status}${b.exploratory ? ' (exploratory)' : ''}`);
      }
      return { ...f, register: reg, gate: gate[f.registerId], version: versions[f.registerId] };
    })
    .sort((x, y) => x.order - y.order);

  const allowed = id => {
    if (!gate[id]) throw new Error(`Unknown register id "${id}"`);
    return gate[id].allowed;
  };
  /** access(ids): combined decision for a page or section built from several items. */
  const access = (ids = []) => {
    const res = ids.map(id => { allowed(id); return gate[id]; });
    return {
      allowed: res.every(r => r.allowed),
      private: res.some(r => r.watermark),
      noindex: target !== 'public' || res.some(r => r.noindex),
      reasons: res.flatMap(r => r.reasons),
      warnings: res.flatMap(r => r.warnings)
    };
  };
  return {
    target, site, items, gate, facts, factById, checklist,
    formations: list,
    publicFormations: list.filter(f => f.gate.allowed),
    formation: slug => list.find(f => f.slug === slug),
    allowed, access,
    fact: id => { const f = factById[id]; if (!f) throw new Error('Unknown fact ' + id); return { ...f, sourceInfo: facts.sources[f.source] }; }
  };
}

/** Confirmation items (a person's profile, reproduced documents): public only once someone has confirmed them,
 * with a name and a date. Preview builds show them, watermarked. */
export function confirmationGate(item, target) {
  const c = item.confirmation || {};
  const ok = c.status === 'confirmed' && c.confirmedBy && c.confirmedOn;
  if (target === 'public') return { allowed: !!ok, visibility: ok ? 'public' : 'blocked', watermark: false, noindex: false, reasons: ok ? [] : [`${item.title || item.id}: awaiting confirmation`], warnings: [] };
  return { allowed: true, visibility: 'private', watermark: !ok, noindex: true, reasons: [], warnings: [] };
}

/** Short, stable fingerprint of a formation's coaching content (FNV-1a over canonical JSON). */
export function contentVersion(f) {
  const pick = { shape: f.shape, rules: f.rules, roles: f.roles, diagrams: f.diagrams, gives: f.gives, spineText: f.spineText, shapeCue: f.shapeCue, ruleTable: f.ruleTable, roleSummary: f.roleSummary };
  const canon = v => Array.isArray(v) ? '[' + v.map(canon).join(',') + ']' : v && typeof v === 'object' ? '{' + Object.keys(v).sort().map(k => JSON.stringify(k) + ':' + canon(v[k])).join(',') + '}' : JSON.stringify(v ?? null);
  let h = 0x811c9dc5; const s = canon(pick);
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; }
  return 'cv-' + h.toString(16).padStart(8, '0');
}
