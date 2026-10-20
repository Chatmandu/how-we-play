/* Editorial helpers shared by the homepage, hub, guide and lesson templates.
 * Review and verification claims are only ever read from the content register. */

/** A coaching review record, or null unless the register holds a reviewed status with both a name and a date. */
export function reviewRecord(reg) {
  const c = reg && reg.content;
  if (!c || c.status !== 'reviewed' || !c.reviewedBy || !c.reviewedOn) return null;
  return { by: c.reviewedBy, on: c.reviewedOn };
}

/** The named coaching reviewer, only where this build may show his profile (confirmation recorded, or a preview build). */
export const REVIEWER = { name: 'David Le Tissier', profileId: 'profile-david-le-tissier', href: '/about/#reviewer' };
export const reviewerVisible = model => model.allowed(REVIEWER.profileId);

/** What's in development: unpublished formation guides by name and status only, then formats not started. */
export function developmentShelf(model) {
  const rows = model.formations
    .filter(f => !reviewRecord(f.register))
    .map(f => ({ name: `${f.name} guide (9v9)`, status: f.register.content.exploratory ? 'Exploratory draft' : 'In coaching review' }));
  model.site.formats.filter(x => x.availability !== 'live').forEach(x => rows.push({ name: `${x.id} guides`, status: x.note || 'Later' }));
  return rows;
}

/** Step title from a frame tab ("1 · Show them wide" becomes "Show them wide"). */
export const stepTitle = (f, i) => String(f.tab || `Step ${i + 1}`).replace(/^\d+\s*·\s*/, '');
export const pad2 = n => String(n).padStart(2, '0');
const WORDS = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'];
export const word = n => WORDS[n] || String(n);
