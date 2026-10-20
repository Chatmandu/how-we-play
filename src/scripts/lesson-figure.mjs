/* Lesson figure behaviour: one frame at a time, step buttons, keyboard, animated movement.
 * Progressive enhancement over server-rendered panels; with no JavaScript every frame stays visible. */
import { renderPitch, frameAt } from '../../design-system/diagrams/renderer.mjs';

const reduce = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

function draw(stage, frame, t) {
  stage.innerHTML = renderPitch(t >= 1 ? frame : frameAt(frame, t), {
    theme: 'blue', progress: t, labels: t >= 1,
    title: frame.caption, desc: frame.altSummary || frame.alt || frame.caption
  });
}

function play(stage, frame) {
  cancelAnimationFrame(stage._raf);
  const moves = (frame.ghosts || []).length > 0;
  if (reduce() || !moves) { draw(stage, frame, 1); return; }
  const t0 = performance.now(), dur = 1100;
  const step = now => { const t = Math.min(1, (now - t0) / dur); draw(stage, frame, t); if (t < 1) stage._raf = requestAnimationFrame(step); };
  draw(stage, frame, 0);
  stage._raf = requestAnimationFrame(step);
}

export function initLessonFigures(root) {
  root.querySelectorAll('[data-lesson-figure]:not([data-ready])').forEach(el => {
    el.dataset.ready = '1';
    const frames = JSON.parse(el.querySelector('[data-frames]').textContent);
    const panels = [...el.querySelectorAll('[data-panel]')];
    const steps = [...el.querySelectorAll('[data-step]')];
    const live = el.querySelector('[data-live]');
    let current = 0;
    wireEnlarge(el, () => current, panels, frames);
    if (panels.length < 2 || !steps.length) return;
    document.documentElement.classList.add('js-lf');
    el.querySelector('[data-steps]').hidden = false;
    const hint = el.querySelector('[data-hint]'); if (hint) hint.hidden = false;
    const go = (i, { animate = true, announce = true } = {}) => {
      current = i;
      panels.forEach((p, k) => { p.hidden = k !== i; });
      steps.forEach((s, k) => { s.setAttribute('aria-pressed', String(k === i)); s.tabIndex = k === i ? 0 : -1; });
      const stage = panels[i].querySelector('[data-stage]');
      if (animate) play(stage, frames[i]); else draw(stage, frames[i], 1);
      if (announce && live) {
        const v = frames[i].verdict === 'wrong' ? 'Wrong. ' : frames[i].verdict === 'right' ? 'Right. ' : '';
        live.textContent = `Step ${i + 1} of ${frames.length}: ${steps[i].querySelector('b').textContent}. ${v}${frames[i].caption}`;
      }
    };
    steps.forEach((s, i) => {
      s.addEventListener('click', () => go(i));
      /* On narrow screens keep the whole figure in view while stepping, so the control and the picture are seen together. */
      s.addEventListener('focus', () => { const fig = el.querySelector('.lf__fig'); if (matchMedia('(max-width: 899px)').matches && fig.getBoundingClientRect().top < 0) fig.scrollIntoView({ block: 'start', behavior: reduce() ? 'auto' : 'smooth' }); });
      s.addEventListener('keydown', e => {
        const n = steps.length;
        const k = { ArrowDown: i + 1, ArrowRight: i + 1, ArrowUp: i - 1, ArrowLeft: i - 1, Home: 0, End: n - 1 }[e.key];
        if (k === undefined) return;
        e.preventDefault();
        const j = (k + n) % n; steps[j].focus(); go(j);
      });
    });
    go(0, { animate: false, announce: false });
  });
}

/* Enlarge: the current frame, full size, in a modal dialog. Esc or the Close button returns focus to Enlarge. */
function wireEnlarge(el, getCurrent, panels, frames) {
  const btn = el.querySelector('[data-enlarge]');
  if (!btn || typeof HTMLDialogElement === 'undefined') return;
  btn.hidden = false;
  const label = el.querySelector('.lf__head span')?.textContent || 'Diagram';
  btn.addEventListener('click', () => {
    const i = getCurrent(), f = frames[i];
    const d = document.createElement('dialog');
    d.className = 'lf-dialog';
    d.setAttribute('aria-label', `${label}, enlarged`);
    d.innerHTML = `<div class="lf-dialog__in on-pitch"><div class="lf-dialog__bar"><span>${label}${panels.length > 1 ? ` · step ${i + 1} of ${panels.length}` : ''}</span><button type="button" data-close>Close</button></div><div data-big></div><p></p></div>`;
    d.querySelector('[data-big]').innerHTML = renderPitch(f, { theme: 'blue', title: f.caption, desc: f.altSummary || f.alt || f.caption });
    d.querySelector('p').textContent = f.caption;
    document.body.appendChild(d);
    d.querySelector('[data-close]').addEventListener('click', () => d.close());
    d.addEventListener('click', e => { if (e.target === d) d.close(); });
    d.addEventListener('close', () => { d.remove(); btn.focus(); });
    d.showModal();
    d.querySelector('[data-close]').focus();
  });
}
