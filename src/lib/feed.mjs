/* Latest additions: structured items from content/editorial/feed.json, filtered by the publishing gate.
 * An item shows only when every register id it requires is allowed in this build. Newest first. */
import feed from '../../content/editorial/feed.json';
const TYPE = { issue: 'Formation issue', lesson: 'Tactical lesson', position: 'Positional guide', 'moving-up': 'Moving up', feature: 'Feature', video: 'Video', download: 'Download' };
export function latest(model, limit = 6) {
  return feed.items
    .filter(i => (i.requires || []).every(id => model.allowed(id)))
    .sort((a, b) => b.published.localeCompare(a.published))
    .slice(0, limit)
    .map(i => ({ ...i, typeLabel: TYPE[i.type] || i.type, formationData: i.formation ? model.formation(i.formation) : null }));
}
export const featured = () => feed.featured;
