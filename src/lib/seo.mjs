/* Search discovery and semantic publishing relationships.
 *
 * Everything here is derived from content which has already passed the site
 * publishing gate. No invented author qualifications, reviews, publication
 * updates or unpublished sections. Structured data describes visible pages;
 * it does not promise ranking or special AI placement.
 */
import { publishedIssues, reviewRecord } from './editorial.mjs';

const base = site => site.url.replace(/\/$/, '');
const fullUrl = (site, path) => base(site) + path;
const homeId = site => fullUrl(site, '/#website');
const orgId = site => fullUrl(site, '/#publisher');
const authorId = site => fullUrl(site, '/about/#niall-walsh');
const reviewerId = site => fullUrl(site, '/about/#david-wilson');
const articleId = page => page + '#article';

export function siteIdentity(site) {
  const name = site.name;
  const url = fullUrl(site, '/');
  return [
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      '@id': homeId(site),
      name,
      url,
      description: site.description,
      inLanguage: 'en-GB',
      publisher: { '@id': orgId(site) }
    },
    {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      '@id': orgId(site),
      name,
      url,
      logo: { '@type': 'ImageObject', url: fullUrl(site, '/hwp/social/hwp-avatar-800.png') },
      founder: { '@id': authorId(site) },
      sameAs: Object.values(site.social || {}).map(x => x.url).filter(Boolean)
    },
    {
      '@context': 'https://schema.org',
      '@type': 'Person',
      '@id': authorId(site),
      name: site.author.name,
      url: fullUrl(site, site.author.url),
      description: site.author.short
    }
  ];
}

export const issuePath = f => `/formations/${f.format}/${f.slug}/`;
export const lessonPath = (f, rule) => issuePath(f) + rule.id + '/';
export const positionPath = (f, role) => issuePath(f) + 'positions/' + role.id + '/';

const dateProperties = (f, content = null) => {
  const published = f.issue?.published;
  const updated = content?.updated || f.issue?.updated;
  return {
    ...(published ? { datePublished: published } : {}),
    ...(updated && published && updated >= published ? { dateModified: updated } : {})
  };
};

const reviewPage = (site, f, page, title, primaryEntity) => {
  const record = reviewRecord(f.register);
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': page,
    url: page,
    name: title,
    inLanguage: 'en-GB',
    isPartOf: { '@id': homeId(site) },
    mainEntity: { '@id': primaryEntity },
    ...(record && f.gate.allowed ? { reviewedBy: { '@id': reviewerId(site), name: record.by, '@type': 'Person' } } : {})
  };
};
const articleBase = (site, f, page, headline, description) => ({
  '@context': 'https://schema.org',
  '@type': 'Article',
  '@id': articleId(page),
  headline,
  description,
  url: page,
  mainEntityOfPage: { '@id': page },
  inLanguage: 'en-GB',
  author: { '@id': authorId(site), '@type': 'Person', name: site.author.name, url: fullUrl(site, '/about/') },
  publisher: { '@id': orgId(site), '@type': 'Organization', name: site.name, url: fullUrl(site, '/') },
  isAccessibleForFree: true,
  about: [{ '@type': 'Thing', name: '9v9 grassroots football' }, { '@type': 'Thing', name: f.name + ' formation' }]
});

export function issueStructuredData(site, f) {
  const page = fullUrl(site, issuePath(f));
  const title = `The ${f.name}: a 9v9 football formation guide`;
  const description = f.issue?.summary || f.issue?.intro || '';
  const parts = [
    ...(f.rules || []).filter(r => r.diagram).map(r => ({ '@type': 'CreativeWork', name: r.title, url: fullUrl(site, lessonPath(f, r)) })),
    ...(f.roles || []).filter(r => r.diagram).map(r => ({ '@type': 'CreativeWork', name: r.title, url: fullUrl(site, positionPath(f, r)) }))
  ];
  return [
    {
      ...articleBase(site, f, page, title, description),
      ...dateProperties(f),
      articleSection: '9v9 formation guides',
      isPartOf: { '@type': 'CollectionPage', '@id': fullUrl(site, '/formations/9v9/'), url: fullUrl(site, '/formations/9v9/'), name: '9v9 formations' },
      ...(parts.length ? { hasPart: parts } : {})
    },
    reviewPage(site, f, page, title, articleId(page))
  ];
}
export function lessonStructuredData(site, f, r) {
  const page = fullUrl(site, lessonPath(f, r));
  const headline = r.title + ' (' + f.name + ' 9v9)';
  return [
    {
      ...articleBase(site, f, page, headline, [r.tag, r.summary].filter(Boolean).join(' ')),
      ...dateProperties(f, r),
      articleSection: 'Playing principles',
      isPartOf: { '@id': articleId(fullUrl(site, issuePath(f))), '@type': 'Article', url: fullUrl(site, issuePath(f)), name: `The ${f.name}` }
    },
    reviewPage(site, f, page, headline, articleId(page))
  ];
}
export function positionStructuredData(site, f, r) {
  const page = fullUrl(site, positionPath(f, r));
  const headline = r.title + ' in a ' + f.name + ' 9v9';
  return [
    {
      ...articleBase(site, f, page, headline, [r.head, ...(r.points || [])].join(' ')),
      ...dateProperties(f, r),
      articleSection: 'Player roles',
      isPartOf: { '@id': articleId(fullUrl(site, issuePath(f))), '@type': 'Article', url: fullUrl(site, issuePath(f)), name: `The ${f.name}` }
    },
    reviewPage(site, f, page, headline, articleId(page))
  ];
}
export function collectionStructuredData(site, issues) {
  const page = fullUrl(site, '/formations/9v9/');
  return [{
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': page,
    url: page,
    name: '9v9 football formations',
    description: 'Free formation guides for nine-a-side grassroots football, including playing principles and player responsibilities.',
    inLanguage: 'en-GB',
    isPartOf: { '@id': homeId(site) },
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: issues.map((f, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: `9v9 Issue ${String(f.issue.number).padStart(2, '0')}: the ${f.name}`,
        url: fullUrl(site, issuePath(f))
      }))
    }
  }];
}

const asDate = x => typeof x === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(x) && Number.isFinite(Date.parse(x)) ? x : null;
const lastEdit = (f, section) => asDate(section?.updated || f.issue?.updated || f.issue?.published);
export function sitemapLastmod(route, model) {
  if (route === '/privacy/') return asDate(model.site.privacy?.lastUpdated);
  const issue = model.formations.find(f => f.gate.allowed && f.issue && route.startsWith(issuePath(f)));
  if (issue) {
    const rest = route.slice(issuePath(issue).length);
    if (!rest) return lastEdit(issue);
    if (rest.startsWith('positions/')) {
      const role = issue.roles?.find(x => 'positions/' + x.id + '/' === rest);
      return role ? lastEdit(issue, role) : null;
    }
    const rule = issue.rules?.find(x => x.id + '/' === rest);
    return rule ? lastEdit(issue, rule) : null;
  }
  if (route === '/formations/9v9/') {
    const dates = publishedIssues(model).filter(f => f.format === '9v9').map(f => lastEdit(f)).filter(Boolean);
    return dates.length ? dates.sort().at(-1) : null;
  }
  // No guessed 'updated today' dates for About, the homepage or teasers.
  return null;
}

const escapeXml = str => String(str).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
export { escapeXml };

export function issueFeedXml(model) {
  const site = model.site;
  const issues = publishedIssues(model);
  const path = fullUrl(site, '/feed.xml');
  const item = f => {
    const url = fullUrl(site, issuePath(f));
    const title = `9v9 · Issue ${String(f.issue.number).padStart(2, '0')}: The ${f.name}`;
    const summary = f.issue.summary || f.issue.intro;
    // RSS pubDate requires a time; only the editorial calendar DAY is known.
    // Omit pubDate rather than invent a timestamp for publication.
    return ['  <item>',
      `    <title>${escapeXml(title)}</title>`,
      `    <link>${escapeXml(url)}</link>`,
      `    <guid isPermaLink="true">${escapeXml(url)}</guid>`,
      `    <description>${escapeXml(summary)}</description>`,
      '  </item>'].join('\n');
  };
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0">',
    '<channel>',
    `  <title>${escapeXml(site.name + ' · New formation issues')}</title>`,
    `  <link>${escapeXml(fullUrl(site, '/'))}</link>`,
    `  <description>${escapeXml('Complete, free grassroots football formation issues from How We Play.')}</description>`,
    '  <language>en-gb</language>',
    `  <atom:link xmlns:atom="http://www.w3.org/2005/Atom" href="${escapeXml(path)}" rel="self" type="application/rss+xml"/>`,
    ...issues.map(item),
    '</channel>',
    '</rss>',
    ''
  ].join('\n');
}
