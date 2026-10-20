# Editorial changes: publication architecture (20 October 2026, third pass)

Branch `issues`. Visual identity unchanged. Not deployed.

**Principle:** How We Play is the magazine. Each formation is an issue within its format. Principles, positions and features are the stories inside it.

## Homepage
- "Issue one" language removed from the masthead, cover and contents. The masthead now reads "A grassroots football coaching publication".
- Cover: the brand proposition (Helping your team take the next step) with the featured issue's starting shape on the plate, labelled "Featured · 9v9 · Issue 01".
- **Choose your format**: 5v5 and 7v7 (in development, no guides yet), 9v9 (one issue published, two more in preparation).
- **Featured issue: 9v9 · Issue 01 · The 3-1-3-1**, with what's inside grouped as four chapters and a button to the full issue.
- One goes, one stays stays as the interactive example, labelled "From Issue 01 · Chapter 2 · Principle two".
- The separate "other three rules" row was removed (now in the chapter list). Moving Up, Football Explained and the colophon sit below.

## Navigation
- Primary: **5v5 · 7v7 · 9v9**. Secondary: Moving up, Football explained, About. 11v11 isn't in the navigation.
- 5v5 and 7v7 lead to honest "in development" pages: noindex, out of the sitemap, with links to Issue 01 and Moving Up. Football Explained is the same.
- Phones: the menu shows the three formats as large targets (with "in development" beneath 5v5 and 7v7), then the secondary links.

## Issue 01: the 3-1-3-1 (`/formations/9v9/3-1-3-1/`)
- Cover: "9v9 · Issue 01 · Formation guide", the issue number and "The 3-1-3-1", the intro, review status and byline. A sticky **In this issue** contents list.
- Chapter 1: Starting shape (diagram, what the shape gives us, the spine, notation).
- Chapter 2: Our four playing principles, each linking to its illustrated lesson.
- Chapter 3: A job for every player (seven positions, each with its "ask yourself" question).
- Chapter 4: Playing together, grouped by the guide's existing classification: with the ball (Far side in, the 9 and 10 partnership) and without it (Middle first, Show them wide).
- Further features: the structure exists (`issue.features` in the formation file) but shows nothing until a feature is written and reviewed. No corner routines or restarts were written.
- The playbook: printable edition, not yet released.
- Issue metadata (number, intro, chapters) lives in the formation file but is excluded from the review version, so the existing review still applies (version `cv-353fff2a` unchanged).

## Lessons and positions as stories in the issue
- Kickers now read, for example, "9v9 · Issue 01 · Chapter 2 · Principle two of four" and "9v9 · Issue 01 · Chapter 3 · Position four of seven". The 9 and 10 page reads "Chapter 4 · Playing together".
- Issue navigation: "← Issue 01: the 3-1-3-1", Principles and Positions; on phones, "Contents of this issue".
- "Rules" became "principles" in the site's own labels. The source-playbook wording inside the lessons is unchanged.

## 9v9 collection (`/formations/9v9/`)
- Published issues show their team sheet and a button into the issue. Issues in preparation are listed by number, name and status only (02 The 3-3-2, 03 The 2-2-3-1, exploratory).

## About
- "The original playbook" section and both reproduced pages removed; the image files are deleted.
- New section **Notes on my phone**: the season-by-season Notes app approach, notes changing as players develop, join, leave or move, formations and principles as starting points. **This was drafted from your brief because your revised copy wasn't attached. Please send it and I'll swap it in.**
- Standfirst now: "How We Play grew out of seven seasons of coaching notes." The reviewer section says "turn my coaching notes into a resource" instead of "the original team playbook".
- Seven years on the touchline, the highs and lows, and the 3v3 note are retained.

## SEO and URLs
- URLs unchanged; issue numbers are editorial only. New noindex placeholders at `/formations/5v5/` and `/formations/7v7/`.
- Issue 01: description rewritten around the formation's contents; Article JSON-LD now `isPartOf` the 9v9 collection.
- 9v9 collection: description now describes formation guides with principles and positions.
- Homepage title and description unchanged (already broad).
