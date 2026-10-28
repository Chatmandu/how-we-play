/* Benefit-led cover lines for reviewed formation issues. These are editorial
 * signposts, not changes to the reviewed tactics, diagrams or playing principles.
 * New issues retain a clear, honest fallback until their cover copy is written. */
const coverLines = {
  '5v5/1-2-1': 'One diamond. Passing options all around the ball.',
  '5v5/2-2': 'Two partnerships. One team that stays connected.',
  '7v7/2-1-2-1': 'Find the link between the back pair and the attack.',
  '7v7/2-3-1': 'Two defenders. Three midfielders. One connected team.',
  '7v7/3-2-1': 'Three at the back. Everyone helps the striker.',
  '9v9/3-1-3-1': 'A clear team shape. Four principles players can remember.',
  '9v9/3-2-3': 'Three forwards. Two midfield partners. One connected team.',
  '9v9/3-3-2': 'Three protect. Three connect. Two work together.',
  '9v9/2-2-3-1': 'Wide wing-backs. Central options. Decisions about cover.'
};
export const formationCoverLine = f =>
  coverLines[`${f.format}/${f.slug}`] || f.issue?.intro || f.idea || 'A starting shape to explore with your team.';
