# QA report: simplified homepage (20 October 2026, fourth pass)

Headless Chromium against the public build (21 pages, 17 in sitemap) and preview build (25 pages).

## Changes
- Homepage: introduction, format chooser (5v5 and 7v7 in development, 9v9 live), featured issue (9v9 · Issue 01 · The 3-1-3-1: starting shape, intro, four chapters, link), then **Latest additions** from `content/editorial/feed.json`. The One goes, one stays feature, the nine-a-side comparison and the colophon are gone; About is a small link.
- Latest additions: each item has title, excerpt, type, format, parent issue, publication date, required register ids and an illustration. An item appears only if everything it requires is public; the featured issue isn't repeated. Launch items: One goes, one stays (lesson, 20 Oct) and Moving from 7v7 to 9v9 (19 Oct).
- 9v9 page: introduction and format facts, published issues (team sheet), issues in development, then **What changes at nine a side** (four verified rules, sources, check date, link to Moving Up). The full comparison stays only on Moving Up. There was no multi-formation comparison table on the live page to remove.
- Football Explained removed: page, navigation, footer, homepage mention and register entry. The old URL now returns 404. It was always noindex and never in the sitemap, so there's nothing to redirect.

## Checks
| Check | Result |
|---|---|
| Builds and build checks | Pass, both targets |
| `npm test` | 24/24, 13/13, content valid |
| Publishing-gate tests | 5/5 |
| Overflow and console errors at 1440, 834, 390px | None |
| Lessons, positions, LessonFigure, behaviour script, formation files | Unchanged (no diff against main); review version still `cv-353fff2a` |
| Step controls, keyboard, Enlarge, Key, no-JS, menu | Pass |
| axe-core | Only the known faded ghost-number contrast in two diagrams |
| Sitemap | 17 URLs; no 5v5, 7v7 or Football Explained |
