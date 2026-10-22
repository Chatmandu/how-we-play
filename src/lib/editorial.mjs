/* Editorial helpers shared by the homepage, hub, guide and lesson templates.
 * Review and verification claims are only ever read from the content register. */

/** A coaching review record, or null unless the register holds a reviewed status with both a name and a date. */
export function reviewRecord(reg) {
  const c = reg && reg.content;
  if (!c || c.status !== 'reviewed' || !c.reviewedBy || !c.reviewedOn) return null;
  return { by: c.reviewedBy, on: c.reviewedOn };
}

/** The named coaching reviewer, only where this build may show his profile (confirmation recorded, or a preview build). */
export const REVIEWER = { name: 'David Wilson', profileId: 'profile-david-wilson', href: '/about/#reviewer', short: 'UEFA B Licensed Coach with experience in grassroots and elite football environments' };
export const reviewerVisible = model => model.allowed(REVIEWER.profileId);

/** What's in development: unpublished formation guides by name and status only, then formats not started. */
export function developmentShelf(model) {
  const rows = model.formations
    .filter(f => !reviewRecord(f.register))
    .map(f => ({ name: `${f.name} guide (${f.format})`, status: f.register.content.exploratory ? 'Exploratory draft' : 'In coaching review' }));
  model.site.formats.filter(x => x.availability !== 'live').forEach(x => rows.push({ name: `${x.id} guides`, status: x.note || 'Later' }));
  return rows;
}

/** Step title from a frame tab ("1 · Show them wide" becomes "Show them wide"). */
export const stepTitle = (f, i) => String(f.tab || `Step ${i + 1}`).replace(/^\d+\s*·\s*/, '');
export const pad2 = n => String(n).padStart(2, '0');
const WORDS = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'];
export const word = n => WORDS[n] || String(n);

/* ---------- Issues: How We Play is the publication; each formation is an issue within its format ---------- */
export const issueLabel = f => f.issue ? `Issue ${pad2(f.issue.number)}` : '';
export const issueLine = f => [f.format || '9v9', issueLabel(f), `The ${f.name}`].filter(Boolean).join(' · ');
/** The chapter a rule or a role belongs to, for kickers and navigation. Rules sit in "principles"; roles in "jobs" or a "together" group. */
export function chapterOf(f, { rule, role }) {
  const chs = (f.issue && f.issue.chapters) || [];
  if (rule) return chs.find(c => (c.rules || []).includes(rule));
  return chs.find(c => (c.roles || []).includes(role)) || chs.find(c => (c.groups || []).some(g => g.items.some(i => i.role === role)));
}
/** Formats for the primary navigation, with honest states. */
export const FORMATS_PRIMARY = ['5v5', '7v7', '9v9'];

/** Published formation issues, newest first. The homepage shows only these: complete issues whose coaching
 * review is recorded for the current version and which the gate allows. Lessons, positions, set pieces and
 * other stories are never listed on their own; they live inside their issue. */
export function publishedIssues(model) {
  return model.formations
    .filter(f => f.issue && f.issue.published && reviewRecord(f.register) && f.gate.allowed)
    .sort((a, b) => b.issue.published.localeCompare(a.issue.published) || a.issue.number - b.issue.number);
}
