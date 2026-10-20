/* Animate the difference between two already-authored tactical pictures.
 *
 * This is presentation-only: it never changes a formation content file, player end
 * position, ball position, caption or coaching instruction. An existing authored
 * ghost/run sequence always wins. The previous frame is used only to show where
 * the SAME named player was in the preceding picture.
 *
 * Do not use this for alternative scenarios that are not a continuous movement:
 * callers can exclude those steps with skipKeys.
 */
export function inferStepMotion(frames, index, { skipKeys = [], minTravel = 7, maxTravel = 40 } = {}) {
  const frame = frames[index];
  const before = frames[index - 1];
  if (!frame || !before || skipKeys.includes(frame.key)) return frame;
  if ((frame.ghosts || []).length || (frame.arrows || []).some(a => a.k === 'run')) return frame;
  if (!Array.isArray(frame.players) || !Array.isArray(before.players)) return frame;

  const previousById = new Map(before.players.filter(p => p.id).map(p => [p.id, p]));
  const movements = [];
  for (const player of frame.players) {
    if (player.t !== 'us' || !player.id || !player.l) continue;
    const earlier = previousById.get(player.id);
    if (!earlier || earlier.t !== 'us' || earlier.l !== player.l) continue;
    const from = [earlier.x, earlier.y];
    const to = [player.x, player.y];
    const distance = Math.hypot(to[0] - from[0], to[1] - from[1]);
    // Smaller changes make the picture jitter; unusually large changes are
    // likely a new tactical situation, not an illustrated run.
    if (distance >= minTravel && distance <= maxTravel) movements.push({ player, from, to });
  }
  if (!movements.length) return frame;

  // Ghost positions and arrows are computed from already published snapshots.
  // These exist only in the browser: the source data and review fingerprint are unchanged.
  return {
    ...frame,
    ghosts: movements.map(({ player, from }) => ({ id: player.id, l: player.l, x: from[0], y: from[1] })),
    arrows: [
      ...(frame.arrows || []),
      ...movements.map(({ from, to }) => ({ k: 'run', t: 'us', f: from, to }))
    ]
  };
}
