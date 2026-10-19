# Outstanding issues and decisions

## Decisions needed

| # | Decision | Why it matters | Suggested answer |
|---|---|---|---|
| 1 | Confirm the design system is **approved**, with a date | The Design Spec v1.1 file says "proposed"; the register and brief say approved. The public build requires approved | Approve and record the date in `content/register.json` |
| 2 | Rights to the source playbook | Every 3-1-3-1 page derives from it | Written agreement with the club before any public 3-1-3-1 content |
| 3 | Appoint the qualified coaching reviewer | Nothing coaching-related can be public until reviewed | Name, qualification, date in the register |
| 4 | Author name for About | About says "name to be confirmed" | Confirm before launch |
| 5 | Is a site with **no formation guides** worth launching? | Until review, the public build is home, 9v9 facts, Moving Up and About | Keep the domain dark until the 3-1-3-1 is reviewed |
| 6 | Newsletter provider and privacy notice | The form is a demo in preview only | Decide after coach testing |
| 7 | Commission "Compare the three formations" copy? | The hub has the structural comparison; a fuller page needs content | Not yet |
| 8 | Show 3-3-2 / 2-2-3-1 publicly at all? | Drafts include coaching judgement and an experimental shape | Only after review; 2-2-3-1 also needs recorded public approval |
| 9 | Dark mode | The brand has none; some users expect it | Leave until the brand defines one |

## Before launch

- Close decisions 1 to 4.
- Reviewer works through the "Still being written" questions; record review in the register.
- Fix the content warnings from `npm run validate` (labels on highlighted areas; check the far-side-in marking contact).
- Screen-reader, Safari, Firefox and real-device testing (`docs/QA-REPORT.md` section 6).
- Trim long meta descriptions; per-page Open Graph images; Search Console.
- Re-check official facts if the season or England Football guidance changes.
- Cloudflare: Access on previews, then custom domain (`docs/DEPLOYMENT.md`).

## Known issues

| Issue | Severity | Note |
|---|---|---|
| axe reports two SVG contrast false positives | Low | Section 3 of the QA report |
| Reviewed date shows as ISO (`2026-10-19`) in the "Coaching reviewed" chip | Low | Design-system `statusChips`; format to "19 October 2026" in 1.0.2 |
| 9v9 header dropdown from the spec (§8) not built; "9v9 formations" is a plain link | Medium | Add when there is more than one public formation |
| PDF, print templates, social and video outputs | Planned | Stage 3 of the design system; the content and renderer are ready for them |
| Moving Up 7v7 → 9v9 full article (P1) not ported; the landing page carries the verified facts and the draft checklist (preview only) | Medium | Port when reviewed |
| `/football-explained/` and `/coaching-notes/` are teasers | By design | Only completed content is published |
