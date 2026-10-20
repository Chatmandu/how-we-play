# QA report: refinement pass (branch `editorial`, 20 October 2026)

Tested on the public build (`dist-public`, 7 pages, 4 in sitemap) and the preview build (`dist-preview`, 24 pages, all noindex). Automated checks run in headless Chromium (Playwright). Nothing here was tested on real devices or with a screen reader.

## Summary

| Area | Result |
|---|---|
| Builds and build checks | Pass, both targets |
| Unit, gate and content tests (`npm test`) | Pass: 24/24, 13/13, content valid |
| Publishing-gate negative tests (`npm run test:leak`) | Pass: 5/5 (two new: stale review, unconfirmed profile and playbook pages) |
| Layout at 1440, 834 and 390px | No horizontal overflow, no console errors, all pages HTTP 200 (39 screenshots) |
| Automated accessibility (axe-core 4.10, WCAG 2.0/2.1/2.2 A and AA rules) | 4 rule types found and fixed; 1 outstanding (below) |
| Keyboard | Pass (below) |

## Functional

| Check | Result |
|---|---|
| Internal links, images, scripts | Pass: build check fails on any broken reference; none |
| Lesson steps: click, Arrow keys, Home, End | Pass: `aria-pressed`, focus and visible frame stay in step |
| Step announcements | Pass: polite live region, e.g. "Step 2 of 3: Ball left. Right. 3 goes. 2, 5 and 6 protect us." |
| Enlarge | Pass: opens a modal, focus moves to Close, Esc closes and returns focus to Enlarge; works on single-frame position diagrams |
| Key | Pass: disclosure opens |
| Animated sequences | Pass: movement plays from recorded "started here" positions only; reduced motion shows the final frame |
| Without JavaScript | Pass: every frame and caption visible, navigation visible |
| Phone guide navigation | Pass: previous/next are 44 × 44px; "All rules and positions" lists 12 links |
| Responsive menu | Pass: hidden by default on phones, opens with `aria-expanded="true"`, Esc closes and returns focus to Menu |
| Team sheet | Pass: hovering a player lights the roster row; pitch links are pointer-only (`tabindex=-1`), the roster is the keyboard route |
| Newsletter demo states | Pass: preview shows the marked demo form; public shows the teaser only, no form |
| Tab order, lesson page | 33 stops, every one with a visible focus indicator |

## Accessibility (automated, axe-core 4.10)

Fixed during QA:
- `color-contrast`: transitions labels on Moving Up (pale grey on paper).
- `target-size`: source links in the scoreboard were under 24px tall.
- `definition-list`: homepage stats had a `small` directly inside the `dl`.
- `nested-interactive`: the team-sheet pitch had links inside an image role. The pitch is now hidden from assistive technology with its summary given as text; the roster carries the links.

Outstanding:
- `color-contrast` on "started here" ghost player numbers inside two diagrams (Far side in, The screen). This is the design-system renderer's deliberate faded style. The diagrams are images with full text descriptions, so the information is available, but the faded numbers are hard to read for low-vision users. **Recommendation:** raise ghost-number contrast in the renderer (design-system change, so it needs your sign-off).

Not done, and needed before claiming WCAG 2.2 AA:
- Screen-reader testing (VoiceOver on iOS and macOS, NVDA on Windows).
- Real-device testing (iPhone Safari, Android Chrome), 200% and 400% zoom, Windows high-contrast mode.
- Manual review of reading order and alternative text by a person.
We don't claim the site is WCAG 2.2 AA compliant.

## Editorial

| Check | Result |
|---|---|
| Author information | Niall Walsh, from `content/site.json`; byline on guides, lessons and positions; About uses your copy |
| Reviewer attribution | No review is recorded, so no page says "reviewed". Greg Williams removed from templates, content and current docs. David appears only in preview until his profile is confirmed |
| Review-status labels | Preview pages show "Coaching review required" and "Awaiting coaching review. Not yet published." |
| Official rule sources | Every fact links to England Football with checked date (19 October 2026, season 2026/27) |
| Publication dates | No publication dates are shown; review dates will come from the register when they exist |
| Content versioning | Each formation has a content version (3-1-3-1: `cv-353fff2a`). A changed formation drops back to review (tested) |
| Formation-specific explanations | Position and lesson text is unchanged from the 3-1-3-1 file, which is redrawn from the source playbook |
| Unreviewed content restrictions | Public build: no formation pages, no diagrams of unreviewed content, no reviewer profile, no playbook pages (files deleted from output). Development shelf names guides by status only |

## Search

| Check | Result |
|---|---|
| Indexable URLs (public) | `/`, `/about/`, `/formations/9v9/`, `/moving-up/` |
| Noindex (public) | `/coaching-notes/`, `/football-explained/` (teasers), `/404.html` |
| Titles | 28 to 60 characters |
| Descriptions | 118 to 159 characters on indexable pages |
| Canonicals | All on `https://howweplayfootball.com/` |
| Headings | One `h1` per page (build check); no skipped levels after the team-sheet fix |
| Structured data | Valid JSON-LD: WebSite, Organization (founder, sameAs), AboutPage with Person, BreadcrumbList; Article with Person author on preview guide pages |
| Sitemap and robots | Public sitemap lists the 4 indexable pages; robots allows all. Preview: robots disallows all, `X-Robots-Tag: noindex` on every response |
| Draft pages | Preview only, noindex, private strip |

## Not verified
- The social accounts (YouTube, Instagram, TikTok @howweplayfootball) exist and are live. They are linked in structured data as supplied.
- Behaviour in Safari and Firefox.
- That the original playbook pages may be shown (awaiting your confirmation).
- David Le Tissier's biography (awaiting his confirmation).
