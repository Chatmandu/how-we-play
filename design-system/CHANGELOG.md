# Design system changelog

## 1.0.1 (19 October 2026, website foundation build)
Fixes found while building the website. No token values, renderer output or diagram data changed.
- **Content moved out:** `content/` and `governance/content-register.json` now live at the website root (`/content/`). `tests/run.mjs` and `showcase/demos.mjs` read from there, so there is only one copy of the coaching content.
- **Cue component:** the blockquote used the `hwp-cue` class, so the optional "extra" line inherited cue typography (display capitals). It now uses `hwp-cue-block`.
- **Figures at 320px:** grid children of `.hwp-figure`, `.hwp-compare-panels` and `.hwp-compare-panel` may now shrink (`min-width: 0`), and `.hwp-figure__tools` wraps, so long tab labels, strips and sequence controls no longer push a figure wider than a small phone.
- **Go-link target size:** `.hwp-golink` gets 8px top padding so it is at least 24px tall (WCAG 2.2 target size).
- **Stylesheet order (integration note, not a code change):** load `diagram.css` before `components.css`, otherwise `.hwp-pitch { width: 100% }` overrides the key swatch size and the diagram key renders huge.

## 1.0 (19 October 2026)
Stage 1 foundations and Stage 2 components and diagrams, as handed over.
