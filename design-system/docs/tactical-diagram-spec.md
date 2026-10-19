# Tactical Diagram Specification v2.0

Deliverable E. Renderer: `diagrams/renderer.mjs` (ES module, no dependencies). Styles: `diagrams/diagram.css` plus `tokens/tokens.css`.

## 1. Architecture (it preserves P0/P1)
| Layer | File | Rule |
|---|---|---|
| Content (tactical data) | `content/{format}/{formation}.json` | Positions, arrows, areas, captions and alt text. No colours, no styling. |
| Tokens | `tokens/tokens.json` → `diagram.*` | Colours per theme, unit sizes, minimum widths. |
| Rendering | `renderPitch(d, opts)` | A pure function that returns an SVG string. No DOM access, so it runs in Node, the browser, a static build or a PDF job. |
| Presentation | `components.mjs` → `diagramFigure`, `wrongRight`, `preview` | Tabs, verdicts, captions, Key and Enlarge. |
| Output | web (`mode:'css'`), export (`mode:'inline'`) | Inline mode writes token colours as attributes, for standalone SVG, print, social and video. |

The renderer is the prototype's: the same coordinates, data keys, arrow geometry (quadratic curve, pulled back 4.7 / 5.6 units), `mirror()` and marker approach. What's added: themes from tokens, named views, pitch definitions per format, `lines`, `lost`, `notes` (capitals), validation, symbol detection and a timeline API.

## 2. Coordinates
- x runs from 0 (left touchline) to 100 (right). y runs from 0 (opponents' goal line) to `pitch.length` (our goal line). We always attack **up** the page.
- The viewBox is `-4 top 108 (bottom − top)`, so 108 units equal the rendered width.
- Pitches: `PITCHES['9v9']` (length 150, prototype geometry, verified). `5v5`, `7v7` and `11v11` are proportional placeholders with `verified:false`, to be checked before use.

## 3. Data schema (one frame)
```jsonc
{
  "key": "right-side", "tab": "Ball right", "verdict": "right" | "wrong", "stage": 1,   // presentation hints
  "caption": "2 goes. 3, 5 and 6 protect us.",                                         // required
  "altSummary": "Our 7 has the ball on the right…",                                    // required: who moves, why, what opens or closes
  "sourcePage": "p. 4", "mirrorOf": "right-side", "note": "…",
  "crop": [56, 156],                                // or use opts.view
  "players": [{ "id": "us-2", "t": "us"|"them", "l": "2", "x": 88.3, "y": 86.7 }],
  "ghosts":  [{ "id": "us-2", "l": "2", "x": 80, "y": 117.6 }],          // "started here"
  "arrows":  [{ "k": "run"|"pass", "t": "us"|"them", "f": [x,y], "to": [x,y], "c": 0, "s": 4.7, "e": 5.6, "blocked": [x,y], "noHead": false }],
  "highlights": [{ "k": "space"|"gap", "r": [x,y,w,h] } | { "k": "...", "c": [x,y,r] }],
  "labels":  [{ "t": "3 + 5 + 6", "x": 40.8, "y": 82.5 }],
  "notes":   [{ "t": "go", "x": 76, "y": 104, "a": "end" }],             // source labels only, drawn in capitals
  "lines":   [{ "y": 25.5, "t": "OFFSIDE · TO CHECK", "verified": false }],
  "lost": [x,y], "ball": [x,y], "marks": [{ "x":0, "y":0 }], "spine": [[x,y]…], "pos": [{ "t":"SCREEN", "x":50, "y":105.5 }]
}
```
**Player ids** are stable across frames (`us-{shirt}`, `them-{n}`). Animation and comparison depend on them.

## 4. Visual encoding (never colour alone)
| Element | Shape / line | Blue theme | Light theme | Mono |
|---|---|---|---|---|
| Us | Filled disc r 4.4, number | White disc, blue number | Blue disc, white number | Ink disc |
| Them | Ring r 4.4, stroke 1.4 | Coral ring, Ink fill, **white keyline** | Deep-coral ring, white fill | Ink ring |
| Started here | Dashed circle r 4.1 | White | Blue | Ink |
| Run | Solid 0.95 + head | Chalk | Blue | Ink |
| Pass | Dashed 2/1.4 + head | Chalk (them: coral) | Blue | Ink |
| Key space | Dashed area plus **required label** | Yellow 24% | Yellow 42%, gold edge | Ink 10% |
| Gap | Dashed area plus **required label** | Ink 38%, coral edge | Grey 20% | Ink 28% |
| Blocked | ✕ | Yellow | Ink | Ink |
| Contextual line | Dashed line plus label "to check" | Yellow | Ink | Ink |
| Lost ball | Ring round the ball | Coral | Deep coral | Ink |

## 5. Variants
| # | Variant | How |
|---|---|---|
| 1 | Full-pitch formation | `renderPitch(shape, { view:'full', pos:true })` |
| 2 | Attacking third | `view:'attacking-third'` (also `'attacking-half'`) |
| 3 | Defensive third | `view:'defensive-third'` (also `'defensive-half'`) |
| 4 | Wrong / right | `wrongRight(wrong, right)` |
| 5 | Step-by-step sequence | `diagramFigure({ frames, sequence:true })` with stage labels and Play |
| 6 | Compact preview | `preview(frame)`, which sets `numbers:false, labels:false` |
| 7 | Enlarged interactive | The Enlarge button opens a dialog with `interactive:true` (focusable players) |
| 8 | Print mono | `theme:'mono'`. Printing a blue figure also falls back to light via `@media print` |

## 6. Legibility rules
- Numbered diagrams must be **at least 280px** wide (numbers about 11.4px). Below 200px, use the compact preview and link to the full diagram.
- Every highlighted area needs a label. `validate()` warns otherwise.
- Player discs at least 7 units apart. A team-mate overlap is an **error**. Us-against-them contact is a **warning** to check.
- The ball must not sit under a disc (error).
- Print: player-facing PDFs use two diagrams across A4 (about 85mm each).

## 7. Validation
`validate(d)` returns `[{ level, code, msg }]`. The codes are `no-alt`, `out-of-bounds`, `overlap`, `contact`, `ball-hidden`, `duplicate-id`, `orphan-ghost`, `unlabelled-area` and `unverified-line`. Builds should fail on `error`.

**Current findings on the playbook data** (left unedited, for the content team):
- Far side in (both sides): the opponent and 11 (or 7) are 5.3 units apart, so marking contact needs a visual check.
- Eight frames have unlabelled key-space or gap areas: Far side in (both), Show them wide (Go), 9 + 10 (line, runs), GK, Screen (break) and 10 (defend).

## 8. Animation (YouTube Shorts)
- `motionPaths(frame)`: for each player with a ghost, the path from the ghost to its drawn position. It follows the matching run arrow's curve when there is one.
- `frameAt(frame, t)`: a renderable diagram at time t between 0 and 1. Use it with `renderPitch(…, { progress: t })` to draw arrows on.
- `toTimeline(frames)`: `{ cast, stages:[{ positions, ball, motion, caption, verdict }] }` as JSON, for video tools.
- **Nothing is invented.** Players without a ghost don't move. Passes are shown as options, and the ball isn't animated along them unless the content adds explicit `ballPath` data in future.

## 9. Adding a formation
1. Create `content/9v9/{id}.json` (copy the schema). Set `status.content` to `draft` and add `exploratory` if it applies.
2. Add the shape with stable ids, then the rules and frames, each with a `caption` and `altSummary`.
3. Run `node tests/run.mjs` to fix any validation errors.
4. Add it to `governance/content-register.json`. It stays private until it's reviewed (see the publishing policy).
5. Don't mirror draft formations automatically. Author both sides until a reviewer approves mirroring.

## 10. Adding a format (5v5, 7v7, 11v11)
Verify the pitch markings, update `PITCHES[format]` and set `verified:true`. Swap maps for `mirror()` can differ per format: pass the second argument.
