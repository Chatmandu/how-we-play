# Content and routing

## Principles

- Content is data. Pages never hard-code coaching words: a principle is written once in `content/formations/…json` and the guide, its lesson page, the homepage feature, the future PDF and any video tool all read that one entry.
- Layers stay separate: **content** (`content/`) → **tokens** (`design-system/tokens`) → **rendering** (`design-system/diagrams/renderer.mjs`, `design-system/components`) → **page templates** (`src/pages`, `src/layouts`).
- The renderer is a pure function (data in, SVG string out). It runs at build time, so every diagram is in the HTML; JavaScript only adds tabs, Enlarge, Key and sequence playback.

## Content files

| File | Holds | Owner |
|---|---|---|
| `content/site.json` | Name, tagline, philosophy, positioning sentence, independence statement, format strip | Editor |
| `content/register.json` | One entry per publishable item: `design.status`, `content.status` (+ reviewer, date, exploratory, public approval), `factIds`, `availability` | Editor (status changes only via the workflow) |
| `content/formations/9v9/3-1-3-1.json` | The flagship: shape, `gives`, four `rules`, eight `roles`, `diagrams` (all frames), `review` questions. Extracted verbatim from the P1 prototype, measured from the source playbook | Editor; reviewer signs off |
| `content/formations/9v9/3-3-2.private.json` | Research draft 0.1: shape, rule table, one illustrated lesson, role summaries, considerations, reviewer questions | Draft, not reviewed |
| `content/formations/9v9/2-2-3-1.private.json` | Exploratory draft 0.1: as above, `exploratory: true` | Draft, not reviewed |
| `content/editorial/format-facts.json` | Official rule facts and FA guidance, each with source, date checked and season | Editor (rule track) |
| `content/editorial/moving-up-checklist.json` | Pre-season checklist (draft) | Editor |

The formation file's `status` must match its register entry; the build fails if they disagree, so status can't drift.

### Diagram data
Schema and rules: `design-system/docs/tactical-diagram-spec.md`. Every frame needs a `caption` and an `altSummary` (who moves, why, what opens or closes). `npm run validate` runs the renderer's validator over every frame: overlaps and hidden balls are errors; marking contact and unlabelled areas are warnings for the content team.

## Routes

| URL | Template | Built from | Public build today |
|---|---|---|---|
| `/` | `src/pages/index.astro` | site, register `home`, facts, featured rule (3-1-3-1 rule 2) | Yes, without formation content |
| `/formations/9v9/` | `src/pages/formations/9v9/index.astro` | facts, all formations (gated) | Yes, facts only; formations replaced by a "in review" note |
| `/formations/9v9/{formation}/` | `…/[formation]/index.astro` | one formation file | No (all three blocked) |
| `/formations/9v9/{formation}/{lesson}/` | `…/[formation]/[lesson]/index.astro` | one rule plus its diagram set | No |
| `/formations/9v9/3-1-3-1/positions/{position}/` | `…/positions/[position]/index.astro` | one role plus its diagram set | No |
| `/moving-up/` | `src/pages/moving-up/index.astro` | facts (verified); checklist (draft, preview only) | Yes, without the checklist |
| `/about/` | `src/pages/about/index.astro` | site, register | Yes |
| `/coaching-notes/` | `src/pages/coaching-notes/index.astro` | register `coaching-notes` | Teaser only, noindex; demo form in preview |
| `/football-explained/` | `src/pages/football-explained/index.astro` | register `football-explained` | Teaser only, noindex |
| `/404.html` | `src/pages/404.astro` | | Yes, noindex |

Lesson slugs are the rule ids: `middle-first`, `one-goes-one-stays`, `far-side-in`, `show-them-wide` for the 3-1-3-1; `one-comes-one-goes` (3-3-2 draft); `lose-it-find-home` (2-2-3-1 draft). URLs use trailing slashes and directory output (`astro.config.mjs`).

Dynamic routes only generate pages the publishing gate allows for the current build target (`getStaticPaths` filters on `f.gate.allowed`). The layout throws if a blocked page is rendered anyway, and the post-build check fails on any link to a page that doesn't exist, so a public page can't link to a blocked lesson.

## Adding a formation

1. Create `content/formations/9v9/{slug}.json` following the 3-1-3-1 file. Set `status.content: "draft"` (or `"review-required"`), `exploratory: true` if it applies, a unique `order`, and `registerId`.
2. Add the matching entry to `content/register.json` with the same status.
3. Draw diagrams only from a written source or brief. Author both left and right versions; don't use `mirrorOf` on a draft until a reviewer approves mirroring.
4. `npm test`, then `npm run dev`. The formation appears in local and preview builds, marked private; it stays out of the public build until reviewed.

No template changes are needed: the hub, guide, lesson pages, navigation and comparison table all read the formation list.

## Adding a lesson to an existing formation

Add a rule with an `id` (the URL slug), `n`, `title`, `tag`, `summary`, `cue`, `diagram` (a key in `diagrams`), `src`, and optionally `look` and `reviewRefs`. Add the diagram set under `diagrams`. The lesson page, guide row, guide navigation and pager appear automatically.

## Editorial pages

About, Moving Up, Coaching Notes and Football Explained are Astro templates that read site data and facts. Their prose sits in the template for now because each page is one-off; if a CMS is added later (see `docs/DEPLOYMENT.md`), move that prose into `content/pages/*.md` with frontmatter and render it with Astro content collections.
