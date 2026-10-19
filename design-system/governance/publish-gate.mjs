// How We Play publishing gate v1.0. Zero dependencies, ESM, runs in Node and browsers.
// Purpose: unreviewed coaching advice can never reach a public build just because it carries a status label.
// Three independent tracks: design approval, coaching-content review, official-rule verification.

export const CONTENT_STATUS = ['draft', 'review-required', 'reviewed'];
export const RULE_STATUS = ['unchecked', 'verified'];
export const DESIGN_STATUS = ['proposed', 'approved'];
export const TARGETS = ['public', 'preview', 'local'];

// Display labels for the status components (brief §4).
export const LABELS = {
  draft: 'Draft',
  'review-required': 'Coaching review required',
  reviewed: 'Coaching reviewed',
  verified: 'Official rule verified',
  'coming-soon': 'Coming soon',
  exploratory: 'Exploratory',
  private: 'Private preview, not for publication'
};

/**
 * evaluate(item, target, { now }) -> { allowed, visibility, watermark, noindex, reasons[], warnings[] }
 * item = {
 *   id, kind: 'coaching' | 'rule-fact' | 'editorial' | 'template',
 *   design:  { status },
 *   content: { status, exploratory, reviewedBy, reviewedOn, publicApproval? },  // coaching only
 *   rules:   [{ fact, status, source, checkedOn, season }]                     // official facts used on the page
 *   availability?: 'live' | 'coming-soon'
 * }
 */
export function evaluate(item, target, opts = {}) {
  if (!TARGETS.includes(target)) throw new Error('Unknown target: ' + target);
  const reasons = [], warnings = [];
  const c = item.content || {};
  const season = opts.season || currentSeason(opts.now || new Date());

  if (item.availability === 'coming-soon') {
    return { allowed: target !== 'public' || !item.hasBody, visibility: 'teaser', watermark: false, noindex: false,
      reasons: item.hasBody && target === 'public' ? ['Coming-soon items may show a teaser only, not body content'] : [], warnings };
  }

  if (target === 'public') {
    if (item.design && item.design.status !== 'approved') reasons.push('Design not approved for this template');
    if (item.kind === 'coaching') {
      if (c.status !== 'reviewed') reasons.push(`Coaching content is "${LABELS[c.status] || c.status}". Only "Coaching reviewed" may be public.`);
      if (c.status === 'reviewed' && (!c.reviewedBy || !c.reviewedOn)) reasons.push('Reviewed content must record reviewer and date');
      if (c.exploratory && !(c.publicApproval && c.publicApproval.by && c.publicApproval.on)) reasons.push('Exploratory content needs an explicit, recorded public approval in addition to review');
    }
    (item.rules || []).forEach(r => {
      if (r.status !== 'verified') reasons.push(`Official rule not verified: ${r.fact}`);
      else if (r.season && r.season !== season) warnings.push(`Rule "${r.fact}" verified for ${r.season}; recheck for ${season}`);
    });
    return { allowed: reasons.length === 0, visibility: reasons.length ? 'blocked' : 'public', watermark: false, noindex: false, reasons, warnings };
  }

  // preview (password-protected staging) and local: allowed, but always marked and never indexed
  const unreviewed = item.kind === 'coaching' && c.status !== 'reviewed';
  return { allowed: true, visibility: 'private', watermark: unreviewed || !!c.exploratory, noindex: true, reasons, warnings };
}

export function currentSeason(d) { const y = d.getFullYear(), m = d.getMonth(); const s = m >= 6 ? y : y - 1; return `${s}/${String((s + 1) % 100).padStart(2, '0')}`; }

// Build helper: filter a content collection for a target and throw on misconfiguration.
export function gate(items, target, opts) {
  const results = items.map(i => ({ id: i.id, ...evaluate(i, target, opts) }));
  return { publish: items.filter((_, n) => results[n].allowed), blocked: results.filter(r => !r.allowed), results };
}
