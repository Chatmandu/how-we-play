# 9v9 Issues 02 and 03 — Implementation and review

**Branch:** `draft/9v9-issues-02-03`  
**Pull request:** https://github.com/Chatmandu/how-we-play/pull/1  
**Editorial approval:** 20 October 2026, by the project owner in conversation: “these are approved. Please proceed.” This authorises implementing the two proposed editorial manuscripts. **It is not evidence of qualified coaching review**.

## Delivered in the private preview

| | Issue 02 — 3-3-2 | Issue 03 — 2-2-3-1 |
|---|---|---|
| Source | Prior research draft 0.1 + editorial manuscript 0.2 | Prior exploratory draft 0.1 + editorial manuscript 0.2 |
| Issue chapters | 4 | 4 |
| Illustrated playing principles | 4 | 4 |
| Positional guides | 6 | 6 |
| Tactical diagram sets | 10 | 10 |
| Diagram frames, including positions | 17 | 16 |
| Coaching-review status | `review-required` | `review-required` |
| Exploratory | No | **Yes; separate public approval needed** |
| Allowed in public build | **No** | **No** |

The website already has generic issue, lesson and positional templates. Each private JSON now fills those templates; there is no duplicate editorial content hard-coded in the page components.

### Private preview paths

- `/formations/9v9/3-3-2/`
- `/formations/9v9/3-3-2/middle-first/`
- `/formations/9v9/3-3-2/ball-side-wide/`
- `/formations/9v9/3-3-2/one-comes-one-goes/`
- `/formations/9v9/3-3-2/go-together/`
- `/formations/9v9/3-3-2/positions/{goalkeeper|centre-back|outside-defenders|central-midfielder|wide-midfielders|two-forwards}/`
- `/formations/9v9/2-2-3-1/`
- `/formations/9v9/2-2-3-1/two-connected/`
- `/formations/9v9/2-2-3-1/width-cover/`
- `/formations/9v9/2-2-3-1/protect-middle/`
- `/formations/9v9/2-2-3-1/lose-it-find-home/`
- `/formations/9v9/2-2-3-1/positions/{goalkeeper|central-defenders|wing-backs|central-midfielder|interior-midfielders|striker}/`

The previews contain **proposed** movement illustrations to visualise the approved editorial briefs; they are not yet validated training exercises or tactical prescriptions. Players' starting numbers are illustrative and should not be mistaken for permanent roles.

## Source integrity

The approved manuscripts live at:

- `content/drafts/9v9-issue-02-3-3-2-editorial.md`
- `content/drafts/9v9-issue-03-2-2-3-1-editorial.md`

The machine-readable content files are:

- `content/formations/9v9/3-3-2.private.json`
- `content/formations/9v9/2-2-3-1.private.json`

The private JSONs retain the existing research draft's diagrams (`one-comes`, `wb-recovery`) and expand the proposals. Added frames are not represented as excerpts of Niall's original Mossley Hill playbook. The shared issue, lesson and position templates now use different attribution for original-playbook drawings and new editorial illustrations.

## Editorial and coaching review — David Wilson

**Issue 02 decisions:**

- Is the midfield described honestly as a flat three or should 8 often be deeper?
- Which defender covers when an outside defender advances?
- When does the far-side midfielder remain wide rather than coming in?
- What are practical two-forward pressing triggers?
- Are the existing offside-line illustrations and run timings correct?
- Are the proposed rule, role and team-movement scenes suitable for grassroots U12–U13 players?

**Issue 03 go/no-go decisions:**

- Is `2-2-3-1` an accurate notation for the intended roles?
- Should this be a regular system, occasional learning exercise or not published?
- Are wing-back recovery distances and duties developmentally realistic?
- Who covers the middle when players advance?
- Does “Lose it? Find home” encourage the right first defensive decision, or should it be revised?
- Are the proposed central-defence overload examples appropriate?
- Does the formation permit inclusive role rotation, player enjoyment and sensible substitutions?

**Approval process:** David reviews the **current full structured content version**, not just the editorial manuscript. Record substantive edits, exact version fingerprint, date, decision, qualifications/limitations and written approval evidence under the existing project workflow. Do **not** set `reviewed`, `reviewedBy`, `reviewedOn` or `publicApproval` on the basis of the owner's editorial approval.

## Test instructions

The PR contains `.github/workflows/verify-issues.yml`, which runs:

```sh
npm ci
npm test
npm run build:public
npm run build:preview
```

The public build must exclude Issues 02 and 03 and any links to their private lesson pages. Preview builds must carry the `noindex` and unpublished/review-required indicators.

Browser and visual QA still requires a deployed **private preview**, at desktop and mobile sizes. Check the issue covers, long navigation labels, lesson tab states, role-highlight labels, contrast, keyboard interaction and printed figures before approval.

## Future enhancements intentionally excluded

- Unreviewed corner routines and set-piece content.
- Paid customisable team packages.
- Live issue publication or a claim of coaching endorsement.
- Public PDF downloads from unreviewed issues.

The 3-1-3-1 source content remains unchanged by this PR.
