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
  const branch = env.CF_PAGES ? env.CF_PAGES_BRANCH : null;
  const production = env.HWP_PRODUCTION_BRANCH || 'main';
  const target = env.HWP_TARGET || (branch ? (branch === production ? 'public' : 'preview') : 'local');
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
  const gate = Object.fromEntries(Object.values(items).map(i => [i.id, evaluate(i, target, { now })]));

  // Formations: the register owns status; the content file must agree, so the two can never drift.
  const list = formations
    .map(f => {
      const reg = items[f.registerId];
      if (!reg) throw new Error(`Formation ${f.id} has no register entry "${f.registerId}"`);
      const a = f.status || {}, b = reg.content || {};
      if (a.content !== b.status || !!a.exploratory !== !!b.exploratory) {
        throw new Error(`Status mismatch for ${f.id}: content file says ${a.content}${a.exploratory ? ' (exploratory)' : ''}, register says ${b.status}${b.exploratory ? ' (exploratory)' : ''}`);
      }
      return { ...f, register: reg, gate: gate[f.registerId] };
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
