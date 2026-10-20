/* Editorial helpers shared by the homepage, hub, guide and lesson templates.
 * Review and verification claims are only ever read from the content register. */

/** A coaching review record, or null unless the register holds a reviewed status with both a name and a date. */
export function reviewRecord(reg) {
  const c = reg && reg.content;
  if (!c || c.status !== 'reviewed' || !c.reviewedBy || !c.reviewedOn) return null;
  return { by: c.reviewedBy, on: c.reviewedOn };
}

/** Reviewer names with a recorded review on at least one coaching item, for the colophon. */
export function recordedReviewers(model) {
  return [...new Set(model.formations.map(f => reviewRecord(f.register)).filter(Boolean).map(r => r.by))];
}

/** Formations not yet reviewed, by name and status only (no shapes, rules or diagrams), plus formats not started. */
export function developmentShelf(model) {
  const rows = model.formations
    .filter(f => !reviewRecord(f.register))
    .map(f => ({ name: `${f.name} guide`, status: f.register.content.exploratory ? 'Exploratory' : 'In review' }));
  const later = model.site.formats.filter(x => x.availability !== 'live').map(x => x.id);
  if (later.length) rows.push({ name: later.join(', '), status: 'Later' });
  return rows;
}

/** Step title from a frame tab ("1 · Show them wide" becomes "Show them wide"). */
export const stepTitle = (f, i) => String(f.tab || `Step ${i + 1}`).replace(/^\d+\s*·\s*/, '');
export const pad2 = n => String(n).padStart(2, '0');
const WORDS = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'];
export const word = n => WORDS[n] || String(n);
