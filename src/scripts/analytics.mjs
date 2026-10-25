/* How We Play analytics: GA4 with consent first.
 *
 * Nothing loads and nothing is stored by Google until the visitor accepts analytics. The choice is kept in
 * localStorage ('hwp-consent' = 'granted' | 'denied'), which is strictly necessary to remember it. Analytics
 * only ever runs on the production hosts in a public build (window.HWP_ANALYTICS is set by Base.astro).
 *
 * Events (see docs/ANALYTICS.md): page_view (automatic, with page metadata), support_click, newsletter_submit,
 * newsletter_signup, newsletter_error, playbook_download. No emails, names or free text are ever sent. */
const KEY = 'hwp-consent';
const cfg = () => window.HWP_ANALYTICS || null;
const read = () => { try { return localStorage.getItem(KEY); } catch { return null; } };
const write = v => { try { localStorage.setItem(KEY, v); } catch {} };

export const enabled = () => !!cfg() && cfg().hosts.includes(location.hostname);
export const consent = () => read();

let loaded = false;
function load() {
  if (loaded || !enabled()) return;
  loaded = true;
  const id = cfg().id;
  window[`ga-disable-${id}`] = false;
  window.dataLayer = window.dataLayer || [];
  window.gtag = function () { window.dataLayer.push(arguments); };
  window.gtag('consent', 'default', { analytics_storage: 'granted', ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied' });
  window.gtag('js', new Date());
  const meta = document.body.dataset;
  const params = { allow_google_signals: false, allow_ad_personalization_signals: false };
  if (meta.hwpType) params.content_type = meta.hwpType;
  if (meta.hwpFormat) params.format = meta.hwpFormat;
  if (meta.hwpIssue) params.issue_number = Number(meta.hwpIssue);
  if (meta.hwpFormation) params.formation = meta.hwpFormation;
  if (meta.hwpGroup) params.content_group = meta.hwpGroup;
  window.gtag('config', id, params);   // sends the page_view once; the site has no client-side routing
  const s = document.createElement('script');
  s.async = true; s.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(id)}`;
  document.head.appendChild(s);
}

function clearGaCookies() {
  const host = location.hostname.replace(/^www\./, '');
  document.cookie.split(';').map(c => c.trim().split('=')[0]).filter(n => /^_ga/.test(n)).forEach(n => {
    for (const d of ['', `; domain=${host}`, `; domain=.${host}`]) document.cookie = `${n}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/${d}`;
  });
}

export function setConsent(v) {
  write(v);
  if (!enabled()) return;
  if (v === 'granted') load();
  else {
    window[`ga-disable-${cfg().id}`] = true;
    if (window.gtag) window.gtag('consent', 'update', { analytics_storage: 'denied' });
    clearGaCookies();
  }
}

/** Send an event if, and only if, analytics is running. Parameters must never contain personal data. */
export function track(name, params = {}) {
  if (!loaded || !window.gtag || read() !== 'granted') return;
  window.gtag('event', name, params);
}

export function init() {
  if (!enabled()) return;
  if (read() === 'granted') load();
  document.addEventListener('click', e => {
    const a = e.target.closest && e.target.closest('a');
    if (!a) return;
    if (a.dataset.support || /^https:\/\/ko-fi\.com\/howweplayfootball/.test(a.href)) track('support_click', { link_location: a.dataset.support || 'other', link_url: 'https://ko-fi.com/howweplayfootball' });
    if (a.hasAttribute('data-playbook')) track('playbook_download', { formation: a.dataset.playbook, file_name: a.pathname.split('/').pop() });
  });
}
