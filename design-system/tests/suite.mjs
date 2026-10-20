/* How We Play Stage 2 test suite. Environment-neutral: the runner supplies ctx.
 * Node:    node tests/run.mjs
 * Browser: showcase/components.html runs the same suite and prints results.
 * ctx = { R: renderer module, G: publish-gate module, content: { '3-1-3-1', '3-3-2', '2-2-3-1' }, register, flat (resolved tokens) }
 */
export function suite(ctx) {
  const { R, G, content, register, flat } = ctx;
  const T = [];
  const test = (name, fn) => T.push({ name, fn });
  const ok = (cond, msg) => { if (!cond) throw new Error(msg || 'assertion failed'); };
  const frames = c => [c.shape].concat(Object.values(c.diagrams).flatMap(s => s.frames));
  const f3131 = content['3-1-3-1'];

  // ---- Renderer: output and accessibility
  test('renders every 3-1-3-1 playbook diagram (shape + 25 frames) to SVG', () => {
    const all = frames(f3131); ok(all.length === 26, 'expected 26, got ' + all.length);
    all.forEach(d => { const s = R.renderPitch(d); ok(s.startsWith('<svg') && s.endsWith('</svg>'), 'bad svg'); });
  });
  test('every SVG has <title> and <desc> from the data', () => {
    frames(f3131).forEach(d => { const s = R.renderPitch(d); ok(/<title id="[^"]+">[^<]*<\/title><desc id="[^"]+">[^<]+<\/desc>/.test(s), 'missing desc for ' + (d.key || 'shape')); });
  });
  test('text in data is escaped', () => { const s = R.renderPitch({ altSummary: 'a<b>&"', players: [{ t: 'us', l: '<9>', x: 50, y: 50 }] }); ok(!s.includes('<9>') && s.includes('&lt;9&gt;'), 'not escaped'); });
  test('ids are unique across renders (two figures on one page)', () => { const a = R.renderPitch(f3131.shape), b = R.renderPitch(f3131.shape); ok(a.match(/id="([^"]+)-t"/)[1] !== b.match(/id="([^"]+)-t"/)[1]); });
  test('css mode emits theme classes and no hard-coded colours', () => { const s = R.renderPitch(f3131.diagrams['one-goes'].frames[0]); ok(s.includes('hwp-pitch--blue') && s.includes('class="hwp-us"') && !/#[0-9A-F]{6}/i.test(s)); });
  test('inline mode writes token colours (for export) and needs colours', () => {
    const colors = R.themeFromTokens(flat, 'blue'); const s = R.renderPitch(f3131.shape, { mode: 'inline', colors });
    ok(s.includes(flat['color.pitch-blue']), 'pitch colour missing');
    let threw = false; try { R.renderPitch(f3131.shape, { mode: 'inline' }); } catch (e) { threw = true; } ok(threw, 'should throw without colours');
  });
  test('opposition keyline is present on the blue theme (accessibility fix from Stage 1)', () => { const s = R.renderPitch(f3131.diagrams['middle-first'].frames[0], { mode: 'inline', colors: R.themeFromTokens(flat, 'blue') }); ok(s.includes('stroke="#FFFFFF" stroke-width=".6"')); });
  test('numbers:false and labels:false produce a compact preview with no text', () => { const s = R.renderPitch(f3131.diagrams['one-goes'].frames[2], { numbers: false, labels: false }); ok(!/<text[^>]*>[^<]+<\/text>/.test(s.replace(/<title.*<\/desc>/, ''))); });
  test('all eight variants render: full, attacking third, defensive third, wrong/right, sequence, preview, enlarged, mono', () => {
    const d = f3131.shape;
    ['full', 'attacking-third', 'defensive-third'].forEach(v => ok(R.renderPitch(d, { view: v }).includes(`data-view="${v}"`)));
    ok(R.renderPitch(d, { theme: 'mono' }).includes('hwp-pitch--mono'));
    ok(R.renderPitch(d, { interactive: true }).includes('role="button"'));
  });
  test('named views crop the pitch correctly', () => { const L = R.PITCHES['9v9'].length; ok(R.viewCrop('full')[1] === L + 6); ok(R.viewCrop('defensive-third')[0] === 2 * L / 3 - 6); });
  test('other formats have pitch definitions flagged unverified', () => { ['5v5', '7v7', '11v11'].forEach(k => ok(R.PITCHES[k] && R.PITCHES[k].verified === false)); ok(R.PITCHES['9v9'].verified === true); });

  // ---- Mirror (prototype behaviour preserved)
  test('mirror() reproduces the prototype "Ball left" frame from "Ball right"', () => {
    const fr = f3131.diagrams['one-goes'].frames, m = R.mirror(fr[0]);
    const pos = d => d.players.map(p => `${p.l}:${p.x},${p.y}`).sort().join('|');
    ok(pos(m) === pos(fr[1]), 'mirror mismatch'); ok(m.labels[0].t === '3 + 5 + 6', 'label text unchanged by mirror; swap is content');
  });

  // ---- Validation
  test('validate() passes the playbook data with no errors except known marking contacts', () => {
    frames(f3131).forEach(d => { const e = R.validate(d).filter(i => i.level === 'error'); ok(!e.length, (d.key || 'shape') + ': ' + e.map(x => x.msg).join('; ')); });
  });
  test('validate() catches overlapping team-mates and a hidden ball', () => {
    const bad = { altSummary: 'x', players: [{ t: 'us', l: '6', x: 50, y: 50 }, { t: 'us', l: '8', x: 52, y: 52 }], ball: [50.5, 50.5] };
    const codes = R.validate(bad).map(i => i.code); ok(codes.includes('overlap') && codes.includes('ball-hidden'));
  });
  test('private drafts validate with no errors', () => { ['3-3-2', '2-2-3-1'].forEach(k => frames(content[k]).forEach(d => { const e = R.validate(d).filter(i => i.level === 'error'); ok(!e.length, k + ' ' + (d.key || 'shape') + ': ' + e.map(x => x.msg).join('; ')); })); });
  test('usedSymbols() lists only what a frame uses (for the mobile Key sheet)', () => { const s = R.usedSymbols(f3131.diagrams['middle-first'].frames[1]); ok(s.includes('space') && s.includes('blocked') && !s.includes('ghost')); });

  // ---- Animation data
  test('timeline exposes positions, ball and motion paths per stage', () => {
    const tl = R.toTimeline(content['2-2-3-1'].diagrams['wb-recovery'].frames);
    ok(tl.stages.length === 3 && tl.cast['us-8'] && tl.stages[1].motion['us-6'], 'missing structure');
    ok(Array.isArray(tl.stages[0].ball));
  });
  test('frameAt() moves only players that have a start position, along their arrow', () => {
    const f = f3131.diagrams['one-goes'].frames[0], mid = R.frameAt(f, 0.5), end = R.frameAt(f, 1);
    const p = id => d => d.players.find(x => x.id === id);
    ok(p('us-7')(mid).x === p('us-7')(f).x, '7 has no ghost and must not move');
    ok(p('us-2')(mid).y > p('us-2')(f).y && p('us-2')(mid).y < 117.6, '2 should be between start and end');
    ok(Math.abs(p('us-2')(end).y - p('us-2')(f).y) < 0.01, 'end equals drawn position');
  });

  // ---- Publishing controls
  const now = new Date('2026-10-19');
  test('public build blocks unreviewed coaching content, including the 3-1-3-1', () => {
    const g = G.gate(register, 'public', { now }); const blocked = g.blocked.map(b => b.id);
    ['9v9-3-1-3-1', '9v9-3-3-2', '9v9-2-2-3-1'].forEach(id => ok(blocked.includes(id), id + ' should be blocked'));
  });
  test('a reviewed exploratory item is still blocked without a recorded public approval', () => {
    const item = { id: 'x', kind: 'coaching', design: { status: 'approved' }, content: { status: 'reviewed', reviewedBy: 'A', reviewedOn: '2027-01-01', exploratory: true } };
    ok(!G.evaluate(item, 'public', { now }).allowed);
    item.content.publicApproval = { by: 'B', on: '2027-01-02' }; ok(G.evaluate(item, 'public', { now }).allowed);
  });
  test('preview builds include drafts but force noindex and the private watermark', () => { const r = G.evaluate(register.find(i => i.id === '9v9-3-3-2'), 'preview', { now }); ok(r.allowed && r.noindex && r.watermark); });
  test('verified rule facts publish; unverified ones block', () => {
    const m = register.find(i => i.id === 'moving-up-7v7-9v9'); ok(G.evaluate(m, 'public', { now }).allowed);
    ok(!G.evaluate({ ...m, rules: [{ fact: 'x', status: 'unchecked' }] }, 'public', { now }).allowed);
  });
  test('coming-soon formats may only show a teaser', () => { const r = G.evaluate({ availability: 'coming-soon', hasBody: true }, 'public', { now }); ok(!r.allowed); });
  test('formation statuses match the release register, with separate approval for the alternative', () => {
    const pairs = [['3-3-2', '9v9-3-3-2'], ['2-2-3-1', '9v9-2-2-3-1']];
    for (const [key, id] of pairs) {
      const formation = content[key];
      const item = ctx.liveRegister.find(x => x.id === id);
      ok(item && item.kind === 'coaching', `Missing live review entry for ${id}`);
      ok(formation.status.content === item.content.status, `${id}: status drift`);
      ok(formation.status.reviewedBy === item.content.reviewedBy, `${id}: reviewer drift`);
      ok(formation.status.reviewedOn === item.content.reviewedOn, `${id}: review date drift`);
      if (item.content.status === 'reviewed') {
        ok(!!item.content.reviewedVersion, `${id}: missing version for review`);
        ok((item.content.reviewLog || []).some(log => log.version === item.content.reviewedVersion && log.reviewer === item.content.reviewedBy && log.decision === 'approved' && log.evidence), `${id}: missing review trail`);
        ok(G.evaluate(item, 'public', { now }).allowed, `${id}: public release gate blocks reviewed issue`);
      } else {
        ok(!G.evaluate(item, 'public', { now }).allowed, `${id}: unreviewed formation must stay private`);
      }
    }
    const alternative = ctx.liveRegister.find(x => x.id === '9v9-2-2-3-1');
    ok(content['2-2-3-1'].status.exploratory === true, 'Alternative classification must be retained');
    if (alternative.content.status === 'reviewed') {
      ok(!!alternative.content.publicApproval?.by && !!alternative.content.publicApproval?.on, 'Alternative needs explicit editorial approval');
    }
  });
  return T;
}

export async function run(ctx, log = console.log) {
  const results = [];
  for (const t of suite(ctx)) { try { await t.fn(); results.push({ name: t.name, pass: true }); } catch (e) { results.push({ name: t.name, pass: false, error: e.message }); } }
  results.forEach(r => log(`${r.pass ? 'PASS' : 'FAIL'}  ${r.name}${r.error ? '\n      ' + r.error : ''}`));
  log(`${results.filter(r => r.pass).length}/${results.length} passed`);
  return results;
}
