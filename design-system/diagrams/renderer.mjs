/* How We Play tactical diagram renderer v2.0
 * Framework-independent ES module with no dependencies. Pure functions: data in, SVG string out.
 * Preserves the P0/P1 prototype architecture (renderPitch(d, opts) -> SVG string, mirror(), same data schema
 * and coordinates) and adds: token-driven themes, named views, pitch definitions per format, validation,
 * symbol detection for keys, and a timeline API for animation (YouTube Shorts) built from the same data.
 *
 * Coordinates: x 0 (left touchline) to 100 (right). y 0 (opponents' goal line) to pitch.length (our goal line).
 * We always attack UP the page. Units are SVG user units; 108 units = rendered width.
 */

// ---------- Pitch definitions ----------
// 9v9 geometry is the prototype's (measured from the source playbook drawings).
// Other formats are proportional placeholders: verified:false until checked against England Football dimensions.
export const PITCHES = {
  '9v9': { length: 150, centreR: 12.5, box: { w: 54, d: 22 }, goalArea: { w: 24, d: 7.6 }, goal: { w: 12, d: 2.6 }, spot: 15, verified: true, note: 'Prototype geometry (recommended 73 × 46m, drawn at 100 × 150).' },
  '7v7': { length: 149, centreR: 12, box: { w: 50, d: 20 }, goalArea: { w: 0, d: 0 }, goal: { w: 10, d: 2.4 }, spot: 0, verified: false, note: 'Placeholder proportions (55 × 37m). Verify markings.' },
  '5v5': { length: 137, centreR: 11, box: { w: 48, d: 18 }, goalArea: { w: 0, d: 0 }, goal: { w: 10, d: 2.4 }, spot: 0, verified: false, note: 'Placeholder proportions (37 × 27m). Verify markings.' },
  '11v11': { length: 156, centreR: 14, box: { w: 59, d: 25 }, goalArea: { w: 27, d: 8.5 }, goal: { w: 11, d: 2.6 }, spot: 17, verified: false, note: 'Placeholder proportions. Verify markings.' }
};

// Named views (crops). Values are [top, bottom] in pitch units; computed from pitch length.
export function viewCrop(view, pitch = PITCHES['9v9']) {
  if (Array.isArray(view)) return view;
  const L = pitch.length;
  switch (view || 'full') {
    case 'full': return [-6, L + 6];
    case 'attacking-half': return [-6, L / 2 + 15];
    case 'defensive-half': return [L / 2 - 19, L + 6];
    case 'attacking-third': return [-6, L / 3 + 6];
    case 'defensive-third': return [(2 * L) / 3 - 6, L + 6];
    default: throw new Error('Unknown view: ' + view);
  }
}

// ---------- Themes ----------
// mode 'css': elements carry classes (hwp-us, hwp-them…) styled by diagrams/diagram.css from tokens.css.
// mode 'inline': colours written as attributes (for standalone SVG export, print, social, video).
// Build inline colours from tokens with themeFromTokens(resolve(tokens), 'blue').
export function themeFromTokens(flat, name) {
  const pre = 'diagram.theme.' + name + '.';
  const t = {};
  for (const k of Object.keys(flat)) if (k.startsWith(pre)) t[k.slice(pre.length)] = flat[k];
  if (!t.pitch) throw new Error('Theme not found in tokens: ' + name);
  return t;
}

// ---------- Helpers ----------
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const f2 = n => (Math.round(n * 100) / 100).toString();
let uid = 0;

export const SIZES = { r: 4.4, ghostR: 4.1, num: 4.4, num2: 3.5, label: 4.6, lineLabel: 4, arrow: 0.95, line: 0.6, ball: 1.7, posLabel: 3.3, note: 4.8 };

// Quadratic path for an arrow, pulled back from its endpoints (prototype algorithm).
export function arrowGeometry(a) {
  const [x1, y1] = a.f, [x2, y2] = a.to;
  let cx = (x1 + x2) / 2, cy = (y1 + y2) / 2;
  const dx = x2 - x1, dy = y2 - y1, len = Math.hypot(dx, dy) || 1;
  if (a.c) { cx += -dy / len * a.c; cy += dx / len * a.c; }
  const pull = (px, py, qx, qy, d) => { const L = Math.hypot(qx - px, qy - py) || 1; return [px + (qx - px) / L * d, py + (qy - py) / L * d]; };
  const s = pull(x1, y1, cx, cy, a.s != null ? a.s : 4.7), e = pull(x2, y2, cx, cy, a.e != null ? a.e : 5.6);
  return { start: s, control: [cx, cy], end: e, from: a.f, to: a.to };
}
export function pointOnQuad(p0, c, p1, t) {
  const u = 1 - t;
  return [u * u * p0[0] + 2 * u * t * c[0] + t * t * p1[0], u * u * p0[1] + 2 * u * t * c[1] + t * t * p1[1]];
}

// ---------- Renderer ----------
/**
 * renderPitch(d, opts) -> SVG string
 * opts: { theme:'blue'|'light'|'mono', mode:'css'|'inline', colors, pitch:'9v9', view, numbers, labels, notes, pos, spine,
 *         title, desc, interactive (players focusable), progress (0..1 arrow draw-on, for animation), className }
 */
export function renderPitch(d, opts = {}) {
  const pitch = PITCHES[opts.pitch || d.pitch || '9v9'];
  if (!pitch) throw new Error('Unknown pitch: ' + (opts.pitch || d.pitch));
  const L = pitch.length, theme = opts.theme || 'blue', inline = opts.mode === 'inline', c = opts.colors || {};
  if (inline && !c.pitch) throw new Error('inline mode needs opts.colors (use themeFromTokens)');
  const id = (opts.idPrefix || 'hwp') + '-' + (++uid);
  const crop = viewCrop(opts.view || d.view || d.crop || 'full', pitch);
  const num = opts.numbers !== false, S = SIZES;
  // attribute helpers: in css mode use class, in inline mode use colours
  const A = (cls, attrs) => inline ? attrs : `class="${cls}"`;
  const out = [];
  const title = opts.title || d.title || d.caption || '';
  const desc = opts.desc || d.altSummary || d.alt || '';
  out.push(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="-4 ${f2(crop[0])} 108 ${f2(crop[1] - crop[0])}" class="hwp-pitch hwp-pitch--${esc(theme)}${opts.className ? ' ' + esc(opts.className) : ''}" ${opts.interactive ? 'role="group"' : 'role="img"'} aria-labelledby="${id}-t ${id}-d" data-view="${esc(Array.isArray(opts.view) ? 'custom' : (opts.view || 'full'))}">`);
  out.push(`<title id="${id}-t">${esc(title)}</title><desc id="${id}-d">${esc(desc)}</desc>`);
  out.push('<defs>' + ['us', 'them'].map(k => `<marker id="${id}-${k}" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="4.4" markerHeight="4.4" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" ${A('hwp-mk-' + k, `fill="${k === 'us' ? c.us : c.them}"`)}/></marker>`).join('') + '</defs>');
  // pitch
  out.push(`<rect x="-4" y="${f2(crop[0] - 4)}" width="108" height="${f2(crop[1] - crop[0] + 8)}" ${A('hwp-pf', `fill="${c.pitch}"`)}/>`);
  const b = pitch.box, g = pitch.goalArea, gl = pitch.goal, lines = [
    `<rect x="0" y="0" width="100" height="${L}"/>`, `<line x1="0" y1="${L / 2}" x2="100" y2="${L / 2}"/>`, `<circle cx="50" cy="${L / 2}" r="${pitch.centreR}"/>`,
    `<rect x="${f2(50 - b.w / 2)}" y="0" width="${b.w}" height="${b.d}"/>`, `<rect x="${f2(50 - b.w / 2)}" y="${f2(L - b.d)}" width="${b.w}" height="${b.d}"/>`,
    `<rect x="${f2(50 - gl.w / 2)}" y="${-gl.d}" width="${gl.w}" height="${gl.d}"/>`, `<rect x="${f2(50 - gl.w / 2)}" y="${L}" width="${gl.w}" height="${gl.d}"/>`];
  if (g.w) lines.push(`<rect x="${f2(50 - g.w / 2)}" y="0" width="${g.w}" height="${g.d}"/>`, `<rect x="${f2(50 - g.w / 2)}" y="${f2(L - g.d)}" width="${g.w}" height="${g.d}"/>`);
  out.push(`<g ${A('hwp-pl', `fill="none" stroke="${c.line}"`)} stroke-width="${S.line}">${lines.join('')}</g>`);
  const dots = [[50, L / 2, 0.7]]; if (pitch.spot) dots.push([50, pitch.spot, 0.6], [50, L - pitch.spot, 0.6]);
  dots.forEach(([x, y, r]) => out.push(`<circle cx="${x}" cy="${f2(y)}" r="${r}" ${A('hwp-pd', `fill="${c.line}"`)}/>`));
  // highlights
  (d.highlights || []).forEach(h => {
    const sp = h.k === 'space';
    const at = A('hwp-hl hwp-hl--' + (sp ? 'space' : 'gap'), `fill="${sp ? c.space : c.gap}" fill-opacity="${sp ? c['space-opacity'] : c['gap-opacity']}" stroke="${sp ? c['space-edge'] : c['gap-edge']}"`);
    out.push(h.r ? `<rect x="${h.r[0]}" y="${h.r[1]}" width="${h.r[2]}" height="${h.r[3]}" rx="2" ${at} stroke-width=".7" stroke-dasharray="2 1.2"/>`
      : `<circle cx="${h.c[0]}" cy="${h.c[1]}" r="${h.c[2]}" ${at} stroke-width=".7" stroke-dasharray="2 1.2"/>`);
  });
  // contextual lines (e.g. offside, always "to check" until verified)
  (d.lines || []).forEach(l => {
    out.push(`<line x1="0" y1="${l.y}" x2="100" y2="${l.y}" ${A('hwp-line', `stroke="${c.mark}"`)} stroke-width=".5" stroke-dasharray="3 2"/>`);
    if (opts.labels !== false) out.push(`<text x="1" y="${f2(l.y + 6.5)}" font-size="${S.lineLabel}" ${A('hwp-lbl hwp-lbl--line', `fill="${c.mark}" stroke="${c.halo}"`)} stroke-width="1.4" paint-order="stroke" font-family="var(--hwp-font-family-display, 'Big Shoulders Display', sans-serif)" font-weight="800" letter-spacing=".2">${esc(l.t)}</text>`);
  });
  if (d.spine && opts.spine !== false) out.push(`<polyline points="${d.spine.map(p => p.join(',')).join(' ')}" ${A('hwp-spine', `stroke="${c.us}"`)} fill="none" stroke-opacity=".16" stroke-width="7" stroke-linecap="round"/>`);
  // ghosts (started here)
  (d.ghosts || []).forEach(gh => {
    out.push(`<g ${A('hwp-ghost', `opacity=".85"`)} data-player="${esc(gh.id || '')}"><circle cx="${gh.x}" cy="${gh.y}" r="${S.ghostR}" ${inline ? `fill="none" stroke="${c.us}"` : ''} stroke-width=".7" stroke-dasharray="1.6 1.2"/>${num && gh.l ? `<text x="${gh.x}" y="${f2(gh.y + 0.2)}" font-size="${gh.l.length > 1 ? 3.1 : 3.8}" ${inline ? `fill="${c.us}"` : ''} text-anchor="middle" dominant-baseline="central" font-weight="800">${esc(gh.l)}</text>` : ''}</g>`);
  });
  // arrows (progress < 1 draws them partially, for animation)
  const prog = opts.progress == null ? 1 : Math.max(0, Math.min(1, opts.progress));
  (d.arrows || []).forEach(a => {
    if (prog <= 0) return;
    const G = arrowGeometry(a);
    const end = prog < 1 ? pointOnQuad(G.start, G.control, G.end, prog) : G.end;
    const ctl = prog < 1 ? pointOnQuad(G.start, G.control, G.control, prog) : G.control;
    const who = a.t === 'them' ? 'them' : 'us';
    out.push(`<path d="M${f2(G.start[0])} ${f2(G.start[1])} Q${f2(ctl[0])} ${f2(ctl[1])} ${f2(end[0])} ${f2(end[1])}" ${A(`hwp-arr hwp-arr--${a.k === 'pass' ? 'pass' : 'run'} hwp-arr--${who}`, `stroke="${who === 'them' ? c.them : c.us}"`)} fill="none" stroke-width="${S.arrow}" stroke-linecap="round"${a.k === 'pass' ? ' stroke-dasharray="2 1.4"' : ''}${a.noHead ? '' : ` marker-end="url(#${id}-${who})"`}/>`);
    if (a.blocked) out.push(xmark(a.blocked[0], a.blocked[1], A, c));
  });
  (d.marks || []).forEach(k => out.push(xmark(k.x, k.y, A, c)));
  // players
  (d.players || []).forEach(p => {
    const focus = opts.interactive && p.l ? ` tabindex="0" role="button" aria-label="${esc((p.t === 'us' ? 'Our ' : 'Opponent ') + (p.l || ''))}"` : '';
    if (p.t === 'them') {
      const kl = c['them-keyline'];
      out.push(`<g data-player="${esc(p.id || '')}">${inline && kl && kl !== 'none' ? `<circle cx="${p.x}" cy="${p.y}" r="${S.r + 0.9}" fill="none" stroke="${kl}" stroke-width=".6"/>` : (!inline ? `<circle cx="${p.x}" cy="${p.y}" r="${S.r + 0.9}" class="hwp-them-keyline" fill="none" stroke-width=".6"/>` : '')}<circle cx="${p.x}" cy="${p.y}" r="${S.r}" ${A('hwp-them', `fill="${c['them-fill']}" stroke="${c.them}"`)} stroke-width="1.4"/></g>`);
    } else {
      out.push(`<g data-player="${esc(p.id || '')}"${focus}><circle cx="${p.x}" cy="${p.y}" r="${S.r}" ${A('hwp-us', `fill="${c.us}"`)}/>${num && p.l ? `<text x="${p.x}" y="${f2(p.y + 0.25)}" font-size="${p.l.length > 1 ? S.num2 : S.num}" ${A('hwp-us-num', `fill="${c['us-text']}"`)} text-anchor="middle" dominant-baseline="central" font-family="var(--hwp-font-family-sans, 'Schibsted Grotesk', sans-serif)" font-weight="800">${esc(p.l)}</text>` : ''}</g>`);
    }
  });
  if (d.lost) out.push(`<circle cx="${d.lost[0]}" cy="${d.lost[1]}" r="3.4" ${A('hwp-lost', `stroke="${c.them}"`)} fill="none" stroke-width="1.1"/>`);
  if (d.ball) out.push(`<circle cx="${d.ball[0]}" cy="${d.ball[1]}" r="${S.ball}" ${A('hwp-ball', `fill="${c.ball}" stroke="${c.ink}"`)} stroke-width=".6"/>`);
  const lbl = (x, y, t, size, cls, anchor = 'middle', extra = '') => `<text x="${x}" y="${y}" font-size="${size}" text-anchor="${anchor}" ${A('hwp-lbl ' + cls, `fill="${c.label}" stroke="${c.halo}"`)} stroke-width="1.8" stroke-linejoin="round" paint-order="stroke" font-family="var(--hwp-font-family-display, 'Big Shoulders Display', sans-serif)" font-weight="800" letter-spacing=".25"${extra}>${esc(t)}</text>`;
  if (opts.labels !== false) (d.labels || []).forEach(l => out.push(lbl(l.x, l.y, l.t, S.label, '')));
  if (opts.pos) (d.pos || []).forEach(l => out.push(`<text x="${l.x}" y="${l.y}" font-size="${S.posLabel}" text-anchor="middle" ${A('hwp-pos', `fill="${c.label}"`)} font-family="var(--hwp-font-family-display, 'Big Shoulders Display', sans-serif)" font-weight="700" letter-spacing=".3">${esc(l.t)}</text>`));
  if (opts.notes !== false) (d.notes || []).forEach(n => out.push(lbl(n.x, n.y, String(n.t).toUpperCase(), S.note, 'hwp-lbl--note', n.a || 'start')));
  out.push('</svg>');
  return out.join('');
}
function xmark(x, y, A, c) {
  return `<g ${A('hwp-x', `stroke="${c.mark}"`)} stroke-width="1.3" stroke-linecap="round"><line x1="${f2(x - 2.4)}" y1="${f2(y - 2.4)}" x2="${f2(x + 2.4)}" y2="${f2(y + 2.4)}"/><line x1="${f2(x + 2.4)}" y1="${f2(y - 2.4)}" x2="${f2(x - 2.4)}" y2="${f2(y + 2.4)}"/></g>`;
}

// ---------- Mirror (prototype behaviour) ----------
export const DEFAULT_SWAP = { '2': '3', '3': '2', '7': '11', '11': '7' };
export function mirror(src, swap = DEFAULT_SWAP) {
  const m = p => [+(100 - p[0]).toFixed(2), p[1]];
  const sw = l => (l && swap[l]) ? swap[l] : l;
  const o = JSON.parse(JSON.stringify(src));
  o.players = (o.players || []).map(p => ({ ...p, x: +(100 - p.x).toFixed(2), l: sw(p.l), id: p.t === 'us' && p.l ? 'us-' + sw(p.l) : p.id }));
  o.ghosts = (o.ghosts || []).map(g => ({ ...g, x: +(100 - g.x).toFixed(2), l: sw(g.l), id: g.l ? 'us-' + sw(g.l) : g.id }));
  o.ball = o.ball ? m(o.ball) : null;
  if (o.lost) o.lost = m(o.lost);
  o.arrows = (o.arrows || []).map(a => ({ ...a, f: m(a.f), to: m(a.to), c: a.c ? -a.c : 0, blocked: a.blocked ? m(a.blocked) : undefined }));
  o.highlights = (o.highlights || []).map(h => ({ ...h, r: h.r ? [+(100 - h.r[0] - h.r[2]).toFixed(2), h.r[1], h.r[2], h.r[3]] : undefined, c: h.c ? [+(100 - h.c[0]).toFixed(2), h.c[1], h.c[2]] : undefined }));
  o.labels = (o.labels || []).map(l => ({ ...l, x: +(100 - l.x).toFixed(2) }));
  o.marks = (o.marks || []).map(k => ({ ...k, x: +(100 - k.x).toFixed(2) }));
  o.notes = (o.notes || []).map(n => ({ ...n, x: +(100 - n.x).toFixed(2), a: n.a === 'end' ? 'start' : 'end' }));
  return o;
}

// ---------- Validation ----------
/** validate(d, { pitch }) -> [{ level:'error'|'warning', code, msg }] */
export function validate(d, o = {}) {
  const pitch = PITCHES[o.pitch || d.pitch || '9v9'], L = pitch.length, out = [];
  const err = (code, msg) => out.push({ level: 'error', code, msg }), warn = (code, msg) => out.push({ level: 'warning', code, msg });
  if (!(d.altSummary || d.alt)) err('no-alt', 'Missing accessible description (altSummary)');
  const ps = d.players || [];
  ps.forEach(p => { if (p.x < -3 || p.x > 103 || p.y < -6 || p.y > L + 6) err('out-of-bounds', `Player ${p.l || p.id} outside the pitch`); });
  for (let i = 0; i < ps.length; i++) for (let j = i + 1; j < ps.length; j++) {
    const dd = Math.hypot(ps[i].x - ps[j].x, ps[i].y - ps[j].y);
    if (dd < 7) (ps[i].t === ps[j].t ? err : warn)(ps[i].t === ps[j].t ? 'overlap' : 'contact', `Players ${ps[i].l || ps[i].id} and ${ps[j].l || ps[j].id} overlap (${dd.toFixed(1)} units apart, minimum 7)${ps[i].t === ps[j].t ? '' : '. Marking contact: check it reads clearly'}`);
  }
  if (d.ball) ps.forEach(p => { if (Math.hypot(p.x - d.ball[0], p.y - d.ball[1]) < SIZES.r) err('ball-hidden', `Ball is hidden under player ${p.l || p.id}`); });
  const ids = ps.filter(p => p.id).map(p => p.id); const dup = ids.filter((x, i) => ids.indexOf(x) !== i);
  if (dup.length) err('duplicate-id', 'Duplicate player ids: ' + [...new Set(dup)].join(', '));
  (d.ghosts || []).forEach(g => { if (g.id && !ids.includes(g.id)) warn('orphan-ghost', `Start position ${g.l} has no matching player`); });
  (d.highlights || []).forEach((h, i) => {
    const box = h.r ? h.r : [h.c[0] - h.c[2], h.c[1] - h.c[2], h.c[2] * 2, h.c[2] * 2];
    const hasLabel = (d.labels || []).some(l => l.x >= box[0] - 6 && l.x <= box[0] + box[2] + 6 && l.y >= box[1] - 8 && l.y <= box[1] + box[3] + 8);
    if (!hasLabel) warn('unlabelled-area', `Highlighted ${h.k} area ${i + 1} has no label (needed for greyscale and print)`);
  });
  (d.lines || []).forEach(l => { if (!/check/i.test(l.t || '') && !l.verified) warn('unverified-line', `Contextual line "${l.t}" should say "to check" until verified`); });
  return out;
}

// ---------- Key / legend ----------
export const SYMBOLS = {
  us: 'Us', them: 'Them', ball: 'Ball', run: 'Run', pass: 'Pass', ghost: 'Started here', space: 'Key space', gap: 'Gap', blocked: 'Blocked or not here', line: 'Offside line (to check)', lost: 'We lose it'
};
export function usedSymbols(d) {
  const s = new Set();
  (d.players || []).forEach(p => s.add(p.t === 'them' ? 'them' : 'us'));
  if (d.ball) s.add('ball');
  (d.arrows || []).forEach(a => { s.add(a.k === 'pass' ? 'pass' : 'run'); if (a.blocked) s.add('blocked'); });
  if ((d.marks || []).length) s.add('blocked');
  if ((d.ghosts || []).length) s.add('ghost');
  (d.highlights || []).forEach(h => s.add(h.k === 'space' ? 'space' : 'gap'));
  if ((d.lines || []).length) s.add('line');
  if (d.lost) s.add('lost');
  return Object.keys(SYMBOLS).filter(k => s.has(k));
}
/** renderKey(symbols, { theme, mode, colors }) -> HTML string (<ul> of swatches) */
export function renderKey(symbols = Object.keys(SYMBOLS), o = {}) {
  const inline = o.mode === 'inline', c = o.colors || {};
  const A = (cls, attrs) => inline ? attrs : `class="${cls}"`;
  const sw = inner => `<svg viewBox="0 0 22 16" width="22" height="16" aria-hidden="true" focusable="false" class="hwp-pitch hwp-pitch--${esc(o.theme || 'blue')} hwp-key__swatch">${inner}</svg>`;
  const draw = {
    us: () => `<circle cx="11" cy="8" r="6.5" ${A('hwp-us', `fill="${c.us}"`)}/>`,
    them: () => `<circle cx="11" cy="8" r="6" ${A('hwp-them', `fill="${c['them-fill']}" stroke="${c.them}"`)} stroke-width="1.8"/>`,
    ball: () => `<circle cx="11" cy="8" r="3" ${A('hwp-ball', `fill="${c.ball}" stroke="${c.ink}"`)} stroke-width="1"/>`,
    run: () => `<line x1="2" y1="8" x2="16" y2="8" ${A('hwp-arr hwp-arr--us', `stroke="${c.us}"`)} stroke-width="2"/><path d="M15 4l5 4-5 4z" ${A('hwp-mk-us', `fill="${c.us}"`)}/>`,
    pass: () => `<line x1="2" y1="8" x2="16" y2="8" ${A('hwp-arr hwp-arr--us', `stroke="${c.us}"`)} stroke-width="2" stroke-dasharray="3 2"/><path d="M15 4l5 4-5 4z" ${A('hwp-mk-us', `fill="${c.us}"`)}/>`,
    ghost: () => `<circle cx="11" cy="8" r="6" ${A('hwp-ghost-ring', `fill="none" stroke="${c.us}"`)} stroke-width="1.3" stroke-dasharray="2.5 2"/>`,
    space: () => `<rect x="2" y="2" width="18" height="12" rx="2" ${A('hwp-hl hwp-hl--space', `fill="${c.space}" fill-opacity=".4" stroke="${c['space-edge']}"`)} stroke-dasharray="3 2"/>`,
    gap: () => `<rect x="2" y="2" width="18" height="12" rx="2" ${A('hwp-hl hwp-hl--gap', `fill="${c.gap}" fill-opacity=".4" stroke="${c['gap-edge']}"`)} stroke-dasharray="3 2"/>`,
    blocked: () => `<path d="M6 3l10 10M16 3L6 13" ${A('hwp-x', `stroke="${c.mark}"`)} stroke-width="2" stroke-linecap="round"/>`,
    line: () => `<line x1="1" y1="8" x2="21" y2="8" ${A('hwp-line', `stroke="${c.mark}"`)} stroke-width="1.4" stroke-dasharray="3 2"/>`,
    lost: () => `<circle cx="11" cy="8" r="6.6" ${A('hwp-lost', `stroke="${c.them}"`)} fill="none" stroke-width="1.6"/><circle cx="11" cy="8" r="3" ${A('hwp-ball', `fill="${c.ball}" stroke="${c.ink}"`)} stroke-width="1"/>`
  };
  return `<ul class="hwp-key" aria-label="Diagram key">${symbols.map(k => `<li>${sw(draw[k]())}<span>${esc(SYMBOLS[k])}</span></li>`).join('')}</ul>`;
}

// ---------- Timeline (animation-ready) ----------
/**
 * Motion inside one frame: each player with a ghost travels from the ghost to its drawn position,
 * following the matching run arrow's curve when one exists. Nothing is invented: if the data has no
 * ghost or arrow for a player, that player does not move.
 */
export function motionPaths(d) {
  const paths = {};
  (d.ghosts || []).forEach(g => {
    const p = (d.players || []).find(q => q.id && q.id === g.id) || (d.players || []).find(q => q.t === 'us' && q.l === g.l);
    if (!p) return;
    const arrow = (d.arrows || []).find(a => a.k === 'run' && Math.hypot(a.f[0] - g.x, a.f[1] - g.y) < 1.5);
    const G = arrow ? arrowGeometry({ ...arrow, s: 0, e: 0 }) : null;
    paths[p.id || ('us-' + p.l)] = { from: [g.x, g.y], to: [p.x, p.y], control: G ? G.control : [(g.x + p.x) / 2, (g.y + p.y) / 2] };
  });
  return paths;
}
/** frameAt(d, t) -> a diagram object at time t (0..1) inside one frame. Render it with renderPitch(…, { progress: t }). */
export function frameAt(d, t) {
  const o = JSON.parse(JSON.stringify(d)), P = motionPaths(d), k = Math.max(0, Math.min(1, t));
  o.players = (o.players || []).map(p => { const m = P[p.id]; if (!m) return p; const [x, y] = pointOnQuad(m.from, m.control, m.to, ease(k)); return { ...p, x: +x.toFixed(2), y: +y.toFixed(2) }; });
  return o;
}
/**
 * toTimeline(frames) -> { cast, stages:[{ key, positions:{id:[x,y]}, ball, caption, motion }] }
 * Structured data for video tools: every player's position per stage plus in-stage motion paths.
 */
export function toTimeline(frames) {
  const cast = {};
  const stages = frames.map(f => {
    const positions = {};
    (f.players || []).forEach(p => { const id = p.id || (p.t + '-' + p.l); positions[id] = [p.x, p.y]; cast[id] = { team: p.t, label: p.l || null }; });
    return { key: f.key || null, label: f.tab || null, caption: f.caption || null, verdict: f.verdict || null, ball: f.ball || null, positions, motion: motionPaths(f) };
  });
  return { version: 1, cast, stages };
}
/** sequenceAt(frames, s) -> diagram for a float stage index s (e.g. 1.5 = halfway through stage 2's motion). */
export function sequenceAt(frames, s) {
  const i = Math.max(0, Math.min(frames.length - 1, Math.floor(s)));
  return frameAt(frames[i], s - i >= 1 ? 1 : s - i);
}
const ease = t => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
