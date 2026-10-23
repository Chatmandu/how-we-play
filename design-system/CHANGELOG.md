# Design system changelog

## 1.1.0 (23 October 2026, How We Play Football)
- **Name:** the official name is How We Play Football. "How We Play" stays as conversational shorthand in editorial copy.
- **Logo:** new outlined two-line wordmark (HOW WE PLAY / FOOTBALL in Big Shoulders Display 900 and 800, FOOTBALL in Pitch Blue). It replaces the wordmark in `hwp-masthead*`, `hwp-lockup-inline*` and `hwp-wordmark`; file names are unchanged, so no API changes. New: `hwp-lockup-stacked*` and `hwp-lockup-compact*` (single line, for heights under 36px). The three-node mark and favicons are unchanged.
- **Minimum sizes:** the masthead is 240px wide, the inline lockup is 36px high and the compact lockup is 18px high.
- **Diagram credit:** the dark "HOW WE PLAY .COM" panel is replaced by a small bottom-right credit (small-cut mark and howweplayfootball.com at 60% label colour, no background). Compact previews get the mark only. The credit steps down to the mark, or moves bottom-left, if it would touch a player, ball, arrow end or label. It is still baked into the SVG, and `data-hwp-watermark="howweplayfootball.com"` is kept. `opts.brand: false` turns it off and `opts.brand: 'mark'` forces the mark.

## 1.0.2 (19 October 2026)
- `statusChips` shows the review date as "19 October 2026" instead of ISO.

## 1.0.1 (19 October 2026, website foundation build)
Fixes found while building the website. No token values, renderer output or diagram data changed.
- **Content moved out:** `content/` and `governance/content-register.json` now live at the website root (`/content/`). `tests/run.mjs` and `showcase/demos.mjs` read from there, so there is only one copy of the coaching content.
- **Cue component:** the blockquote used the `hwp-cue` class, so the optional "extra" line inherited cue typography (display capitals). It now uses `hwp-cue-block`.
- **Figures at 320px:** grid children of `.hwp-figure`, `.hwp-compare-panels` and `.hwp-compare-panel` may now shrink (`min-width: 0`), and `.hwp-figure__tools` wraps, so long tab labels, strips and sequence controls no longer push a figure wider than a small phone.
- **Go-link target size:** `.hwp-golink` gets 8px top padding so it is at least 24px tall (WCAG 2.2 target size).
- **Stylesheet order (integration note, not a code change):** load `diagram.css` before `components.css`, otherwise `.hwp-pitch { width: 100% }` overrides the key swatch size and the diagram key renders huge.

## 1.0 (19 October 2026)
Stage 1 foundations and Stage 2 components and diagrams, as handed over.
