# Four additional formations: coaching review and release record

The 5v5 1-2-1 and 2-2, 7v7 2-1-2-1, and 9v9 3-2-3 use the existing production design system, four-chapter issue layout, four principles and position pages. Each tactical example is newly drawn, not a copy of a federation diagram or evidence that the depicted situation has been tested with children.

## Approval record, 26 October 2026

Niall Walsh confirmed in the project conversation that David Wilson has approved **all four exact coaching versions in GitHub PR #20**. This is a publisher-attested approval; David's direct written approval was not supplied here and should be retained with the project records. The register holds the reviewer's name, confirmation date, exact version and this evidence basis.

| Formation | Exact approved coaching version |
|---|---|
| 5v5 1-2-1 | `cv-0564e1bb` |
| 5v5 2-2 | `cv-b002302f` |
| 7v7 2-1-2-1 | `cv-d2c2ecf7` |
| 9v9 3-2-3 | `cv-0cb51dd6` |

The review has been recorded in `content/register.json` and the matching formation status fields. Any change to a formation's tactics, diagram data or role guidance invalidates its review fingerprint and blocks publication. This approval update is a follow-up change to the **draft** PR, not an instruction to merge or publish immediately; final mobile, link and visual QA remains the release owner's decision.

## Editorial QA follow-up, 27 October 2026

The first deployed preview of PR #20 revealed incorrect **chapter-four principle grouping** in three guides. We have corrected the headings/links only, keeping every principle's teaching point, role description, cue and animated tactical frame unchanged:

| Formation | In possession: "With the ball" | Defending: "Without the ball" |
|---|---|---|
| 5v5 2-2 | Play in pairs; One comes, one goes | One presses, one covers; Close the gap |
| 7v7 2-1-2-1 | Link the lines; Make passing diamonds; Support the striker | Protect the middle |
| 9v9 3-2-3 | Use the front three; Stagger the two; One goes, one stays | Press with cover |

The approved **tactical content fingerprints remain identical**: chapter titles and chapter-four grouping are editorial navigation outside `contentVersion()`. Niall Walsh confirmed on 27 October 2026 that David Wilson was happy with the corrected groupings. This confirmation is publisher-attested; retain David's direct response with the project record. The 5v5 1-2-1 grouping was already correct. Also corrected in page templates: repeated "Formation guide", doubled sentence-final punctuation, an outdated 5v5 development label and a stale private-preview review notice. The printable and video release placeholders are intentionally unchanged.

After David's confirmation, a further visual inspection of the deployed preview identified a 5v5 collection-card overlap. The collection now uses short "5v5" folios, gives review chips their own full-width row and places the formation-library description beside its heading rather than in a narrow column. This changes layout only, not reviewed coaching content.

## Research and editorial basis

| Formation | Research base | What the draft explores | Main thing to test |
|---|---|---|---|
| 5v5 1-2-1 | [England Football Learning, How to play and manage 5v5](https://learn.englandfootball.com/articles-and-resources/coaching/resources/2025/How-to-play-and-manage-5v5-games), accessed 26 Oct 2026 | Diamond passing angles, width, recovery | Risk of isolating the single defender |
| 5v5 2-2 | Same England Football Learning guide; [The FA Coachcast on youth formations](https://community.thefa.com/coaching/podcasts/w/coachcast-transcripts/1472/episode-sixteen-nimesh-patel---going-beyond-your-comfort-zone), accessed 26 Oct 2026 | Playing in pairs, pressing and covering, staying connected | Risk of two disconnected lines |
| 7v7 2-1-2-1 | [Soccer Coach Weekly, 2-1-2-1 by Carl Wild](https://www.soccercoachweekly.net/formats/7-aside-formation-2-1-2-1); [Football St George 7v7 formations](https://footballstgeorge.com.au/wp-content/uploads/2023/11/FSG_7v7-Formation.pdf), accessed 26 Oct 2026 | Central link player, diamond angles, positional awareness | May be too complex for less experienced 7v7 players; spaces can open wide |
| 9v9 3-2-3 | [U.S. Soccer, U11–U12 9v9 formation](https://www.ussoccer.com/us-way/player-development/game/formations/u11-u12-9v9), accessed 26 Oct 2026 | Front-three width, staggered midfield pair, connected pressing | Protecting two central midfielders against larger opposing midfields |

UK 5v5 has **one goalkeeper and four outfield players**. The U.S. Soccer *4v4* diamond is a different format without a goalkeeper; do not conflate them in metadata or diagrams. England Football's 2026/27 maximum matchday formats are U8–U9 5v5, U10–U11 7v7 and U12–U13 9v9. Local leagues and countries may differ.

## Review checklist for future edits and release QA

For each formation independently:

1. Review its starting shape and every role, including rotation and goalkeeper responsibilities.
2. Check all eight principle frames (before/after) for credible movement, spacing and defending. These are *schematic* and do not claim measured pitch distances. Check that the ball is visible and that arrows imply a useful decision.
3. Assess each cue, coaching note and question for suitability at that age and level. Remove any overly prescriptive or unrealistic instructions.
4. Confirm no two frames imply that a player can teleport, that a defender should abandon the goal, or that an opponent is guaranteed to respond in a particular way.
5. If material coaching content changes, obtain a new specific review, capture its `contentVersion(f)` and reviewer name/date in `content/register.json`, and match the formation's status. Never reuse this review after a tactical content change.
6. Before the release owner's final merge, inspect the pages visually on desktop and mobile, confirm diagrams and links, and run both build targets and publishing safety tests. Branded social images are generated by the build.

## Not in this batch

- No PDFs are linked until we have reviewed text and validated exports. The playbook area displays an honest release placeholder.
- No YouTube video is claimed or linked. Existing videos remain unchanged.
- No production merge or Cloudflare release until the release owner gives final approval.
