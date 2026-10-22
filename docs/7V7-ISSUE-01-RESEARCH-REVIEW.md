# How We Play · 7v7 Issue 01 research and review dossier
**Research draft: 22 October 2026. PRIVATE. NOT COACHING-REVIEWED.**

## Editorial decision

Start the 7v7 collection with **2-3-1** (or **1-2-3-1** including the goalkeeper). This is a starter formation for U10/U11 in England's 2026/27 Future Fit pathway, not a uniquely best shape.

**Alternative worth considering next:** 3-2-1 (1-3-2-1 with goalkeeper), one of the other official example shapes. It gives a back three rather than two defenders but may place more responsibility on a narrow pair ahead; the choice is a coaching judgement, not an England Football mandate.

**Why 2-3-1 first, as our editorial inference:**
- Children can recognise four units: goalkeeper, defensive pair, midfield three and a striker.
- Width in possession can be illustrated using the two wide midfielders.
- The two defenders' decisions can teach pressing/cover without assuming a rigid, win-at-all-costs playing model.
- The central midfielder can be taught as a link and support, not a perpetual ball-chaser.
- Four principles are simple enough to connect to the previous 5v5 experience and to future 9v9 issues.

**Trade-offs requiring coaching sign-off:** one midfielder may become overloaded centrally, the back two may be exposed on wide transitions and the wide midfielders' defensive workload can be confusing. Avoid claiming 2-3-1 suits every group. England Football explicitly promotes problem solving, trying different positions and best-practice game time for everyone.

## Source ledger

### A. Current official rules and developmental priorities (facts, not original tactical endorsement)

- [England Football Learning: How to play and manage 7v7 games](https://learn.englandfootball.com/articles-and-resources/coaching/resources/2025/How-to-play-and-manage-7v7-games), dated 8 Dec 2025, checked 22 Oct 2026.
  - 2026/27 ages: **U10 and U11**, seven players including GK.
  - Illustrations of **1-2-3-1** and **1-3-2-1** as examples only.
  - Recommended pitch 55×37m, minimum 46×27m, 12×6ft goals, size-three ball.
  - No offside and no heading; retreat line and powerplay; match up to 50 minutes; rolling substitutes.
  - Encourages position rotation, independent decisions, fun and at least half a game per player as best practice.
- [England Football Future Fit: pitch and goal sizes](https://futurefit.englandfootball.com/futurefit/faqs/what-are-pitch-and-goal-sizes-for-the-different-age-groups/), checked 22 Oct 2026. Confirms U10/U11 7v7 dimensions and ages.
- [England Football Future Fit 2026/27 programme](https://futurefit.englandfootball.com/futurefit/), checked 22 Oct 2026.
- [Liverpool County FA Future Fit Transition Policy, March 2026](https://www.thefa.com/-/media/cfa/liverpoolfa/files/about/strategy-and-policies/lcfa-futurefit-policy.ashx?la=en), first page establishes the age/format pathway in 2026/27.

### B. Practitioner evidence (ideas and problems, not official law)

- [England Football Community: keeping wide players wide in a 7v7 2-3-1](https://community.thefa.com/coaching/f/youth-club-football-forum/5843/keeping-wide-players-wide-in-a-7-a-side-2-3-1-shape). A coach identifies the difficulty of explaining "wide in possession, closer without possession" to children; another offers channel-based practice ideas.
- [England Football Community: 7v7 formations and experiences](https://community.thefa.com/coaching/f/youth-club-football-forum/138/7v7-formations-experiments-experiences). Practitioner advice describes 2-3-1 as a starting point that can be varied; advises role rotation and developmental priorities.
- [Football DNA: 7-a-side formation analysis](https://footballdna.co.uk/features/formation-analysis7-a-side/). A secondary coaching comparison of 7v7 shapes and links with 5v5; not evidence of official endorsement.

### C. How We Play's new coaching hypotheses (NOT externally verified)

The following exact four ideas and all 18 drawn scenario frames are **original proposed editorial synthesis** to be reviewed by a qualified coach. They are not represented as claims from England Football:

1. **Give two options:** when possible, our goalkeeper sees two separate defenders offering options, with number 8 connecting ahead.
2. **Big with it, small without it:** 11 and 7 give width in possession, get closer to 8 when defending.
3. **One presses, one covers:** when an outside opponent threatens our goal, the defender closest to the danger may meet the ball while the other covers.
4. **Lose it, find home:** the nearest player slows down the break if possible while teammates recover to help.

**Do not force playing short under pressure**. Do not treat the diagrams as a continuous match sequence or mandatory movements. Never keep children permanently locked into shirt numbers or specific roles.

## Proposed publication format

**Issue 01 — 7v7 2-3-1**
- Chapter 1: Starting shape and a job for all seven players.
- Chapter 2: Four illustrated playing principles, each with two authored steps and clear cues.
- Chapter 3: Five player-role groups: goalkeeper; defender pair; central midfielder; wide midfielders; striker. Each has an interactive illustration, a question and practical points.
- Chapter 4: How to build and defend together.
- Private preview now; no `published` metadata or coaching review declaration.

The pitch uses the existing `PITCHES['7v7']` diagram geometry, which is still labelled **provisional** by the site's renderer. It is a schematic coaching graphic. Before going public, verify pitch markings from a CURRENT approved mini-soccer dimensions/rules source and adjust the renderer as required; don't silently treat older technical diagrams as authoritative.

## Review checklist for David Wilson

Record real coaching feedback before publication:
1. Is 2-3-1 the right first teaching issue, and are the advantages/trade-offs fairly presented?
2. Do our four principle names and the short touchline cues make sense to U10/U11 players?
3. Are both goalkeeper passing pictures sensible with the retreat-line rule and under pressure?
4. Do "big" and "small" invite intelligent movement rather than rigid zones? Is the wide midfield recovery realistic?
5. Are press/cover scenarios tactically credible against different opponents, including when the back two are outnumbered?
6. Are losing possession, striker roles and pressing decisions safe and age-appropriate?
7. Check every SVG, number, ball placement, labelled gap, motion arrow and left/right direction for correctness; a motion arrow is an example, not required play.
8. Confirm no diagram depends on offside or heading; check current sideline restart rules if we introduce that content later.
9. Do the notes encourage playing time, role rotation, fun and problem-solving rather than rigid positional labels?
10. Check the 7v7 pitch drawing and make any required corrections.

**Evidence to retain:** written reviewer feedback, any factual corrections, final coaching file version (`contentVersion`), reviewer name and review date. Don't backdate approval or set the version without an actual sign-off.

## Publish after sign-off

1. Apply requested coaching and diagram changes on the feature branch.
2. Record a real, explicit review in both the `content/register.json` entry and formation `status`, including current version fingerprint; include an `issue.published` date only when actually published.
3. Validate official 7v7 pitch markings and any additional displayed rules.
4. Change `content/site.json` format `7v7` to `availability: "live"` and update its note.
5. The 7v7 collection automatically becomes indexable once an issue with review and publication date is available. Verify the homepage, sitemap, RSS, Article and CollectionPage structured data and that no draft pages leak from the public build.
6. Only then merge to `main`. Preview pages and branches should be access controlled, `noindex`, and never linked publicly before sign-off.

**Separately:** the existing 9v9 content, reviewer record and diagrams should not change to accommodate 7v7. Format-aware template, navigation and SEO generalisation is tested on this branch.
