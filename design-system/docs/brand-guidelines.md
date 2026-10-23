# How We Play Football — Brand Guidelines v1.1

**How We Play Football** · howweplayfootball.com · YouTube, Instagram & TikTok @howweplayfootball
**Tagline:** Helping your team take the next step.
**Positioning:** Free, visual football coaching guides that help grassroots coaches understand formations, teach simple playing principles and support players as they move between formats.
**Direction:** Programme-led editorial design, supported by the Pitch Blue tactical illustration system. *Calm pages, bold pitches.*

Source of truth for values: `tokens/tokens.json`. This document explains how to use them.

---

## 1. Principles
1. **Reading happens on Paper, tactics on Pitch Blue.** Blue is a place (a pitch, a social slide, a video frame), never interface chrome.
2. **Simple pictures. Simple decisions. Play together.** One diagram per screen, one cue per idea.
3. **Words from the source.** Never invent coaching content. Every movement traces to a playbook or a draft brief.
4. **Honest status.** Design approval, coaching review and official-rule verification are separate, and the status is always visible.
5. **Never colour alone.** Shape, line style or a label always carries the meaning as well.

## 2. Name
| Use | Write |
|---|---|
| Official name: logo, masthead, footer, page-title suffix, metadata, structured data, social display names, video title cards, downloads, newsletter publisher, copyright and image credits | **How We Play Football** |
| Conversational shorthand inside editorial copy, once the full name has appeared on the page | How We Play |
| Web address, always in full, lower case | howweplayfootball.com |
| Social handles (unchanged) | @howweplayfootball |

Only change references to the **organisation**. Phrases about how a team plays ("how we play out from the back") are ordinary English, not the brand. Don't write HWP in public copy, and never use "howweplay.com" or "HOW WE PLAY .COM".

## 3. Logo

The wordmark is two lines: **HOW WE PLAY** in Big Shoulders Display 900, with **FOOTBALL** below in Display 800, tracked +0.42em and set in Pitch Blue (Pitch Line `#9DAEF5` on reverse, `currentColor` on mono). It's outlined to paths, so it never depends on a loaded font.

| Asset | File | Use | Minimum |
|---|---|---|---|
| Masthead (primary) | `assets/logo/hwp-masthead.svg` · `-reverse` · `-mono` | Site masthead, PDF covers, title cards | 240px wide |
| Horizontal lockup | `hwp-lockup-inline.svg` · `-reverse` · `-mono` | Navigation (44px desktop, 38px phone), footers | 36px high |
| Stacked lockup | `hwp-lockup-stacked.svg` · `-reverse` · `-mono` | End cards, posters, square spaces | 160px wide |
| Compact lockup | `hwp-lockup-compact.svg` · `-reverse` · `-mono` | Single line, only where the height is under 36px (email headers, dense toolbars) | 18px high |
| Wordmark | `hwp-wordmark.svg` (currentColor) | When the mark appears separately nearby | 120px wide |
| Symbol (mark) | `hwp-mark.svg` · `-reverse` · `-mono` | Avatars, slides, stickers. Unchanged | 32px |
| Symbol, small cut | `hwp-mark-small.svg` (currentColor) | Favicon, diagram credit, anything under 32px | 13px |
| Favicon | `assets/favicon/*` | Browser, home screen. Unchanged | — |
| Social profile | `assets/social/hwp-avatar-800.{svg,png}` | YouTube, Instagram and TikTok (circle-safe). Mark only | — |

**Below the minimums**, FOOTBALL becomes too small to read. Use the compact lockup or the mark with the web address instead. Never shrink FOOTBALL independently or drop it from a lockup.
**Small images** (thumbnails under about 400px, carousel corners, reel covers): use the mark plus howweplayfootball.com, not the full lockup. Branding must never compete with the formation.

**The mark:** the passing triangle, three players and three passing lines. The top disc is the player on the ball, Space Yellow when shown in colour at 48px and up.
**Clear space:** one disc diameter (about a third of the mark's width) on every side.
**Monochrome:** `-mono` files use `currentColor`. Set `color` to Ink on light backgrounds or White on dark ones.
**Don't:** add a crest, shield or ball; recolour individual discs; stretch it; put it on a busy photo; retype the wordmark in live text; or use the regular mark under 32px.

### Diagram credit
Every tactical SVG carries a small credit, baked into the artwork by `diagrams/renderer.mjs` (`brandMark`). It sits bottom-right: the small-cut mark, then **howweplayfootball.com** in Schibsted Grotesk 600 at 2.5 pitch units (about 9px on a 400px diagram), in the theme's label colour at 60% opacity, with no panel behind it.
- Compact previews (numbers or labels off) get the mark only, so there's no unreadable URL.
- If the credit would touch a player, ball, arrow end or label, it steps down to the mark. If the mark would touch something too, it moves to bottom-left.
- It survives screenshots, SVG downloads, generated share images and animation frames. It's a courtesy credit, **not copy protection**: anyone editing the file can remove it.
- `opts.brand: false` turns it off, for example inside a frame that already carries the address. `opts.brand: 'mark'` forces the mark only.

## 4. Colour
The palette has two families that keep separate roles. Components use **semantic tokens** (`--hwp-text-primary`, `--hwp-surface-pitch`…), never raw hex.

**Reading:** Paper `#F2EDE2` · White `#FFFFFF` · Ink `#0E1A24` · Muted `#5C5E62` · Rule `#D9D2C2`
**Tactical:** Pitch Blue `#2747E8` · Pitch Line `#9DAEF5` / `#AEBBEF` · Coral `#FF6B4A` · Coral Deep `#D9472B` · Space Yellow `#F2D13C` · Space Edge `#9A7B00` · Gap Grey `#5E6670`

**Restrictions** (see `docs/contrast-report.md`):
- Space Yellow and Coral never carry text. They're backgrounds for Ink text or graphic fills only.
- Coral Deep reaches 3.7:1 on Paper, so it's for graphics, borders and text at 24px or larger only.
- Rule is for hairlines only.
- On the blue pitch, the opposition marker needs its white outer keyline. Coral on blue is only 2.4:1.
- Pitch Blue never fills a whole web page, a button or the navigation bar.

## 5. Typography
Two families, both OFL: **Big Shoulders Display** (700–900) for headings, cues, numbers, labels and text on the pitch, and **Schibsted Grotesk** (400–800 plus italic) for body text, interface, standfirsts, captions and shirt numbers. See `fonts/README.md`. Roles and sizes are in `tokens.json → type`. Write headings in sentence case: capitals come from styling, not from typing in caps.

| Role | Face | Desktop / mobile |
|---|---|---|
| Display XL | Display 900 caps | 88 / 48 |
| Heading L | Display 900 caps | 52 / 40 |
| Heading M | Display 800 caps | 28 / 24 |
| Cue | Display 900 caps | 34 / 28 |
| Big number | Display 900, Pitch Blue | 96 / 72 |
| Label | Display 800 caps, +0.14em | 13 |
| Standfirst | Sans italic | 21 / 19 |
| Body | Sans 400 | 18 / 17, max 62ch |
| Small | Sans 400 | 15 |
| Caption | Sans italic | 16 / 15 |
| Interface | Sans 600 | 16 |

## 6. Spacing and layout
The 8px rhythm (with a 4px half-step) uses tokens `space.1–9`: 4, 8, 12, 16, 24, 32, 48, 64, 96. The container is 1200px max, with gutters of 20, 32 and 48px. Two-column splits use `minmax(min(100%, 380px), 1fr)`. Breakpoints are 600, 900 and 1200. Body text measure is 62ch.

## 7. Borders and dividers
| Rule | Width | Use |
|---|---|---|
| Masthead | 6px Ink | Once per page or cover |
| Section | 1.5px Ink | Starts every section |
| Cue | 4px Ink | Only above a coaching cue |
| Hairline | 1px Rule | Rows in lists and tables |
| Panel | 1.5px Ink (solid) / dashed | Permitted containers (§8) |
| Exploratory | 4px dashed Space Yellow | Exploratory diagrams and pages |

Corner radius is 0, with 2px on form inputs only. No shadows.

## 8. Permitted containers (panels)
The default is open layout: rules, space and lists. Use a **panel** only when it:
- groups a control with its result (a figure panel: tabs, diagram and caption);
- is a single thing to take away (a download, with its facts and one action);
- marks a boundary people must notice (a review note, exploratory strip or private-preview strip);
- gives large tap targets for a short choice (up to three formations on mobile).

Panels have a 1.5px Ink border **or** a solid fill (White, Ink, Pitch Blue), never a shadow, and are never nested. Use at most one row of up to three, and give every panel a heading. **Not permitted:** grids of rounded, shadowed cards as the main navigation.

## 9. Iconography
These are custom line icons on a 24px grid, with a 2px stroke, square caps and mitred joins, coloured with `currentColor` (`assets/icons/*.svg`, plus `sprite.svg`). The set is: arrow-right, arrow-left, chevron-down, menu, close, download, external, enlarge, key, right, wrong, info, warning, play, print, lock, step-next and step-prev. Icons always sit next to a visible text label, except for close, menu and the step arrows, which carry an `aria-label`. No filled icons, emoji or football clip-art.

## 10. Motion and interaction
- **Durations:** fast 120ms (hover, tabs), base 200ms (panels, menus), step 300ms (diagram stage hold). Easing is `cubic-bezier(0.2, 0, 0, 1)`. No bounce or spring.
- **Diagrams:** a tab change cross-fades the diagram. In video, players travel along their own arrows and never teleport.
- **Hover:** Ink becomes Pitch Blue on actions, and links change from blue to Ink.
- **Focus:** a 3px Pitch Blue outline with a 2px offset. On blue surfaces it's Space Yellow.
- **Targets:** at least 44 × 44, and 48 for primary actions.
- **Reduced motion:** all transitions become instant. Stage sequences step on tap only.

## 11. Status language (public)
| Component | Meaning | Look |
|---|---|---|
| Draft | Work in progress (private builds only) | Muted solid outline |
| Coaching review required | Written, awaiting a qualified reviewer (private builds only) | Ink dashed outline |
| Coaching reviewed | Reviewed: name and date recorded | Pitch Blue solid outline with ✓ |
| Official rule verified | A fact checked against its source for the season | Ink fill, Paper text, date and source link |
| Coming soon | A planned format or resource | Muted text, no link |
| Exploratory | Experimental coaching idea | Space Yellow strip, 4px dashed frame |
| Private preview | Not for publication (preview and local builds) | Ink strip, yellow text, lock icon |

Publishing rules are in `governance/publishing-policy.md`.

## 12. Voice
Plain English in short sentences. Cues are spoken and taken verbatim from the source: "If the other defender goes, you stay." Use British spelling. Spell out one to nine and use numerals for 10 and up, except shirt numbers and formations. Write dates as 19 October 2026.
