/* Mailchimp's JSONP signup endpoint can respond with msg: "captcha" and
 * redirect parameters. We keep its security check intact and give the reader
 * a link to finish the challenge on Mailchimp rather than exposing "captcha"
 * as a raw error or trying to bypass verification.
 *
 * This URL is built only on the configured HTTPS Mailchimp endpoint. The
 * provider-supplied query parameters may include the subscriber's email,
 * so the link is shown only to the person who submitted the form.
 */
export function mailchimpCaptchaUrl(action, params) {
  let target;
  try { target = new URL(action); }
  catch { return null; }
  if (target.protocol !== 'https:' || !/(^|\.)list-manage\.com$/i.test(target.hostname) || target.pathname !== '/subscribe/post') return null;
  if (!params || typeof params !== 'object' || Array.isArray(params)) return null;

  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (!key || value == null || (typeof value !== 'string' && typeof value !== 'number')) return null;
    query.append(key, String(value));
  }
  // Existing form action is the trusted source for these audience identifiers.
  for (const key of ['u', 'id']) {
    const original = target.searchParams.get(key);
    if (original) query.set(key, original);
  }
  if (!query.get('u') || !query.get('id')) return null;
  target.search = query.toString();
  target.hash = '';
  return target.href;
}
