# How We Play Football Design System v1.1.0

> Vendored into the How We Play website repo. Content now lives in `../content/` so there is one copy; tests and the showcase read it from there. See `CHANGELOG.md`.

Portable, framework-free design system for How We Play. Source of truth: **Design Specification v1.1** (approved).

## Layers (kept separate)
| # | Layer | Folder | Depends on |
|---|---|---|---|
| 1 | Content and coaching data | **moved to the website repo:** `../content/` (formations, facts, register) | nothing |
| 2 | Brand and design tokens | `tokens/` | nothing |
| 3 | Rendering components | `diagrams/`, `components/` (Stage 2) | tokens |
| 4 | Page layouts | `templates/` (Stage 3) | components |
| 5 | Output formats | `outputs/web`, `outputs/print`, `outputs/social` (Stage 3) | templates and renderers |

```
hwp-design-system/
  tokens/        tokens.json (edit) · build-lib.mjs · build.mjs · tokens.css (generated)
  css/           foundations.css
  assets/        logo/ · favicon/ · social/ · icons/
  fonts/         README.md (sources and licences; no font files)
  governance/    publishing-policy.md · publish-gate.mjs   (the live register is ../content/register.json)
  docs/          brand-guidelines.md · contrast-report.md · components.md · tactical-diagram-spec.md
  diagrams/      renderer.mjs (framework-free) · diagram.css
  components/    components.mjs · behaviours.mjs · components.css
  tests/         suite.mjs · run.mjs  (node tests/run.mjs)
  showcase/      components.html (Stage 2 library) · frame.html · demos.mjs
```
This package contains only How We Play files. It doesn't depend on any other design system, and no third-party font files are included.

## Quick start
```html
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Big+Shoulders+Display:wght@700;800;900&family=Schibsted+Grotesk:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400&display=swap">
<link rel="stylesheet" href="/hwp-design-system/tokens/tokens.css">
<link rel="stylesheet" href="/hwp-design-system/css/foundations.css">
<link rel="icon" href="/hwp-design-system/assets/favicon/favicon.svg" type="image/svg+xml">
```
Change a value: edit `tokens/tokens.json`, then run `node tokens/build.mjs`. That regenerates `tokens.css` and `docs/contrast-report.md`.

## Stages
- [x] **Stage 1: Foundations.** Brand assets, tokens, typography, colour, layout, borders and panels, icons, motion, governance.
- [x] **Stage 2: Components and diagrams.** Framework-free renderer (preserves P0/P1 `renderPitch`), 8 diagram variants, animation timeline, UI components, publishing gate wired into demos, 24 tests. Open `showcase/components.html` over a local server (`npx serve .` or `python3 -m http.server`).
- [ ] **Stage 3: Templates.** Web pages, A4 print, social and video renderers.
- [ ] **Stage 4: Showcase and handover.** Component docs, diagram spec, integration guide, QA report, zip package.

## Renderer
See `docs/tactical-diagram-spec.md`. The exploration-only `hwp-pitch.js` (React) at the project root is superseded by `diagrams/renderer.mjs` and isn't part of the package.
