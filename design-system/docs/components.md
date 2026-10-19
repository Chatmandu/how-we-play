# Component reference v1.0

Deliverable D (Stage 2 scope). Source: `components/components.mjs` (string HTML), `components/behaviours.mjs` (enhancement) and `components/components.css`. Live examples: `showcase/components.html`.

**Contract:** every component is a function that takes data and returns an HTML string. It works with any templating stack (static build, server, Astro or Eleventy, or React via `dangerouslySetInnerHTML`, though a native port is preferred). Call `enhance(root)` once to add keyboard and dialog behaviour. Without JS, everything still renders and reads.

Setup: `configure({ assetBase: '/hwp-design-system/assets/' })`.

## Navigation
| Component | Signature | States / responsive | Accessibility |
|---|---|---|---|
| `header` | `({ items, current, newsletterHref, formats, activeFormat })` | Below 900px the nav collapses to a Menu button and a full-width panel | `nav[aria-label="Main"]`, `aria-current="page"`, the toggle has `aria-expanded` and `aria-controls`, Esc closes and returns focus |
| `formatStrip` | `(formats, active)` | `soon:true` shows plain text "coming later" (no dead links). Ages are hidden below 600px | `aria-current="true"` on the active format |
| `breadcrumbs` | `(items)` | Wraps | `nav[aria-label="Breadcrumb"]`, the last item has `aria-current="page"` |
| `inPageNav` | `(items, label)` | Wraps, targets of 44px or more | Labelled nav |
| `footer` | `({ columns })` | Auto-fit columns | Independence statement always included |

## Editorial
`pageHeading({ over, title, number, standfirst, chips })` · `standfirst(text)` · `sectionDivider(label, aside)` · `cue({ label, text, extra })` (a `<blockquote>`) · `caption(text)` · `relatedLinks(items, title)`. Type roles come from tokens. Headings are written in sentence case and rendered in capitals.

## Buttons and links
`button({ label, href, variant: 'primary'|'secondary'|'on-pitch', iconName, iconAfter, type, attrs })`. States: hover (Ink becomes Pitch Blue), focus (3px ring, yellow on blue), disabled (50% opacity, `disabled` or `aria-disabled`). Minimum height 48px. Links: `.hwp-textlink` and `.hwp-golink`.

## Tactical figures
| Component | Use | Behaviour |
|---|---|---|
| `diagramFigure({ frames, theme, view, pitch, label, figLabel, context, sequence, exploratory, private, enlarge, key, interactive })` | Lessons, positions, formations | Tabs (`role=tablist`, arrow keys, Home and End), verdict or stage label, caption, Enlarge dialog, Key sheet (only symbols used in the current frame), sequence Play, Previous and Next. Frames are embedded as JSON |
| `wrongRight(w, r, { theme, view })` | Static comparison | Two figures, each with its verdict |
| `preview(frame, { href, title, meta })` | Index rows, links under 200px | Numbers and labels off |
| `key(symbols, theme)` | Inline key at 600px and up | `<ul aria-label="Diagram key">` |

Verdicts always pair a symbol with a word (✕ Wrong / ✓ Right / Stage n of N) and sit beside the caption, never on the pitch.

## Formations
- `formationSelector(formations, current)`: large tap targets (52px or more). It stacks on mobile and becomes columns at 900px. Exploratory items get a dashed border and a tag.
- `formationComparison(list)`: up to three panels (the panel rule), each with a shape, chips, facts (`<dl>`) and a link. **Pass only gate-approved formations in public builds.**

## Interactive
- `disclosure(summary, bodyHtml, open)` uses native `<details>`.
- `checklist(items, { id, title })` keeps ticks on the device, shows a live count, and falls back safely if storage is unavailable.
- `newsletterForm({ action, formats })` validates without the browser's built-in messages: errors are tied to fields with `aria-describedby`, the field gets `aria-invalid`, and focus moves to the first error. Consent is required. The heading copy is a placeholder.
- `feedback('error'|'success', text)` uses `role=alert` or `role=status`, with an icon and a word prefix.

## Status and governance
- `statusChips(item)`: separate chips for content review (Draft / Coaching review required / Coaching reviewed + date), Exploratory, Official rule verified (+ date) and Coming soon. These are never merged.
- `reviewNote(head, text)` · `exploratoryStrip()` · `privateStrip()`.
- What gets published is decided by `governance/publish-gate.mjs`, **not** by the chips. Private preview shows a strip and sets noindex.

## Testing
`node tests/run.mjs` runs 24 tests covering rendering, accessibility markup, themes, variants, mirror, validation, timeline and the publishing gate. The same suite runs live at the bottom of the showcase.

## Known gaps (Stage 2)
- Components return strings. A framework-native port (React, Vue) is optional and should wrap these, not fork them.
- Dialogs use `<dialog>`, which needs a polyfill only for very old browsers.
- The sprite `<use href>` needs same-origin hosting.
