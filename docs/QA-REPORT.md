# QA report: publication architecture (branch `issues`, 20 October 2026)

Headless Chromium (Playwright) against the public build (22 pages, 17 in sitemap) and preview build (26 pages). No screen-reader or real-device testing.

| Area | Result |
|---|---|
| Builds and build checks (both targets) | Pass |
| Unit, gate and content tests | Pass: 24/24, 13/13, content valid |
| Publishing-gate negative tests | Pass: 5/5 |
| Responsive (1440, 834, 390px; 10 pages) | No horizontal overflow, no console errors, all HTTP 200 |

## Routing
- Existing URLs preserved: `/`, `/about/`, `/formations/9v9/`, `/formations/9v9/3-1-3-1/`, four lessons, eight positions, `/moving-up/`.
- New: `/formations/5v5/`, `/formations/7v7/` (noindex, not in sitemap, link back to Issue 01 and Moving Up).
- Sitemap: 17 URLs (homepage, About, 9v9 collection, Issue 01 and its 12 stories, Moving Up). Placeholders, Football Explained, Coaching Notes and 404 excluded and noindex.
- No duplicate URLs; issue numbers aren't in any URL.
- Every internal link resolves (the build fails otherwise).

## Navigation
- Primary formats and secondary sections on every page. The current format is marked (`aria-current`).
- Phone menu: hidden by default, opens as a grid of three formats then the secondary links, `aria-expanded` updates, Esc closes and returns focus.
- Issue navigation on lessons and positions: previous/next 44 × 44px; the "Contents of this issue" disclosure lists all 12 stories.
- Issue 01 contents list jumps to each chapter.

## Tactical diagrams
- Step controls: click, Arrow keys, Home and End; live-region announcement; Enlarge opens and returns focus; Key opens; reduced motion respected; every frame readable without JavaScript.
- No coaching content changed: the 3-1-3-1 review version is unchanged (`cv-353fff2a`).

## Publishing safeguards
- The 3-1-3-1 shows "Coaching reviewed by David Le Tissier on 20 October 2026" only because the register holds that approval for this exact version.
- 3-3-2 and 2-2-3-1 appear by number, name and status only; no shapes, principles or diagrams in public.
- No further features (set pieces, restarts) were added; the section is hidden while empty.
- Reproduced playbook pages removed from About and from the build.

## Accessibility (axe-core 4.10, WCAG A and AA rules)
- Fixed: low-contrast labels for 5v5 and 7v7 in the format chooser.
- Outstanding (unchanged from last pass): faded "started here" ghost numbers in two diagrams (renderer style; needs your sign-off to change).
- Not claimed: WCAG 2.2 AA compliance. Screen-reader and device testing still to do.

## Open
- Your revised About copy (the Notes app section is a draft from your brief).
- David's own written confirmation of his biography and his review of the 3-1-3-1 to file with the project records (currently recorded from your instruction).
