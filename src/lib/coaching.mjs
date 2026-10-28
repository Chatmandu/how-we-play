/* Coaching guides: a small, deliberate editorial collection.
 * Keep the index, article dates, social previews and tactical frames in one place.
 * Diagrams are examples for coaches to adapt, not prescriptive laws or fixed positions. */
export const coachingTopics = [
  { id: 'set-pieces', title: 'Set pieces & restarts', description: 'Corners, free kicks, goal kicks and getting the ball back in play.' },
  { id: 'in-possession', title: 'Playing with the ball', description: 'Finding space, building attacks and making simple decisions.' },
  { id: 'out-of-possession', title: 'Winning the ball back', description: 'Pressing, defending and what to do when possession changes.' },
  { id: 'matchday', title: 'Matchday coaching', description: 'Helping every player learn, enjoy and contribute.' }
];

export const coachingArticles = [
  {
    slug: 'attacking-corners',
    href: '/coaching/attacking-corners/',
    title: 'How to set up for attacking corners',
    shortTitle: 'Attacking corners: a simple setup',
    description: 'A simple, illustrated attacking corner setup for grassroots 9v9 football, with a near-post option, a short corner, coaching cues and a 7v7 adaptation.',
    summary: 'Give every player a clear job at an attacking corner. Start with one simple 9v9 shape, then choose a low ball or a short pass. Includes a 7v7 version.',
    category: 'Set pieces & restarts',
    topic: 'set-pieces',
    published: '2026-10-28',
    minutes: 6,
    formats: ['9v9', '7v7']
  }
];

export const firstCoachingArticle = coachingArticles[0];

const ninePlayers = [
  { id: 'us-taker', t: 'us', l: '7', x: 6, y: 5 },
  { id: 'us-short', t: 'us', l: '11', x: 17, y: 19 },
  { id: 'us-front', t: 'us', l: '9', x: 34, y: 25 },
  { id: 'us-middle', t: 'us', l: '10', x: 52, y: 26 },
  { id: 'us-far', t: 'us', l: '8', x: 70, y: 25 },
  { id: 'us-edge', t: 'us', l: '6', x: 52, y: 42 },
  { id: 'us-cover-a', t: 'us', l: '4', x: 30, y: 62 },
  { id: 'us-cover-b', t: 'us', l: '3', x: 72, y: 62 },
  { id: 'opp-goalkeeper', t: 'them', x: 50, y: 5 },
  { id: 'opp-front', t: 'them', x: 33, y: 13 },
  { id: 'opp-middle', t: 'them', x: 53, y: 14 },
  { id: 'opp-far', t: 'them', x: 69, y: 13 }
];
const nineBase = {
  pitch: '9v9',
  view: 'attacking-half',
  ball: [0, 0],
  players: ninePlayers,
  labels: [
    { x: 17, y: 31, t: 'SHORT' },
    { x: 34, y: 35, t: 'FRONT' },
    { x: 70, y: 35, t: 'FAR' },
    { x: 52, y: 50, t: 'EDGE' },
    { x: 50, y: 71, t: 'COVER' }
  ]
};

export const cornerDiagrams = {
  setup9v9: {
    ...nineBase,
    title: 'An attacking corner starting shape for 9v9',
    altSummary: 'We attack towards the top. One player takes the corner and one offers short. Three teammates are placed near, central and far from goal; one waits near the edge of the area and two stay deeper for cover. The goalkeeper and some opposition players are outside this simplified view.'
  },
  front9v9: {
    ...nineBase,
    title: 'Option one: a low ball towards the front of goal',
    altSummary: 'The corner taker passes low into the space near the front of the goal, while the front player moves towards it. The central and far players are ready for a loose ball. Two teammates stay back.',
    arrows: [
      { k: 'pass', f: [6, 5], to: [32, 9] },
      { k: 'run', f: [34, 25], to: [34, 13] }
    ]
  },
  short9v9: {
    ...nineBase,
    title: 'Option two: pass short and find a better angle',
    altSummary: 'The taker passes to a nearby teammate, who can combine or move the ball before delivering low towards goal. Players near goal stay available and two players provide cover.',
    arrows: [
      { k: 'pass', f: [6, 5], to: [17, 19] },
      { k: 'run', f: [17, 19], to: [25, 11] }
    ]
  },
  setup7v7: {
    pitch: '7v7',
    view: 'attacking-half',
    title: 'A simplified attacking corner shape for 7v7',
    altSummary: 'Six outfield attackers are shown: one takes a corner, one offers short, two arrive near and far, one waits outside the crowded area and one stays back. The goalkeeper is outside the drawing. The illustration is schematic and shows only some opponents.',
    ball: [0, 0],
    players: [
      { id: 'us7-taker', t: 'us', l: '7', x: 6, y: 5 },
      { id: 'us7-short', t: 'us', l: '10', x: 18, y: 20 },
      { id: 'us7-front', t: 'us', l: '9', x: 37, y: 24 },
      { id: 'us7-far', t: 'us', l: '8', x: 69, y: 24 },
      { id: 'us7-edge', t: 'us', l: '6', x: 54, y: 43 },
      { id: 'us7-cover', t: 'us', l: '4', x: 50, y: 64 },
      { id: 'opp7-goalkeeper', t: 'them', x: 50, y: 6 },
      { id: 'opp7-front', t: 'them', x: 36, y: 13 },
      { id: 'opp7-far', t: 'them', x: 66, y: 13 }
    ],
    labels: [
      { x: 19, y: 31, t: 'SHORT' },
      { x: 37, y: 36, t: 'FRONT' },
      { x: 70, y: 36, t: 'FAR' },
      { x: 54, y: 52, t: 'EDGE' },
      { x: 50, y: 74, t: 'COVER' }
    ],
    arrows: [{ k: 'pass', f: [6, 5], to: [18, 20] }]
  }
};
