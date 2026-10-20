/* Homepage design treatments: shared data loading and the animated lesson figure.
 * Uses the real content files and the design-system renderer; nothing here is mock data. */
import { renderPitch, frameAt, renderKey, usedSymbols } from '../design-system/diagrams/renderer.mjs';
export { renderPitch, renderKey, usedSymbols };

export async function load() {
  const j = p => fetch(p).then(r => r.json());
  const [f, site, facts] = await Promise.all([
    j('../content/formations/9v9/3-1-3-1.json'), j('../content/site.json'), j('../content/editorial/format-facts.json')
  ]);
  const fact = id => facts.facts.find(x => x.id === id);
  return { f, site, facts, fact, rule: id => f.rules.find(r => r.id === id), frames: k => f.diagrams[k].frames };
}

export const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const reduce = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

/* Animated lesson figure: draws `frame` and plays the players' movements from their "started here"
 * positions along the source arrows (renderer frameAt + progress). No movement is invented: only
 * players with a ghost in the source data move. */
export function animate(stage, frame, opts = {}) {
  const draw = t => { stage.innerHTML = renderPitch(t >= 1 ? frame : frameAt(frame, t), { theme: opts.theme || 'blue', progress: t, labels: t >= 1, title: frame.caption, desc: frame.altSummary }); };
  if (reduce() || opts.instant) { draw(1); return; }
  const t0 = performance.now(), dur = opts.duration || 1100;
  cancelAnimationFrame(stage._raf);
  const step = now => { const t = Math.min(1, (now - t0) / dur); draw(t); if (t < 1) stage._raf = requestAnimationFrame(step); };
  draw(0);
  stage._raf = requestAnimationFrame(step);
}

/* Lesson stepper: buttons with aria-pressed drive the figure, the caption and the highlighted line. */
export function wireLesson(root, frames) {
  const stage = root.querySelector('[data-stage]'), cap = root.querySelector('[data-cap]'), verdict = root.querySelector('[data-verdict]');
  const steps = [...root.querySelectorAll('[data-step]')];
  const go = (i, instant) => {
    steps.forEach((s, k) => s.setAttribute('aria-pressed', String(k === i)));
    const f = frames[i];
    animate(stage, f, { instant });
    if (cap) cap.textContent = f.caption;
    if (verdict) { verdict.textContent = f.verdict === 'wrong' ? '✕ Wrong' : '✓ Right'; verdict.dataset.v = f.verdict; }
  };
  steps.forEach((s, i) => s.addEventListener('click', () => go(i)));
  steps.forEach((s, i) => s.addEventListener('keydown', e => {
    const n = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[e.key];
    if (n) { e.preventDefault(); const k = (i + n + steps.length) % steps.length; steps[k].focus(); go(k); }
  }));
  go(0, true);
  return go;
}
