/* How We Play behaviours v1.0. Progressive enhancement for components.mjs markup. No dependencies.
 * Call enhance(root = document) once after markup is in the page. Everything works without JS:
 * tabs fall back to the first panel, disclosures are <details>, and forms submit normally.
 */
import { renderPitch, renderKey, frameAt } from '../diagrams/renderer.mjs';

const reduce = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export function enhance(root = document) {
  root.querySelectorAll('[data-hwp="nav-toggle"]').forEach(navToggle);
  root.querySelectorAll('[data-hwp="figure"]').forEach(figure);
  root.querySelectorAll('[data-hwp="checklist"]').forEach(checklist);
  root.querySelectorAll('[data-hwp="newsletter"]').forEach(newsletter);
}

function navToggle(btn) {
  const panel = document.getElementById(btn.getAttribute('aria-controls'));
  btn.addEventListener('click', () => { const open = btn.getAttribute('aria-expanded') === 'true'; btn.setAttribute('aria-expanded', String(!open)); panel.hidden = open; if (!open) { const a = panel.querySelector('a'); a && a.focus(); } });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && btn.getAttribute('aria-expanded') === 'true') { btn.click(); btn.focus(); } });
}

function figure(fig) {
  const data = JSON.parse(fig.querySelector('[data-hwp-frames]').textContent);
  const tabs = [...fig.querySelectorAll('[role="tab"]')], panels = [...fig.querySelectorAll('.hwp-tabpanel')];
  let current = 0, timer = null;
  const select = (i, focus) => {
    current = (i + panels.length) % panels.length;
    tabs.forEach((t, k) => { t.setAttribute('aria-selected', String(k === current)); t.tabIndex = k === current ? 0 : -1; });
    panels.forEach((p, k) => { p.hidden = k !== current; });
    if (focus && tabs[current]) tabs[current].focus();
  };
  tabs.forEach((t, i) => {
    t.addEventListener('click', () => { stop(); select(i); });
    t.addEventListener('keydown', e => {
      const k = { ArrowRight: 1, ArrowLeft: -1, Home: -current, End: tabs.length - 1 - current }[e.key];
      if (k !== undefined) { e.preventDefault(); stop(); select(current + k, true); }
    });
  });
  // Sequence playback uses the same structured data (frameAt), not pre-baked images.
  const animate = (i) => new Promise(res => {
    if (reduce()) { select(i); return res(); }
    select(i);
    const f = data.frames[i], stage = panels[i].querySelector('.hwp-figure__stage'), t0 = performance.now(), dur = 1400;
    const step = now => { const t = Math.min(1, (now - t0) / dur); stage.innerHTML = renderPitch(frameAt(f, t), { theme: data.theme, view: data.view, pitch: data.pitch, progress: t }); if (t < 1 && timer !== 'stop') requestAnimationFrame(step); else res(); };
    requestAnimationFrame(step);
  });
  const play = async () => { timer = 'run'; for (let i = 0; i < panels.length && timer === 'run'; i++) { await animate(i); await new Promise(r => setTimeout(r, reduce() ? 0 : 600)); } timer = null; };
  const stop = () => { timer = timer ? 'stop' : null; };
  const on = (sel, fn) => { const b = fig.querySelector(sel); b && b.addEventListener('click', fn); };
  on('[data-hwp="seq-play"]', () => timer ? stop() : play());
  on('[data-hwp="seq-next"]', () => { stop(); select(current + 1); });
  on('[data-hwp="seq-prev"]', () => { stop(); select(current - 1); });
  on('[data-hwp="enlarge"]', () => openDialog(fig, data, current, select));
  on('[data-hwp="key"]', () => openKey(fig, data, panels[current].dataset.symbols.split(' ').filter(Boolean)));
}

function makeDialog(cls, html, label) {
  const d = document.createElement('dialog');
  d.className = cls; d.setAttribute('aria-label', label); d.innerHTML = html;
  document.body.appendChild(d);
  d.addEventListener('close', () => d.remove());
  d.addEventListener('click', e => { if (e.target === d) d.close(); });
  d.showModal();
  return d;
}
function openDialog(fig, data, index, onChange) {
  let i = index;
  const label = fig.querySelector('.hwp-label') ? fig.querySelector('.hwp-label').textContent : 'Diagram';
  const d = makeDialog('hwp-dialog hwp-on-pitch', `<div class="hwp-dialog__inner"><div class="hwp-dialog__bar"><span class="hwp-label" data-r="title"></span><button class="hwp-btn hwp-btn--on-pitch" data-r="close" autofocus>Close</button></div><div class="hwp-dialog__stage" data-r="stage"></div><div class="hwp-dialog__bar"><button class="hwp-btn hwp-btn--on-pitch" data-r="prev" aria-label="Previous view">‹</button><p class="hwp-caption" data-r="cap" aria-live="polite" style="margin:0;flex:1"></p><button class="hwp-btn hwp-btn--on-pitch" data-r="next" aria-label="Next view">›</button></div></div>`, 'Enlarged diagram: ' + label);
  const q = r => d.querySelector(`[data-r="${r}"]`);
  const draw = () => { const f = data.frames[i]; q('stage').innerHTML = renderPitch(f, { theme: data.theme === 'blue' ? 'blue' : data.theme, view: data.view, pitch: data.pitch, interactive: true }); q('cap').textContent = f.caption || ''; q('title').textContent = (f.tab || label) + (data.frames.length > 1 ? ` · ${i + 1} of ${data.frames.length}` : ''); onChange(i); };
  q('close').addEventListener('click', () => d.close());
  q('prev').addEventListener('click', () => { i = (i - 1 + data.frames.length) % data.frames.length; draw(); });
  q('next').addEventListener('click', () => { i = (i + 1) % data.frames.length; draw(); });
  if (data.frames.length < 2) { q('prev').hidden = true; q('next').hidden = true; }
  draw();
}
function openKey(fig, data, symbols) {
  const d = makeDialog('hwp-sheet hwp-on-pitch', `<div class="hwp-stack"><div class="hwp-dialog__bar"><span class="hwp-label">Key · this diagram</span><button class="hwp-btn hwp-btn--on-pitch" data-r="close" autofocus>Close</button></div>${renderKey(symbols, { theme: 'blue' })}</div>`, 'Diagram key');
  d.querySelector('[data-r="close"]').addEventListener('click', () => d.close());
}

function checklist(el) {
  const key = 'hwp-checklist:' + el.dataset.store, boxes = [...el.querySelectorAll('input[type="checkbox"]')], count = el.querySelector('.hwp-checklist__count');
  let saved = {}; try { saved = JSON.parse(localStorage.getItem(key) || '{}'); } catch (e) { /* storage unavailable */ }
  const update = () => { if (count) count.textContent = `${boxes.filter(b => b.checked).length} of ${boxes.length} done`; };
  boxes.forEach(b => { b.checked = !!saved[b.name]; b.addEventListener('change', () => { saved[b.name] = b.checked; try { localStorage.setItem(key, JSON.stringify(saved)); } catch (e) { /* ignore */ } update(); }); });
  update();
}

function newsletter(form) {
  const email = form.querySelector('input[type="email"]'), consent = form.querySelector('input[name="consent"]');
  const err = (input, msg) => { const box = document.getElementById(input.getAttribute('aria-describedby')); input.setAttribute('aria-invalid', msg ? 'true' : 'false'); if (box) box.textContent = msg ? '⚠ ' + msg : ''; return !msg; };
  form.addEventListener('submit', e => {
    e.preventDefault();
    const okE = err(email, !email.value.trim() ? 'Enter your email address' : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim()) ? 'Enter an email address in the correct format, like name@example.com' : '');
    const okC = err(consent, consent.checked ? '' : 'Tick the box to confirm you want our emails');
    const status = form.querySelector('[data-hwp="nl-status"]');
    if (!okE) email.focus(); else if (!okC) consent.focus();
    status.innerHTML = okE && okC ? '<div class="hwp-feedback hwp-feedback--success" role="status"><span>✓</span><span><strong>Done:</strong> check your inbox to confirm your subscription. (Demo: nothing was sent.)</span></div>' : '';
  });
}
