# Editorial changes summary: refinement pass, 20 October 2026

Branch `editorial`. Approved identity (Treatment A, "The issue") unchanged. Not deployed.

## Brand positioning
- Homepage cover now leads with the brand: **Helping your team take the next step.** The deck says what the site is for any format: formation guides, tactical diagrams and practical advice.
- 9v9 is framed as **Issue one**: masthead ("Free guides for grassroots coaches · Issue one: 9v9"), contents heading ("Issue one: the step up to 9v9") and the cover figure label.
- Formats are shown honestly in the colophon: 5v5 and 7v7 guides *Planned*, 11v11 *Later*, 9v9 guides *In coaching review* or *Exploratory draft*. Nothing unfinished is linked.
- `content/site.json`: new site description and proposition, social handles (YouTube, Instagram, TikTok @howweplayfootball), format notes, author details.
- Nav keeps "9v9 formations" because that is the only collection that exists. When a second format goes live the nav and a `/formations/` landing page are the planned change (no structural change to the homepage).

## About page
- Rebuilt as an editorial feature from Niall's supplied copy. Light edits only: "move on permanently" became "move on for good"; "wondering where on earth" became "wonder where on earth"; the format sentence tightened to "Whether it's 5v5 to 7v7 or 7v7 to 9v9"; "something we've created" became "something we've made". Meaning, facts and humour unchanged.
- 3v3 is acknowledged once, in Niall's words. No claim of 3v3 coaching experience anywhere.
- Sections: opening feature, the story, the original playbook, simple pictures, meet the reviewer, how we produce our guides, carry on reading.
- Photography: no photographs were supplied, so the opening uses a typographic "7 years on the touchline" plate and the reviewer card has a marked placeholder. No synthetic portraits.
- **The original playbook pages** (cover and rule two, club crest masked) are built but held back from public until you confirm (`about-original-playbook`). The files are also removed from the public build output.
- **David Le Tissier's section and profile** appear only in preview builds until David confirms the biography (`profile-david-le-tissier`). The public About page explains the review process without naming him.

## Authorship and review
- Guides, lessons and position pages carry a byline: *Written by Niall Walsh, grassroots football coach and founder of How We Play*, linking to /about/.
- The review line shows *Coaching reviewed by David Le Tissier on [date]* only when the register holds his approval of the current content version and his profile may be shown. Otherwise: *Awaiting coaching review. Not yet published.*
- Greg Williams: every reference removed from templates, content and current docs. The register keeps a dated history note that the entry was withdrawn.
- Review records now hold version, reviewer, date, decision, limitations and evidence (`scripts/review.mjs`). Any material change to the shape, rules, roles or diagrams changes the version and sends the guide back to review automatically.
- Coaching review, confirmations and official-rule verification remain three separate tracks, explained on the About page.

## Positional pages, lessons and navigation
- All eight 3-1-3-1 position pages now use the editorial feature layout: shirt numbers as the folio, the role as the headline, the position's own stepped diagram with the "Ask yourself" cue, then jobs, situations and the rules the position uses. Content unchanged.
- Lesson and position navigation: a typographic index on wide screens; on phones, back link, "Rule 2 of 4", previous/next (44px targets) and an "All rules and positions" disclosure, so long rule names no longer wrap across the page.
- Lesson figures gained **Enlarge** (modal, Esc to close, focus returns) alongside Key.
- Functional labels (figure heads, step labels, sheet column labels) moved to the body typeface; display capitals kept for editorial headings.

## Spacing
- Team sheet to four rules: 120px to 40px (same subject). Hub sheet to development shelf: 120px to 72px. Section headers to content: 24px to 16px. Page heads tightened. Team sheet pitch now full width on phones so player numbers stay legible.

## Moving Up
- Transitions strip: 5v5 to 7v7 (*Planned, not researched yet*), 7v7 to 9v9 (this page), 9v9 to 11v11 (*Later*). No guidance for unresearched transitions.
- Scoreboard component takes `from`/`to` formats and refuses to build if a fact has no value for a format, so a future 5v5 to 7v7 scoreboard can't show blanks.

## SEO
- Homepage title kept; description rewritten to cover all formats (142 characters).
- About: title "About How We Play | Grassroots Football Coaching", your meta description, your H1. JSON-LD `AboutPage` with Niall as `Person`; David's `Person` markup only once his profile is confirmed.
- Organization JSON-LD gains `founder` and `sameAs` (the three social accounts you supplied).
- Guides, lessons and positions: `Article` with `author` as Person (Niall).
- 9v9 keywords stay on the hub, guide and lessons.
