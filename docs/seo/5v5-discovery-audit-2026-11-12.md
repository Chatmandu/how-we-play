# 5v5 discoverability check and implementation notes

**Date:** 12 November 2026  
**Scope:** `/formations/5v5/` and its existing reviewed 1-2-1 and 2-2 guides.

## What the November Search Console export showed

The historic 10–11 November exports included eight 5v5 URLs in the two not-yet-indexed categories. These were status snapshots, not proof of a current technical fault. Google may have crawled or indexed URLs since then.

| Search Console reason in the export | URLs |
| --- | --- |
| Discovered – currently not indexed | `/formations/5v5/1-2-1/`, `/formations/5v5/1-2-1/positions/defender/`, `/formations/5v5/1-2-1/positions/wide-players/`, `/formations/5v5/1-2-1/recover-together/`, `/formations/5v5/1-2-1/show-them-wide/`, `/formations/5v5/2-2/one-comes-one-goes/` |
| Crawled – currently not indexed | `/formations/5v5/1-2-1/one-goes-one-covers/`, `/formations/5v5/2-2/positions/goalkeeper/` |

The main 5v5 hub was not among these eight. A missing index entry is not, on its own, a technical failure or a Google penalty.

## What the current code confirms

- Both complete guides are approved and available to the public through the versioned publication gate.
- Public pages use a canonical URL on `https://howweplayfootball.com`; the shared layout emits `index, follow` unless a page is deliberately private or noindexed.
- The public sitemap includes published issues and their approved position/principle pages.
- The homepage provides a route to the 5v5 hub and links to each published guide.
- The 5v5 landing page had repeated complete team sheets, duplicating material on the two detailed guides. This is a usability improvement opportunity, **not a proven cause of non-indexing**.

## Changes prepared in this PR

1. Replace repeated public team sheets with a side-by-side comparison of 1-2-1 and 2-2 and two accessible diagrams from the reviewed source.
2. Retain the complete guide content and publication gate. No child-page content, canonical behaviour or `noindex` rules change.
3. Add clear decisions, roles and guide links, plus a reciprocal 7v7 → 5v5 link for coaches stepping up.
4. Improve the hub title and description, and record genuine editorial modification dates for the three redesigned format hubs in the sitemap.
5. Update automated tests for published cards, diagrams, links, sitemap dates and private previews.

## Follow-up in Search Console

After deployment, use **URL Inspection → Test live URL** on:

1. `https://howweplayfootball.com/formations/5v5/`
2. `https://howweplayfootball.com/formations/5v5/1-2-1/`
3. `https://howweplayfootball.com/formations/5v5/2-2/`

Inspect indexability and Google-selected canonical. Where a key guide remains unindexed but is eligible, request indexing once. Check back after Google has had time to recrawl. Don't request all the supporting pages in bulk or noindex them based solely on a three-week-old domain's early data.

Compare Search Console **non-branded impressions and clicks** on the 5v5 hub and both guides after 28 and 56 days. Search Console access or a fresh export is required to confirm Google's actual index state. GitHub builds and public-site checks cannot provide that state.
