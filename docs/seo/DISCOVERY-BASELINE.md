# Discoverability baseline: How We Play Football

**Audit date:** 6 November 2026  
**Code baseline:** `main` at `cbd29cf` (GitHub PR #34 merge), public Astro build  
**Site:** https://howweplayfootball.com  
**Status:** Provisional technical/content audit. No Google Search Console (GSC), GA4, server logs or keyword-volume data was available. This is **not** an assessment of actual Google indexing or traffic causes.

## Executive verdict

The site has a sound technical foundation. The immediate limitation is discoverability for a very new property, not an obvious missing `title` tag or sitemap. Visitors with a specific formation in mind are well served, but coaches starting from a problem or an age-group change have relatively few editorial entry points. We should build out those answer pages with coaching review, use existing videos to reach people, and evaluate actual Search Console signals before removing any deep pages from the index.

## Verified checks

| Check | Finding | Evidence / qualification |
| --- | --- | --- |
| Public URL inventory | **103 URLs** in the public sitemap, plus a generated 404 page | `npm run build:public` and `scripts/check-build.mjs` pass, with 104 HTML pages built |
| Inventory by type | 9 formation overviews; 36 principle lessons; 48 position pages; 10 other/hub pages | Classified from built route paths; **84/103** are principle/position pages |
| Indexing directives | All 103 public pages use indexable markup; no built page contains `noindex` | Public build inspection. This does **not** prove Google indexed them |
| Page metadata | 103/103 with one H1, a non-empty title, meta description and canonical; **0 duplicate titles** | Build validator and independent built-HTML count |
| Sitemap | Contains image entries; `lastmod` only where a genuine publication/update date is recorded | Live `sitemap.xml` and build generator; not every URL needs a `lastmod` |
| Visual search | Nine reviewed formation starting shapes generated as SVG **and WebP**; WebPs listed in the sitemap | Build output and sitemap. Old claim that images only exist as inline SVG is outdated |
| Social previews | 100 branded page-specific 1200×630 PNG previews generated | Build output |
| Internal references | Site build checks all links and assets against published routes and validates on-page anchors | `scripts/check-build.mjs`; new links will be checked again |
| Structured data | Site / publisher / author identities, formation-related Article markup, breadcrumbs, coaching Article markup; updated dates only where evidenced | `src/lib/seo.mjs`, `src/pages/coaching/attacking-corners/index.astro`, SEO tests |
| YouTube | `IssueVideo` is click-to-load and includes a direct YouTube link | Privacy-friendly by design, but Google says it should not have to click to discover an embedded video. Video rich results are not guaranteed |
| HTTPS / host variants | **Action needed:** a live HEAD request to `http://howweplayfootball.com/` and to `https://www.howweplayfootball.com/` returned **200, with zero redirects**, on 6 Nov | Verified from this environment; repeat in a browser and Cloudflare dashboard. HTML canonicals point to `https://howweplayfootball.com/`, which helps consolidate signals but is not a redirect |
| Page load / Core Web Vitals | **Unknown** | No field data or Lighthouse mobile lab report available; do not claim a performance score |
| GSC index status and impressions | **Unknown** | Requires GSC Pages and Performance exports; absence of impressions cannot be inferred from the site crawl |

### Representative URL review

Word counts are **approximate visible text in the main content**, including repeated navigation/cues. They are not a measure of unique editorial value or a ranking threshold.

| URL | Intent served | Approx. main words | Verified observation / opportunity |
| --- | --- | ---: | --- |
| `/` | Discover free coaching resources | 615 | Clear 5v5/7v7/9v9 offer; existing home links |
| `/formations/5v5/` | 5v5 formations | 507 | Two published shapes and next-format link |
| `/formations/7v7/` | 7v7 formations, U10/U11 | 775 | Three published shapes and formation chooser; added relevant next-step links in this PR |
| `/formations/9v9/` | 9v9 formations, U12/U13 | 1,298 | Four published shapes, comparison chooser and 7v7-to-9v9 changes; added return/coaching links in this PR |
| `/formations/7v7/2-3-1/` | Specific formation / youth soccer | 1,019 | Strong overview, reviewed principles/roles, starting-shape WebP, video |
| `/formations/7v7/2-1-2-1/` | Specific formation | 822 | Video, formation overview, related 7v7 issues |
| `/formations/7v7/2-3-1/positions/goalkeeper/` | Goalkeeper role within 2-3-1 | 342 | H1 includes **formation and format**; outdated finding that these H1s are simply “Goalkeeper” should not be repeated |
| `/formations/9v9/3-1-3-1/` | Specific formation | 1,039 | Reviewed overview with diagrams and deeper links |
| `/formations/9v9/3-3-2/` | Specific formation | 1,030 | Reviewed overview with recent video |
| `/coaching/attacking-corners/` | How to coach an attacking corner | 874 | Single substantial coaching article with practical diagrams and age/rule distinction |
| `/coaching/` | Discover coaching-topic articles | 247 | Only one published article; multiple empty categories labelled “coming” |
| `/coaching-in-the-usa/` | US youth/rec soccer orientation | Not counted | Existing US guide; check GSC rather than assuming it ranks for US queries |
| `/about/` | Editorial trust/author story | Not counted | Named author and coaching reviewer; relevant to transparency |
| `/contact/` | Contact | Not counted | Functional form is a conversion/contact route, not a priority SEO target |
| `/privacy/` | Privacy | Not counted | Keep discoverable to support email and YouTube disclosures |

### Why not bulk-noindex the 84 deep pages?

Several position and principle routes share structure and some are short, but Google has **no universal minimum word count**. Some may answer a useful, narrow question or serve a role-card link that coaches share. Without GSC's indexed/not-indexed classifications, impressions and representative page inspection, a bulk `noindex` risks discarding valid entry points. Start by grouping the deep pages in GSC, then consider *specific* merges, stronger on-page examples or targeted indexing changes for Niall's approval.

### Opportunities and gaps

1. **England's 2026/27 FutureFit transition:** 7v7 at U10/U11, 9v9 at U12/U13; coaches now need clear rule and age-group explanations. Verified using current England Football Learning guidance. An article draft is prepared but **not published**.
2. **A standalone 7v7 chooser article:** existing hub already compares 2-3-1, 2-1-2-1 and 3-2-1; a fuller page could answer actual selection questions using reviewed claims, without implying one shape is best. Draft prepared for review.
3. **Problem-led coaching guides:** the corners article is a promising model. Next research candidates: children bunching/chasing the ball, safe goal kicks/retreat line and offside at 9v9. Don't publish unreviewed drills or tactical instructions.
4. **Format-led Google/YouTube journeys:** the 3 November YouTube research found substantial *YouTube search* interest in formats, positions and beginner questions. Use that as directional idea generation, **not Google web-search volume or proof of rankings**.
5. **Video markup:** investigate accurate YouTube metadata and non-invasive discoverability; do not compromise the consent-based click-to-load privacy design or invent upload dates.
6. **Hosting redirects:** fix both non-canonical host/protocol variants in Cloudflare, then verify 301/308 with `curl -I` and that the apex still serves 200.

## What was changed in this PR

- On the **7v7 hub**, linked the existing reviewed attacking-corners article and the existing England 7v7-to-9v9 rule comparison.
- On the **9v9 hub**, linked back to the published 7v7 collection and to the existing attacking-corners article.
- These are navigation and editorial-context changes only. No new unreviewed tactical guidance, templates, redirect configuration, indexing directives, URLs or content-model changes.

## Verification and source notes

- England Football, [7v7 games](https://learn.englandfootball.com/articles-and-resources/coaching/resources/2025/How-to-play-and-manage-7v7-games), and [9v9 games](https://learn.englandfootball.com/articles-and-resources/coaching/resources/2025/How-to-play-and-manage-9v9-games), each updated for 2026/27.
- England Football, [formats and the FutureFit pathway](https://learn.englandfootball.com/articles-and-resources/coaching/resources/2022/what-is-a-format-in-football).
- Google Search Central, [technical requirements](https://developers.google.com/search/docs/essentials/technical), [image SEO](https://developers.google.com/search/docs/appearance/google-images), [video SEO](https://developers.google.com/search/docs/appearance/video), and [sitemap overview](https://developers.google.com/search/docs/crawling-indexing/sitemaps/overview).
- Code: `scripts/check-build.mjs`, `src/lib/seo.mjs`, `src/components/FormationChooser.astro`, `src/components/IssueVideo.astro`; live sitemap fetched 6 Nov.

## Evidence needed to replace this provisional baseline

1. **GSC Performance**: last 3 months (or all available), Search type Web; export **Queries**, **Pages** and **Countries**, including clicks, impressions, CTR and average position.
2. **GSC Indexing > Pages**: export the indexed / not indexed breakdown and, where possible, examples of “Crawled, currently not indexed” and “Discovered, currently not indexed”.
3. Optional: **GA4 Landing page** report filtered to `Organic Search` session default channel group, and Google Search Console video-indexing report if populated.

These will let us distinguish lack of impressions (discovery or index issue) from impressions with weak CTR (snippet problem) and clicks with limited downstream use (journey/conversion problem).
