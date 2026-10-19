# How We Play — Brand Guidelines v1.0 (Stage 1: Foundations)

**How We Play** · howweplayfootball.com · YouTube & Instagram @howweplayfootball
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

## 2. Logo

| Asset | File | Use | Minimum |
|---|---|---|---|
| Masthead (primary) | `assets/logo/hwp-masthead.svg` · `-reverse` · `-mono` | Site masthead, PDF covers, title cards | 240px wide |
| Inline lockup | `hwp-lockup-inline.svg` · `-reverse` · `-mono` | Navigation, footers, video strips | Mark 18px high |
| Wordmark | `hwp-wordmark.svg` (currentColor) | When the mark appears separately nearby | 16px cap height |
| Symbol (mark) | `hwp-mark.svg` · `-reverse` · `-mono` | Avatars, slides, stickers | 32px |
| Symbol, small cut | `hwp-mark-small.svg` (currentColor) | Favicon and anything under 32px | 13px |
| Favicon | `assets/favicon/*` | Browser, home screen | — |
| Social profile | `assets/social/hwp-avatar-800.{svg,png}` | YouTube and Instagram (circle-safe) | — |

**The mark:** the passing triangle, three players and three passing lines. The top disc is the player on the ball, Space Yellow when shown in colour at 48px and up.
**Clear space:** one disc diameter (about a third of the mark's width) on every side.
**Monochrome:** `-mono` files use `currentColor`. Set `color` to Ink on light backgrounds or White on dark ones.
**Don't:** add a crest, shield or ball; recolour individual discs; stretch it; put it on a busy photo; or use the regular mark under 32px.

## 3. Colour
The palette has two families that keep separate roles. Components use **semantic tokens** (`--hwp-text-primary`, `--hwp-surface-pitch`…), never raw hex.

**Reading:** Paper `#F2EDE2` · White `#FFFFFF` · Ink `#0E1A24` · Muted `#5C5E62` · Rule `#D9D2C2`
**Tactical:** Pitch Blue `#2747E8` · Pitch Line `#9DAEF5` / `#AEBBEF` · Coral `#FF6B4A` · Coral Deep `#D9472B` · Space Yellow `#F2D13C` · Space Edge `#9A7B00` · Gap Grey `#5E6670`

**Restrictions** (see `docs/contrast-report.md`):
- Space Yellow and Coral never carry text. They're backgrounds for Ink text or graphic fills only.
- Coral Deep reaches 3.7:1 on Paper, so it's for graphics, borders and text at 24px or larger only.
- Rule is for hairlines only.
- On the blue pitch, the opposition marker needs its white outer keyline. Coral on blue is only 2.4:1.
- Pitch Blue never fills a whole web page, a button or the navigation bar.

## 4. Typography
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

## 5. Spacing and layout
The 8px rhythm (with a 4px half-step) uses tokens `space.1–9`: 4, 8, 12, 16, 24, 32, 48, 64, 96. The container is 1200px max, with gutters of 20, 32 and 48px. Two-column splits use `minmax(min(100%, 380px), 1fr)`. Breakpoints are 600, 900 and 1200. Body text measure is 62ch.

## 6. Borders and dividers
| Rule | Width | Use |
|---|---|---|
| Masthead | 6px Ink | Once per page or cover |
| Section | 1.5px Ink | Starts every section |
| Cue | 4px Ink | Only above a coaching cue |
| Hairline | 1px Rule | Rows in lists and tables |
| Panel | 1.5px Ink (solid) / dashed | Permitted containers (§7) |
| Exploratory | 4px dashed Space Yellow | Exploratory diagrams and pages |

Corner radius is 0, with 2px on form inputs only. No shadows.

## 7. Permitted containers (panels)
The default is open layout: rules, space and lists. Use a **panel** only when it:
- groups a control with its result (a figure panel: tabs, diagram and caption);
- is a single thing to take away (a download, with its facts and one action);
- marks a boundary people must notice (a review note, exploratory strip or private-preview strip);
- gives large tap targets for a short choice (up to three formations on mobile).

Panels have a 1.5px Ink border **or** a solid fill (White, Ink, Pitch Blue), never a shadow, and are never nested. Use at most one row of up to three, and give every panel a heading. **Not permitted:** grids of rounded, shadowed cards as the main navigation.

## 8. Iconography
These are custom line icons on a 24px grid, with a 2px stroke, square caps and mitred joins, coloured with `currentColor` (`assets/icons/*.svg`, plus `sprite.svg`). The set is: arrow-right, arrow-left, chevron-down, menu, close, download, external, enlarge, key, right, wrong, info, warning, play, print, lock, step-next and step-prev. Icons always sit next to a visible text label, except for close, menu and the step arrows, which carry an `aria-label`. No filled icons, emoji or football clip-art.

## 9. Motion and interaction
- **Durations:** fast 120ms (hover, tabs), base 200ms (panels, menus), step 300ms (diagram stage hold). Easing is `cubic-bezier(0.2, 0, 0, 1)`. No bounce or spring.
- **Diagrams:** a tab change cross-fades the diagram. In video, players travel along their own arrows and never teleport.
- **Hover:** Ink becomes Pitch Blue on actions, and links change from blue to Ink.
- **Focus:** a 3px Pitch Blue outline with a 2px offset. On blue surfaces it's Space Yellow.
- **Targets:** at least 44 × 44, and 48 for primary actions.
- **Reduced motion:** all transitions become instant. Stage sequences step on tap only.

## 10. Status language (public)
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

## 11. Voice
Plain English in short sentences. Cues are spoken and taken verbatim from the source: "If the other defender goes, you stay." Use British spelling. Spell out one to nine and use numerals for 10 and up, except shirt numbers and formations. Write dates as 19 October 2026.
