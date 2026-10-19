# Publishing workflow

A review-status label is **not** permission to publish. What reaches howweplayfootball.com is decided by the publishing gate (`design-system/governance/publish-gate.mjs`), run inside every build. This document explains the tracks, the build targets and the steps a small team follows.

## Three independent approval tracks

Recorded per item in `content/register.json`. None implies another.

| Track | Covers | Owner | States | Public requirement |
|---|---|---|---|---|
| Design approval | Identity, components, templates, diagram styling | Project lead | `proposed` → `approved` | `approved` |
| Coaching content review | Formations, rules, positions, diagrams, checklists, sessions | Qualified coach reviewer | `draft` → `review-required` → `reviewed` (+ `reviewedBy`, `reviewedOn`); flag `exploratory` | `reviewed` with reviewer and date. Exploratory items also need `publicApproval: { by, on }` |
| Official rule verification | Ages, formats, pitch, goals, ball, offside, heading, restarts | Editor | `unchecked` → `verified` (source, `checkedOn`, `season`) | Every fact on the page `verified`; a warning if the season has rolled over |

## Build targets

| Target | How it's chosen | Contains | Marking |
|---|---|---|---|
| `public` | `HWP_TARGET=public`, or the Cloudflare production branch (`main`) | Only gate-approved items | Status chips; no reviewer notes, no demo form, indexable |
| `preview` | `HWP_TARGET=preview`, or any other Cloudflare branch | Everything | Private-preview banner, private strip on unreviewed sections, exploratory strip and frame, `noindex` meta, `X-Robots-Tag: noindex`, `robots.txt` disallow |
| `local` | default for `npm run dev` and unset builds outside Cloudflare | Everything | As preview |

Safety rules in `src/lib/model.mjs`:
- On Cloudflare, the production branch always builds `public`; asking for anything else there **fails the build**. A missing variable can't leak drafts.
- Pages and sections declare the register ids they are built from. The layout refuses to render a page whose items are blocked; `<Gated>` sections render their fallback instead.

## What the post-build check enforces (`scripts/check-build.mjs`)

The build fails if:
- any internal link, image, script or stylesheet points at a file that isn't in the build (this catches a public page linking to a blocked lesson);
- a public page contains any marker of private, unreviewed, exploratory, reviewer-only or demo content, or is `noindex` (other than 404 and the two teasers);
- a preview page is indexable;
- a page built from exploratory content lacks the exploratory strip;
- a page lacks exactly one `<h1>`, a title, a meta description or a canonical URL;
- a diagram lacks a non-empty `<title>` and `<desc>`.

`npm run test:leak` proves the first two by injecting a link and an unreviewed chip into a copy of the site (both builds fail), and proves the positive case by marking the 3-1-3-1 reviewed in a copy (its guide, lessons and positions publish; the drafts stay out).

## Current state (19 October 2026)

| Item | Design | Coaching | Rules | Public build |
|---|---|---|---|---|
| 9v9 3-1-3-1 | approved | review-required | n/a | **Blocked** |
| 9v9 3-3-2 (research draft 0.1) | approved | review-required | n/a | **Blocked** |
| 9v9 2-2-3-1 (exploratory draft 0.1) | approved | review-required, exploratory | n/a | **Blocked** (needs review and public approval) |
| Moving Up checklist | approved | draft | n/a | **Blocked** |
| Homepage, 9v9 hub, Moving Up, About | approved | n/a | verified 19 Oct 2026, 2026/27 | Published (without blocked sections) |
| Coaching Notes, Football Explained | | | | Teaser only (`coming-soon`) |
| Newsletter form | | not connected, no privacy notice | | Demo in preview only |

Note: the Design Spec v1.1 file says "proposed"; the design-system README, the register and the brief say approved. The site treats design as approved. Confirm, and record the approval date.

## Steps: getting a formation published

1. **Draft** on a branch. Edit `content/`. Push: Cloudflare builds a private preview for the branch.
2. **Request review.** Set `content.status` to `review-required` in both the formation file and the register. Share the preview URL with the reviewer (Cloudflare Access, see `docs/DEPLOYMENT.md`).
3. **Reviewer works through** the "Still being written" questions and the diagram notes in the preview. Changes go into `content/` (same branch), not into a separate document.
4. **Record the review.** Set `status: reviewed`, `reviewedBy` and `reviewedOn` in both places. For an exploratory formation also record `publicApproval: { by, on }`.
5. **Rule check.** Re-verify any official facts the pages use; update `checkedOn` and `season`.
6. **Merge to `main`.** The production build runs the gate and the checks. If anything still links to blocked content or carries a draft marker, the build fails and nothing is deployed.

Reviewer notes, placeholders and "questions for the reviewer" never appear in public builds; they are working notes. Answers go into the content itself.

## Each season

Before each new season (the gate warns once the season changes): re-check every fact in `content/editorial/format-facts.json` against England Football, update dates and season, then rebuild.
