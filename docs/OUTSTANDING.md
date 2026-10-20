# Outstanding issues and decisions

## Decisions recorded (19 October 2026)

- Design system approved by Niall Walsh, 19 October 2026 (recorded on every register entry).
- Source playbook: Niall's own work; permission granted.
- 20 October 2026: the earlier Greg Williams review entry was withdrawn (no documented approval). Intended coaching reviewer: **David Le Tissier**. No review is recorded yet, so the 3-1-3-1, 3-3-2, 2-2-3-1 and the Moving Up checklist are all private. See `CONTENT-REVIEW-REGISTER.md`.
- Author on About: Niall Walsh.
- Domain: live at howweplayfootball.com (Cloudflare Workers).
- Positioning: How We Play covers grassroots formats generally; 9v9 is the first collection. No claim of 3v3 coaching experience.

## Still open

| # | Decision | Note |
|---|---|---|
| 1 | Answers to the 3-1-3-1 reviewer questions (offside, trade-offs, three forwards, rotation) | Hidden from the public site; write them into the content when ready |
| 2 | Newsletter provider and privacy notice | Demo in preview only |
| 3 | 3-3-2 and 2-2-3-1 publicly? | Only after review; 2-2-3-1 also needs a recorded public approval |
| 4 | Dark mode | The brand has none |

## Before launch

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
