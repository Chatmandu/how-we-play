/* Published, independently reviewed full-length formation explainers.
 * YouTube IDs, original upload timestamps (UTC), titles and durations come from
 * the project's hwp_inventory.csv YouTube channel export captured in Nov 2026.
 *
 * Only these five full-length films are already embedded on published guides.
 * Shorts and unreleased scripts are deliberately excluded from this roll-out.
 * The approved formation model remains the source for descriptions and diagrams.
 */
import { publishedIssues } from './editorial.mjs';

const releases = [
  {
    format: '9v9', formation: '3-1-3-1', youtubeId: 'KEKPal0Upd4',
    title: '3-1-3-1 Formation Explained | 9v9 Football Tactics for Grassroots Coaches',
    uploadDate: '2026-10-22T12:26:06Z', durationSeconds: 291
  },
  {
    format: '7v7', formation: '2-3-1', youtubeId: 's_ENKf0Sb1E',
    title: '2-3-1 Formation Explained | 7v7 Football Tactics for Grassroots Coaches',
    uploadDate: '2026-10-24T10:09:10Z', durationSeconds: 311
  },
  {
    format: '9v9', formation: '3-2-3', youtubeId: 'tWzAKTaX2sI',
    title: '3-2-3 Football Formation Explained | 9v9 Football Tactics for Grassroots Coaches',
    uploadDate: '2026-10-28T13:16:41Z', durationSeconds: 227
  },
  {
    format: '9v9', formation: '3-3-2', youtubeId: 'CazFYOmIWqQ',
    title: '3-3-2 Formation Explained | 9v9 Football Tactics for Grassroots Coaches',
    uploadDate: '2026-10-31T15:43:08Z', durationSeconds: 311
  },
  {
    format: '7v7', formation: '2-1-2-1', youtubeId: 'T25DkHCSDHI',
    title: '2-1-2-1 Formation Explained | 7v7 Football Tactics for Grassroots Coaches',
    uploadDate: '2026-11-02T11:33:53Z', durationSeconds: 219
  }
];

/* Video available on its reviewed formation guide, but not yet added to the
 * video library or video sitemap because its exact upload date and final
 * running time have not been verified. No invented VideoObject metadata. */
const guideOnlyReleases = [
  { format: '9v9', formation: '2-2-3-1', youtubeId: 'EXjeIrXdNjA' }
];

export function publishedVideos(model) {
  const issues = new Map(publishedIssues(model).map(f => [`${f.format}/${f.slug}`, f]));
  return releases.flatMap(v => {
    const f = issues.get(`${v.format}/${v.formation}`);
    if (!f || !f.gate.allowed || f.register.content.status !== 'reviewed' || !f.issue?.published) return [];
    const slug = `${v.format}-${v.formation}`;
    const href = `/videos/${slug}/`;
    const guideHref = `/formations/${v.format}/${v.formation}/`;
    const description = `Watch the ${v.formation} formation explained for ${v.format} football. Learn the starting shape, player roles and four playing principles: ${f.rules.map(r => r.title).join(', ')}.`;
    return [{
      ...v,
      slug, href, guideHref, description, f,
      embedUrl: `https://www.youtube-nocookie.com/embed/${v.youtubeId}`,
      youtubeUrl: `https://www.youtube.com/watch?v=${v.youtubeId}`,
      thumbnail: `/og/videos/${slug}.png`,
      duration: `PT${Math.floor(v.durationSeconds / 60)}M${v.durationSeconds % 60}S`
    }];
  });
}

export function videoForFormation(model, format, formation) {
  const released = publishedVideos(model).find(v => v.format === format && v.formation === formation);
  if (released) return released;

  // The same editorial gate protects guide-only embeds as full watch pages.
  const issue = publishedIssues(model).find(f => f.format === format && f.slug === formation);
  if (!issue) return null;
  return guideOnlyReleases.find(v => v.format === format && v.formation === formation) || null;
}

export function videoStructuredData(site, v) {
  const siteBase = site.url.replace(/\/$/, '');
  const page = siteBase + v.href;
  const videoId = page + '#video';
  return [
    {
      '@context': 'https://schema.org',
      '@type': 'VideoObject',
      '@id': videoId,
      name: v.title,
      description: v.description,
      thumbnailUrl: [siteBase + v.thumbnail],
      uploadDate: v.uploadDate,
      duration: v.duration,
      embedUrl: v.embedUrl,
      url: page,
      isAccessibleForFree: true,
      publisher: { '@type': 'Organization', '@id': siteBase + '/#publisher', name: site.name, url: siteBase + '/' }
    },
    {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      '@id': page,
      url: page,
      name: v.title,
      description: v.description,
      inLanguage: 'en-GB',
      mainEntity: { '@id': videoId },
      isPartOf: { '@id': siteBase + '/videos/', '@type': 'CollectionPage', name: 'Football formation video explainers' }
    }
  ];
}

export function videoSitemapXml(model) {
  const siteBase = model.site.url.replace(/\/$/, '');
  const escapeXml = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' }[c]));
  const rows = publishedVideos(model).map(v => [
    '  <url>',
    `    <loc>${escapeXml(siteBase + v.href)}</loc>`,
    '    <video:video>',
    `      <video:thumbnail_loc>${escapeXml(siteBase + v.thumbnail)}</video:thumbnail_loc>`,
    `      <video:title>${escapeXml(v.title)}</video:title>`,
    `      <video:description>${escapeXml(v.description)}</video:description>`,
    `      <video:player_loc>${escapeXml(v.embedUrl)}</video:player_loc>`,
    `      <video:duration>${v.durationSeconds}</video:duration>`,
    `      <video:publication_date>${v.uploadDate}</video:publication_date>`,
    '    </video:video>',
    '  </url>'
  ].join('\n'));
  return '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">\n' +
    rows.join('\n') + '\n</urlset>\n';
}
