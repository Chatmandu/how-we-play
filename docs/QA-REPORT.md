# QA report: final simplification (branch `final`, 20 October 2026)

Not deployed. Public build 20 pages (16 in sitemap); preview build 24 pages.

## Changes
- **Moving Up retired as a section.** The full scoreboard (11 verified rules, 7v7 against 9v9), "What stays familiar" and their England Football sources and check dates now sit at the bottom of `/formations/9v9/` (`#moving-up`). The draft pre-season checklist moved with it and stays preview-only. Nothing was lost: every fact and source previously on Moving Up is on the 9v9 page.
- `/moving-up` and `/moving-up/` return **301** to `/formations/9v9/#moving-up` (`public/_redirects`, tested in the local Workers runtime).
- Moving Up removed from desktop and mobile navigation and the footer; About, the 5v5/7v7 placeholders and the 404 page now link to the 9v9 section.
- **Homepage shows complete issues only.** The structured model now derives issues from the formation files: an issue is listed only if it has an issue number and publication date, a recorded coaching review for its current content version, and gate approval. Lessons, positions and other stories can't enter the list because there is no longer a separate feed. The newest issue is featured; **Latest issues** lists the others and is hidden while there's only one.
- Chapter previews on the homepage now use one short line per chapter (your wording); the four principle names are gone from the homepage.
- Football Explained: confirmed gone (no page, no links, not in sitemap; old URL 404, never indexed).

## Checks
| Check | Result |
|---|---|
| Builds and build checks | Pass, both targets |
| `npm test` | 24/24, 13/13, content valid |
| Publishing-gate tests | 5/5 |
| Internal links | All resolve; no link to `/moving-up/` or `/football-explained/` in either build |
| Redirect | `/moving-up/` and `/moving-up` give 301 to `/formations/9v9/#moving-up` |
| Sitemap | 16 URLs: home, About, 9v9, Issue 01 and its 12 stories |
| Responsive (1440, 834, 390px) | No overflow, no console errors |
| Lessons, positions, LessonFigure, behaviour script | Unchanged; review version `cv-353fff2a` still matches David's approval |
| Review status | Issue 01 shows "Coaching reviewed · 20 October 2026" from the register; Issues 02 and 03 named only, as in preparation |
| axe-core | Only the known faded ghost numbers in two diagrams |

## To note
- The 9v9 page description now mentions moving up from 7v7, so searches that found Moving Up land on the right page.
- Search Console: the old `/moving-up/` URL will drop out naturally through the 301.
