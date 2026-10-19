# Accessibility and browser QA report: website foundation

**Date:** 19 October 2026 · **Target:** WCAG 2.2 AA · **Builds tested:** `dist-public` (7 pages) and `dist-preview` (24 pages), served locally.
**Tools:** Playwright with **Chromium 141 only**, axe-core 4.10.2, the design-system test suite, the site's build checks. Scripts: `scripts/qa/browser-qa.py` (results in `scripts/qa/results.json`), `scripts/check-build.mjs`, `scripts/test-leak.sh`.

Nothing in this report was tested by a person using assistive technology, on a real phone, or in Safari or Firefox. Those are listed in section 6.

## 1. Summary

| Area | Result |
|---|---|
| Design-system tests (renderer, mirror, validation, timeline, gate) | 24/24 pass |
| Site publishing-gate tests | 10/10 pass |
| Leak tests against real builds | 3/3 pass |
| Content validation | No errors; 10 warnings for the content team (below) |
| Post-build checks, both targets | Pass (links, metadata, one h1, diagram title/desc, gate markers, noindex) |
| Layout at 320, 375, 768, 1024, 1440px, both builds (155 page loads) | No horizontal scroll, one h1 per page, no console errors |
| axe-core, WCAG 2.0/2.1/2.2 A and AA plus best practice, 31 pages | 0 violations, except 2 false positives (section 3) |
| Keyboard and interaction checks | 25/25 pass |

## 2. Fixed during QA

| Issue | Fix |
|---|---|
| 9v9 hub overflowed by 205 to 260px at 320 and 375px | Grid children allowed to shrink (`.gated`, figure and comparison panels) |
| Wing-back sequence controls overflowed by 39px at 320px | Figure toolbar wraps (design system 1.0.1) |
| Diagram key swatches rendered at full width | Stylesheet order: `diagram.css` before `components.css` |
| Cue "extra" line rendered in display capitals | Design-system cue uses its own block class (1.0.1) |
| Preview banner outside a landmark (axe `region`) | Now an `<aside aria-label="Preview notice">` |
| "Back to the guide" and "Open" go-links 22px tall (target size) | Go-links padded to 30px |
| Rule sources separated by a stray ";" on mobile | Sources listed one per line |
| Breadcrumbs and overlines overlapping large headings | Spacing added |
| Exploratory strip shown above all three formations on the hub | Strip moved onto the 2-2-3-1 panel and its considerations |
| Homepage and hub said guides "are being checked by a qualified coach" (no reviewer is appointed) | Now "waiting for review by a qualified coach" |
| Leak test found reviewer questions would publish once a formation is reviewed | Reviewer notes are preview-only and the build fails if one reaches a public page |
| Build check mistook "Coaching reviewed" chips for "review required" | Pattern corrected |

## 3. axe-core findings left open

- `color-contrast` on two pages (Far side in, The screen): axe measured a "started here" shirt number inside the SVG against the page's Paper background, because it cannot see the blue pitch behind it. Calculated against the pitch, white at 85% on Pitch Blue is about 5.4:1. **False positive**, checked by calculation and screenshot.

## 4. Interaction checks (all pass, Chromium, 375px)

Skip link is the first Tab stop and moves focus to main · diagram tabs: arrow keys, Home and End, focus follows selection, one panel visible · Enlarge opens a modal on the selected view, focus starts on Close, caption and diagram title/description present, Tab stays inside, Next syncs the page tabs, Escape closes and focus returns · Key lists only the symbols in the current frame · mobile menu opens with focus inside, Escape closes and returns focus · checklist ticks persist after reload (blocked storage is handled in code with try/catch but was not tested here) · newsletter demo: email and consent errors with focus on the first error, success says nothing was sent, no network request · sequence Play with reduced motion steps without animating.

## 5. Other checks

- **Contrast of tokens:** the design system's generated report (`design-system/docs/contrast-report.md`) passes every permitted pairing; coral and yellow never carry text.
- **Touch targets at 375px:** all controls at least 24px; buttons, tabs, menu and nav at least 44px. The 22px checkboxes sit inside 48px labels, which are the real targets.
- **Diagram readability:** numbered diagrams render at 280px or wider at 320px viewport; compact previews have numbers and labels off (design rule 7.5).
- **Content warnings (left for the content team, not changed):** far-side-in has a 5.3-unit marking contact between 11 (or 7) and an opponent; eight frames have unlabelled highlighted areas (needed for greyscale and print).
- **No dark theme:** the brand has none ("calm pages" on Paper). Pages ignore `prefers-color-scheme`. Flagged in `OUTSTANDING.md`.

## 6. Not tested (needs a person or other browsers)

- Screen readers: VoiceOver (iOS, macOS), TalkBack, NVDA. In particular, how the diagram descriptions sound, the tab pattern, both dialogs, the format strip.
- Safari (iOS and macOS) and Firefox: not available in this environment. `<dialog>`, `:focus-visible`, `text-wrap: balance` and `inline SVG <use href>` sprites are the features to watch.
- Real phones outdoors; pinch-zoom in the enlarged diagram (`touch-action: pinch-zoom` is set, not tested on a device).
- Browser zoom to 200% and 400%, text-only zoom, Windows forced-colours mode.
- Print stylesheet (diagrams switch to the light theme in `@media print`; not checked on paper).
- Performance on a slow connection (no Lighthouse run).
- The deployed site on Cloudflare (headers, Access, redirects): not deployed yet.
