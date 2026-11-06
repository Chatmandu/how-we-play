# Search intent map and 90-day discovery plan

**Prepared:** 6 November 2026  
**Scope:** UK and US grassroots football/soccer coaches. Formats and rules vary by country.  
**Evidence scale:** **Verified** = official rule/site observation; **Directional** = YouTube/Google autocomplete and competitor research (no volume); **Hypothesis** = content idea requiring GSC validation. No search-volume claims.

## Twelve candidate search journeys

| Priority | Query / intent cluster | Audience | Type of evidence | Existing page / proposed destination | Next action |
| --- | --- | --- | --- | --- | --- |
| 1 | `7v7 football formations`, `7v7 soccer formations` | UK / US | Directional autocomplete; existing broad-format guide | `/formations/7v7/` | Measure GSC impressions/CTR; preserve broad title and compare variants |
| 2 | `9v9 football formations`, `9v9 soccer formations` | UK / US | Directional autocomplete; existing four-guide collection | `/formations/9v9/` | Measure GSC and strengthen referral path from videos |
| 3 | `best 7v7 formation`, `which 7v7 formation` | UK / US | Directional autocomplete and competitor analysis | `/formations/7v7/`; possible reviewed chooser article | Editor review of chooser draft; avoid absolute “best” claim |
| 4 | `2-3-1 formation 7v7`, `2-3-1 soccer` | UK / US | Existing reviewed content and YouTube search landscape | `/formations/7v7/2-3-1/` | Check page-level GSC and video link performance |
| 5 | `3-2-1 formation 7v7` | UK / US | Existing reviewed content | `/formations/7v7/3-2-1/` | Compare with other two shape pages without creating near-duplicates |
| 6 | `2-1-2-1 formation 7v7` | UK / US | Existing reviewed guide/video | `/formations/7v7/2-1-2-1/` | Review impressions and embed engagement |
| 7 | `moving from 7v7 to 9v9`, `U12 9v9 changes` | **England 2026/27** | **Verified** FutureFit format/rules; directional video interest | Existing `9v9/#moving-up`; proposed dedicated coaching guide | Review and publish drafted England-only article; cross-link hubs and transition video |
| 8 | `U10 football formation`, `U11 7v7 positions` | **England** | Verified age formats, search hypothesis | `/formations/7v7/` | Test age-group phrasing in snippet only if GSC supports it |
| 9 | `U9 U10 7v7 soccer formations` | **USA** | Existing US guide and format mapping; query hypothesis | `/coaching-in-the-usa/` + `/formations/7v7/` | Inspect US GSC queries. Don't put English 2026/27 rules on US pages |
| 10 | `goal kick retreat line 7v7`, `build out line youth soccer` | UK / US **separate rules** | Verified England retreat line; possible US terminology | Future coaching guide, split by jurisdiction | Research official rules, coach review, then draft. Avoid combining rules |
| 11 | `how to coach attacking corners 9v9` | UK / US with rule caveat | Existing reviewed illustrated article, query hypothesis | `/coaching/attacking-corners/` | Link from formation hubs; measure clicks to article |
| 12 | `kids chasing the ball soccer`, `how to teach positions to kids` | UK / US | YouTube research directional; editorial hypothesis | Proposed coaching explainer / issue article | Research player development, storyboard and coach-review before publishing |

**Evidence sources:** England Football [7v7 rules](https://learn.englandfootball.com/articles-and-resources/coaching/resources/2025/How-to-play-and-manage-7v7-games), [9v9 rules](https://learn.englandfootball.com/articles-and-resources/coaching/resources/2025/How-to-play-and-manage-9v9-games), [formats](https://learn.englandfootball.com/articles-and-resources/coaching/resources/2022/what-is-a-format-in-football); HWP reviewed content and live sitemap; *How We Play Football YouTube growth, competitive intelligence and content strategy* (3 Nov 2026, supplied research, YouTube-centric and directional). **None of these sources gives verified monthly Google keyword volume.**

## Positioning decisions

- Keep the same **reviewed formation guide per shape** for both football and soccer language. Natural US-language inclusion is useful, but country-specific competition rules need explicit separation.
- Lead titles with the **format/question** rather than only the house-principle name. Existing formation overview titles already do this. Don't churn all metadata without evidence.
- Continue pairing **format-led evergreen pages** (Google/YouTube search) with **problem-led short clips** (social discovery). Link each format video directly to its matching guide and use a clear site link in channel profiles and long-form descriptions.
- Keep the full, free web guides crawlable. Email delivery of a printable A4 booklet is a useful conversion, but should not gate the core coaching content.
- Don't add template-like pages for every age and country until there is a distinct reason for each to exist.

## Measurable 30/60/90-day backlog

| Window | Deliverable / owner | Effort | Success signal | Gate / risk |
| --- | --- | --- | --- | --- |
| **0–30 days** | Niall: export GSC Performance queries/pages/countries and Page indexing; establish weekly 5v5/7v7/9v9 and country cohorts | 30–60 min | First reliable weekly baseline, with indexed count and impressions for top 20 routes | Must use real GSC, no extrapolation |
| **0–30 days** | Niall / Cloudflare: 301 or 308 redirect HTTP → HTTPS and `www` → apex | 20–40 min | Both variants return one clean permanent redirect and apex returns 200 | Cloudflare dashboard rule; **not** implemented in Astro PR |
| **0–30 days** | Site maintainer: merge tested hub cross-links from this PR | Under 30 min | 7v7 and 9v9 hubs each expose useful next-step links; no broken refs | Merge after Niall approval |
| **0–30 days** | Niall + David: fact check England transition draft, add coaching judgement and publish | 2–4 h incl. review | One distinctive answer page, linked from both format hubs and relevant video | David reviews any new tactical advice; confirm 2026/27 competition nuance |
| **0–30 days** | Niall: rework links in existing long YouTube explainer descriptions and pinned comments to the **specific** matching guide | 60–90 min | Track YouTube → formation-page referral sessions and booklet requests | No spam or unverified statements |
| **31–60 days** | Niall + David: review/publish 7v7 chooser draft; optionally add one clear comparison diagram | 3–5 h | Separate page serves chooser questions without duplicating every guide | Review strengths/trade-offs, avoid universal formation prescriptions |
| **31–60 days** | Niall + David: research and publish one problem-led coaching article (e.g. bunching or retreat line), with a genuinely new diagram and coach's cue | 4–7 h | Search impressions to a new topic page; referral from matching Short | Check rules, age and source accuracy |
| **31–60 days** | Site maintainer: check live video discoverability using GSC Video pages. Consider accurate `VideoObject` / video sitemap metadata if warranted | 2–4 h | Google sees the video; no privacy regression | Current click-to-play consent should remain; no fabricated upload dates |
| **31–60 days** | Niall: distribute selected answers in relevant coach discussions and local league channels | 1 h/week | Referral visits and engaged reading, not link count | Participate helpfully; respect community self-promotion rules |
| **61–90 days** | Niall / site maintainer: triage deep position/principle pages using URL-level GSC impressions, index status, incoming links and content uniqueness | 3–5 h | Decision record for *specific* pages: keep / improve / merge / noindex | **No mass noindex**; approval before each structural set |
| **61–90 days** | Niall + David: create 1–2 further guides only where actual user questions and GSC support demand | 6–12 h | Organic impressions diversify beyond formation-name queries | Review gate; quality over publishing volume |
| **61–90 days** | Niall: review conversion journey and iterate on A4 email delivery copy/placement without altering opt-in rules | 1–2 h | Share of engaged visitors who request guide; opt-in rate and email delivery health | Explicit optional marketing consent, privacy safe |

## Lightweight weekly scorecard

| Metric | Source | Baseline | Interpretation |
| --- | --- | --- | --- |
| Google organic clicks and impressions | GSC Web Performance | **Await export** | Growth across 7v7/9v9/hub and new editorial cohorts |
| CTR of pages with at least 100 impressions | GSC | **Await export** | Improve snippet if query-page match exists but CTR weak; avoid reacting to tiny samples |
| Number of indexed pages by template group | GSC Page indexing | **Await export** | Look for a pattern among 48 position and 36 principle routes; not every page must index |
| UK / US search entry pages | GSC countries + pages | **Await export** | Choose whether to prioritise England-specific or US intent next |
| YouTube → guide referral traffic | GA4 or privacy-appropriate analytics | **Await export** | Evidence of video-to-site handoff |
| A4 email requests / engaged visits | First-party form logs and analytics | **Await export** | Quality of acquisition and site journey, distinct from newsletter marketing opt-in |

### What would change the plan?

- **No impressions and not indexed:** inspect fetch/index status, uniqueness and internal discovery; no rush to change titles.
- **Impressions, low CTR:** look at specific query-title fit, ranking position, snippet and competing result layout.
- **Clicks but low guide use:** improve readability, findability of downloadable guide, related content and calls to action.
- **High US share:** consider US-specific *rules* content only after official verification, not duplicative formation pages.
- **Only branded/referral traffic:** invest in genuinely useful problem-led answer pages and distribution while indexing matures.

## Decisions needed from Niall

1. Supply GSC exports to turn hypotheses into a prioritised evidence-backed SEO programme.
2. Confirm whether Cloudflare's redirect settings can be changed. The code PR cannot enforce host/protocol redirects at the edge.
3. Ask David to review the two unpublished editorial drafts before any tactical or age-rule guidance goes live.
4. Choose the *next* problem-led guide after 30 days of evidence, rather than committing now to a large batch.
