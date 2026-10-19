# Publishing policy (governance v1.0)

**Rule:** a review-status label is not permission to publish. Unreviewed coaching advice stays in private development and testing until it has been reviewed. This includes the 3-3-2 draft and the exploratory 2-2-3-1.

## Three independent tracks

| Track | Covers | Owner | States | Who sees it |
|---|---|---|---|---|
| Design approval | Identity, tokens, components, templates, diagram styling | Project lead | `proposed` → `approved` | Internal only |
| Coaching content review | Formations, rules, positions, diagrams, sessions | Qualified coach reviewer | `draft` → `review-required` → `reviewed` (+ name, date). Separate flag: `exploratory` | Public chip, but **public builds only include `reviewed` items** |
| Official rule verification | Ages, pitch sizes, offside, heading, ball | Editor | `unchecked` → `verified` (source, date, season) | Public chip with date and source |

None of these implies another. An approved design never approves coaching content, and a verified rule never verifies a tactic.

## Build targets

| Target | What's included | Marking |
|---|---|---|
| `public` (howweplayfootball.com) | Coaching items with `status: reviewed`, a reviewer and a date. Exploratory items also need a recorded `publicApproval`. Every rule fact must be `verified`. Design must be `approved`. | Status chips |
| `preview` (password-protected staging) | Everything | `noindex`, "Private preview, not for publication" strip on every unreviewed or exploratory item |
| `local` | Everything | Same as preview |

The gate is `governance/publish-gate.mjs`, `evaluate(item, target)`. A public build must call `gate(items, 'public')` and fail if any page links to an item it removed.

## Current state (19 October 2026)

| Item | Coaching | Exploratory | Public build |
|---|---|---|---|
| 9v9 3-1-3-1 (source playbook) | review-required | no | **Blocked** until reviewed |
| 9v9 3-3-2 draft 0.1 | review-required | no | **Blocked** |
| 9v9 2-2-3-1 draft 0.1 | review-required | **yes** | **Blocked** (needs review + public approval) |
| 7v7 → 9v9 format facts | n/a | n/a | Allowed when each fact is `verified` for 2026/27 |

The 3-1-3-1 is also blocked. It comes from a real playbook, but the prototype records it as not yet reviewed, so the same rule applies.

## Coming soon

5v5, 7v7 and 11v11 resources are `availability: coming-soon`. A public page may show a teaser and a newsletter link, never body content.
