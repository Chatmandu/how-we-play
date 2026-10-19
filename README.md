# How We Play website

Source for **howweplayfootball.com**: free, visual coaching guides for grassroots football coaches, starting with 9v9.

Static site built with [Astro](https://astro.build) on top of the How We Play design system (vendored in `design-system/`). Nothing here is deployed to the live domain yet.

## Quick start

Requires Node 22.12 or later (see `.nvmrc`).

```bash
npm install
npm run dev               # local preview of everything, at http://localhost:4321 (target: local)
npm test                  # design-system tests, publishing-gate tests, content validation
npm run build:public      # what the live site would contain → dist/
npm run build:preview     # private preview build, everything marked and noindexed → dist/
npm run build:both        # both side by side → dist-public/ and dist-preview/
npm run test:leak         # proves the public build fails if unreviewed content leaks in (about a minute)
```

`npm run build` runs, in order: copy design-system assets to `public/hwp/` → validate content → `astro build` → `scripts/check-build.mjs` (link, metadata, accessibility-markup and publishing checks, then writes `sitemap.xml`, `robots.txt` and `_headers` for the target). Any failure stops the build.

## What's where

```
content/                 THE content. Edit words and tactics here, nowhere else.
  site.json              name, tagline, philosophy, formats strip
  register.json          publishing status of every page and content item (three tracks)
  formations/9v9/*.json  formation data: shape, rules, roles, diagrams, review questions
  editorial/             official rule facts (with sources and dates), Moving Up checklist
design-system/           How We Play design system v1.0.1 (tokens, renderer, components, publish gate)
src/
  lib/model.mjs          content model and publishing decisions (shared by Astro and Node scripts)
  lib/content.mjs        loads content for the build
  lib/ui.mjs             design-system components, configured for this site
  layouts/Base.astro     metadata, header, footer, preview banner, gate enforcement
  components/            thin Astro wrappers (Figure, Gated, Facts, GuideNav, Newsletter, Pager)
  pages/                 routes (see docs/CONTENT-AND-ROUTING.md)
  styles/                fonts.css (self-hosted) and site.css (page layout only)
public/fonts/            Big Shoulders Display and Schibsted Grotesk, Latin WOFF2, OFL licences
public/og/default.png    social sharing image (regenerate with npm run og)
scripts/                 sync, validation, build checks, tests, OG image, browser QA
docs/                    project documentation (below)
```

## Documentation

| Document | What it covers |
|---|---|
| [docs/CONTENT-AND-ROUTING.md](docs/CONTENT-AND-ROUTING.md) | Content model, URL structure, how to add a formation or lesson |
| [docs/PUBLISHING-WORKFLOW.md](docs/PUBLISHING-WORKFLOW.md) | The three approval tracks, build targets, how something becomes public |
| [docs/SEO.md](docs/SEO.md) | Metadata, canonical URLs, structured data, sitemap, robots |
| [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) | GitHub → Cloudflare Pages, private previews, switching on the domain |
| [docs/QA-REPORT.md](docs/QA-REPORT.md) | Accessibility and browser QA: what was tested, results, what wasn't |
| [docs/OUTSTANDING.md](docs/OUTSTANDING.md) | Open issues and decisions needed |
| `design-system/README.md`, `design-system/docs/` | Brand, tokens, components, diagram spec |

## Ground rules

- **Never invent coaching content.** Every movement in a diagram traces to the source playbook or a draft's written brief.
- **A status label is not permission to publish.** The public build only contains items the gate in `design-system/governance/publish-gate.mjs` allows. Today that means no formation content at all: every formation, the 3-1-3-1 included, is awaiting qualified coaching review.
- **One copy of everything.** Content lives in `content/`; the website, future PDF and video tools read the same files.
- How We Play is an independent project, not affiliated with or endorsed by The FA or England Football.
