# Four additional formations: coaching review

Working drafts for the 5v5 1-2-1 and 2-2, 7v7 2-1-2-1, and 9v9 3-2-3. These use the existing production design system, four-chapter issue layout, four principles and position pages. Each tactical example is a newly drawn *proposal*, not a copy of a federation diagram or a description of a situation that has been tested with children.

No formation in this batch has been reviewed or approved by David Wilson. These are private preview drafts and must not enter the public build until a version-specific review is recorded.

## Research and editorial basis

| Formation | Research base | What the draft explores | Main thing to test |
|---|---|---|---|
| 5v5 1-2-1 | [England Football Learning, How to play and manage 5v5](https://learn.englandfootball.com/articles-and-resources/coaching/resources/2025/How-to-play-and-manage-5v5-games), accessed 26 Oct 2026 | Diamond passing angles, width, recovery | Risk of isolating the single defender |
| 5v5 2-2 | Same England Football Learning guide; [The FA Coachcast on youth formations](https://community.thefa.com/coaching/podcasts/w/coachcast-transcripts/1472/episode-sixteen-nimesh-patel---going-beyond-your-comfort-zone), accessed 26 Oct 2026 | Playing in pairs, pressing and covering, staying connected | Risk of two disconnected lines |
| 7v7 2-1-2-1 | [Soccer Coach Weekly, 2-1-2-1 by Carl Wild](https://www.soccercoachweekly.net/formats/7-aside-formation-2-1-2-1); [Football St George 7v7 formations](https://footballstgeorge.com.au/wp-content/uploads/2023/11/FSG_7v7-Formation.pdf), accessed 26 Oct 2026 | Central link player, diamond angles, positional awareness | May be too complex for less experienced 7v7 players; spaces can open wide |
| 9v9 3-2-3 | [U.S. Soccer, U11–U12 9v9 formation](https://www.ussoccer.com/us-way/player-development/game/formations/u11-u12-9v9), accessed 26 Oct 2026 | Front-three width, staggered midfield pair, connected pressing | Protecting two central midfielders against larger opposing midfields |

UK 5v5 has **one goalkeeper and four outfield players**. The U.S. Soccer *4v4* diamond is a different format without a goalkeeper; do not conflate them in metadata or diagrams. England Football's 2026/27 maximum matchday formats are U8–U9 5v5, U10–U11 7v7 and U12–U13 9v9. Local leagues and countries may differ.

## Review checklist for David Wilson

For each formation independently:

1. Review its starting shape and every role, including rotation and goalkeeper responsibilities.
2. Check all eight principle frames (before/after) for credible movement, spacing and defending. These are *schematic* and do not claim measured pitch distances. Check that the ball is visible and that arrows imply a useful decision.
3. Assess each cue, coaching note and question for suitability at that age and level. Remove any overly prescriptive or unrealistic instructions.
4. Confirm no two frames imply that a player can teleport, that a defender should abandon the goal, or that an opponent is guaranteed to respond in a particular way.
5. Agree the final words and diagrams. Capture the exact `contentVersion(f)` and reviewer name/date in `content/register.json`, and match the formation's status. Do not infer approval from the earlier 7v7/9v9 guides.
6. Only then set `status.content` and register content status to `reviewed`, record review evidence, add `issue.published`, regenerate printables and social/video assets, then run both build targets and the publishing safety tests.

## Not in this batch

- No PDFs are linked until we have reviewed text and validated exports. The playbook area displays an honest release placeholder.
- No YouTube video is claimed or linked. Existing videos remain unchanged.
- No production merge or Cloudflare release before the review gate passes.
