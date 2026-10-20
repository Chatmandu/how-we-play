# QA report: editorial redesign (branch `editorial`)

20 October 2026. Scope: homepage, 9v9 hub, 3-1-3-1 guide, the four 3-1-3-1 lesson pages (one template; One Goes, One Stays checked in detail) and Moving Up. Position pages, About and the teaser pages keep their existing layouts and inherit the new masthead and footer. Not deployed.

## Results

| Check | How | Result |
|---|---|---|
| Public build and build checks | `npm run build` | Pass. 20 pages, 17 in sitemap (unchanged) |
| Preview build | `npm run build:preview` | Pass. 24 pages, all noindex |
| Unit and content tests | `npm test` | Pass. 24/24, 13/13, content valid |
| Publishing-gate negative tests | `npm run test:leak` | Pass. 3/3 (see fix below) |
| Horizontal overflow | Playwright, 1440px and 390px, 5 pages | None |
| Console and script errors | Same run | None |
| Step controls, keyboard | Playwright: Arrow keys, Home, End on the lesson figure | Pass. `aria-pressed`, focus and visible panel move together; a polite live region announces the step and caption |
| Step controls, phone | 390 × 844 | Figure and steps fit one screen (0–589px); focusing a step scrolls the whole figure into view |
| Without JavaScript | Playwright, JS disabled | Every frame visible with its caption; steps hidden; nav visible |
| Reduced motion | `prefers-reduced-motion: reduce` | Steps work; no movement animation |
| Unreviewed formations in public HTML | Build check plus manual read | 3-3-2 and 2-2-3-1 appear by name and status only on the hub and homepage shelf. No shapes, rules, diagrams or links |

Page heights (desktop / phone): homepage 3,024 / 3,941 (live: 4,315 / 6,588); hub 2,216 / 3,616; guide 2,180 / 3,590; lesson 1,703 / 2,275; Moving Up 1,826 / 2,852.

## Review and verification claims

Every review date on the site is read from `content/register.json`; nothing is typed into templates. The helper `reviewRecord()` only returns a review when status is `reviewed` and both a name and a date are present.

- **3-1-3-1 coaching review (Greg Williams, 19 October 2026).** The register entry was made on Niall Walsh's written instruction in this project ("Greg reviewed on 19 October", commit 547ff55). No review document signed by Greg Williams is held in the repository. A `reviewEvidence` field now says so. **Action for you:** get a short written confirmation from Greg (email is enough) and keep it with the project records before deploying.
- **Official rule facts (19 October 2026).** Checked against the England Football pages linked beside every fact.
- **3-3-2, 2-2-3-1, Moving Up checklist.** No review is recorded. They stay out of the public build.

## Fixes found during QA

- The leak test's injection point was the old homepage headline, so two negative tests stopped being able to fail. They now target the new headline, and the script stops with an error if that anchor disappears again.
- Lesson panels ignored `hidden` because of a `display` rule; fixed.
- Mobile cover headline wrapped to an orphan word; recomposed to "The step up / to 9v9".

## Known limits

- The Enlarge dialog from the old figure component isn't used on these pages. The figure runs full width on phones instead. The Key is still available.
- Position pages still use the earlier page layout under the new masthead. Bringing them into the editorial layout is the next step if you want it.
- Not tested with a real screen reader or on physical devices; the checks above are automated in Chromium.
