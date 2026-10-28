/* Search-led titles and descriptions for reviewed formation guides.
 * This is presentation copy only: coaching advice remains in reviewed content files.
 * Specific principle queries are chosen where the rule itself supports the phrasing. */
const lessonTopics = {
  '5v5/1-2-1/give-an-angle': 'Passing Angles in 5v5 Football',
  '5v5/1-2-1/show-them-wide': 'How to Use Width in 5v5 Football',
  '5v5/1-2-1/one-goes-one-covers': 'Pressing and Covering in 5v5',
  '5v5/1-2-1/recover-together': 'Defending After Losing the Ball in 5v5',
  '7v7/2-3-1/keeper-options': 'Playing Out from the Goalkeeper in 7v7',
  '7v7/2-3-1/big-small': 'Attacking Width and Defensive Shape in 7v7',
  '7v7/2-3-1/press-cover': 'Pressing and Covering as a Pair in 7v7',
  '7v7/2-3-1/lose-it': 'Defending After Losing the Ball in 7v7',
  '9v9/3-2-3/use-front-three': 'Using a Front Three in 9v9',
  '9v9/3-2-3/stagger-the-two': 'Midfield Support and Passing Angles in 9v9',
  '9v9/3-2-3/one-goes-one-stays': 'When an Outside Defender Goes Forward in 9v9',
  '9v9/3-2-3/press-with-cover': 'How to Press with Cover in 9v9'
};

export const formationSearchTitle = f =>
  `${f.name} Formation for ${f.format}: Positions & Coaching Guide | How We Play Football`;

export const formationSearchDescription = f =>
  `${f.name} formation guide for ${f.format} football and youth soccer. Explore the starting shape, player positions, four playing principles and illustrated coaching advice.`;

export const lessonSearchTitle = (f, r) => {
  const topic = lessonTopics[`${f.format}/${f.slug}/${r.id}`];
  return topic
    ? `${topic} | ${f.name} Formation | How We Play Football`
    : `${r.title}: ${f.name} ${f.format} Formation Coaching | How We Play Football`;
};

export const lessonSearchDescription = (f, r) =>
  `${r.summary} Explore this ${f.format} ${f.name} football coaching principle with an illustrated example and a practical question for players.`;

export const positionSearchTitle = (f, r) =>
  `${r.title} in the ${f.name} ${f.format} Formation | How We Play Football`;

export const positionSearchDescription = (f, r) =>
  `What does the ${r.title.toLowerCase()} do in the ${f.name} ${f.format} formation? See player responsibilities, a diagram and clear coaching prompts for youth football and soccer.`;
